import { uploadService } from "../services/upload.service";
import { storageService } from "../services/storage.service";

jest.mock("../services/storage.service", () => ({
  storageService: {
    isConfigured: jest.fn(),
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  },
}));

const mockedStorage = storageService as jest.Mocked<typeof storageService>;

const makeFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
  ({
    fieldname: "file",
    originalname: "photo.png",
    encoding: "7bit",
    mimetype: "image/png",
    size: 1024,
    buffer: Buffer.from("data"),
    ...overrides,
  }) as Express.Multer.File;

describe("uploadService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.UPLOAD_BUCKET_ALLOWLIST;
  });

  describe("saveFile", () => {
    it("uploads via storageService when configured", async () => {
      mockedStorage.isConfigured.mockReturnValue(true);
      mockedStorage.uploadFile.mockResolvedValue({ url: "https://cdn/photo.png", filename: "123-photo.png" });

      const result = await uploadService.saveFile(makeFile());

      expect(mockedStorage.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.stringMatching(/^\d+-photo\.png$/),
        "image/png",
        "general",
      );
      expect(mockedStorage.deleteFile).not.toHaveBeenCalled();
      expect(result).toMatchObject({ filename: "123-photo.png", url: "https://cdn/photo.png", size: 1024, mimetype: "image/png" });
    });

    it("writes to local disk when storage is not configured", async () => {
      mockedStorage.isConfigured.mockReturnValue(false);

      const result = await uploadService.saveFile(makeFile({ originalname: "my photo!.png" }));

      expect(result.url).toMatch(/^\/uploads\/\d+-my_photo_\.png$/);
      expect(result.filename).toMatch(/^\d+-my_photo_\.png$/);
    });

    it("stores an allowed bucket upload in the requested bucket (production)", async () => {
      mockedStorage.isConfigured.mockReturnValue(true);
      mockedStorage.uploadFile.mockResolvedValue({ url: "https://cdn/photo.png", filename: "123-photo.png" });

      await uploadService.saveFile(makeFile(), "blog");

      expect(mockedStorage.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.stringMatching(/^\d+-photo\.png$/),
        "image/png",
        "blog",
      );
    });

    it("uses the default bucket when no bucket is provided", async () => {
      mockedStorage.isConfigured.mockReturnValue(true);
      mockedStorage.uploadFile.mockResolvedValue({ url: "https://cdn/photo.png", filename: "123-photo.png" });

      await uploadService.saveFile(makeFile());

      expect(mockedStorage.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.stringMatching(/^\d+-photo\.png$/),
        "image/png",
        "general",
      );
    });

    it("rejects an unknown bucket with 400 (ValidationError)", async () => {
      mockedStorage.isConfigured.mockReturnValue(true);

      await expect(uploadService.saveFile(makeFile(), "unknown")).rejects.toThrow(
        "Unknown bucket",
      );
      expect(mockedStorage.uploadFile).not.toHaveBeenCalled();
    });

    it("rejects a bucket excluded by UPLOAD_BUCKET_ALLOWLIST env override", async () => {
      process.env.UPLOAD_BUCKET_ALLOWLIST = "images,documents";
      mockedStorage.isConfigured.mockReturnValue(true);

      await expect(uploadService.saveFile(makeFile(), "blog")).rejects.toThrow(
        "Unknown bucket",
      );
    });
  });

  describe("deleteFile", () => {
    it("deletes via storageService when configured", async () => {
      mockedStorage.isConfigured.mockReturnValue(true);
      mockedStorage.deleteFile.mockResolvedValue(undefined);

      await uploadService.deleteFile("123-photo.png");

      expect(mockedStorage.deleteFile).toHaveBeenCalledWith("123-photo.png", "general");
    });

    it("forwards the bucket when deleting", async () => {
      mockedStorage.isConfigured.mockReturnValue(true);
      mockedStorage.deleteFile.mockResolvedValue(undefined);

      await uploadService.deleteFile("123-photo.png", "blog");

      expect(mockedStorage.deleteFile).toHaveBeenCalledWith("123-photo.png", "blog");
    });

    it("rejects an unknown bucket on delete with 400", async () => {
      mockedStorage.isConfigured.mockReturnValue(true);

      await expect(uploadService.deleteFile("123-photo.png", "unknown")).rejects.toThrow(
        "Unknown bucket",
      );
    });

    it("removes local file from disk when storage is not configured", async () => {
      mockedStorage.isConfigured.mockReturnValue(false);

      await expect(uploadService.deleteFile("123-photo.png")).resolves.toBeUndefined();
    });
  });

  describe("validateFile", () => {
    it("accepts a valid PNG", () => {
      const result = uploadService.validateFile(makeFile());
      expect(result).toEqual({ valid: true });
    });

    it("rejects an unsupported extension (e.g. svg) with the XSS-safety message", () => {
      const result = uploadService.validateFile(makeFile({ originalname: "evil.svg" }));
      expect(result.valid).toBe(false);
      expect(result.error).toContain("XSS safety");
    });

    it("rejects an unsupported mimetype", () => {
      const result = uploadService.validateFile(makeFile({ mimetype: "application/pdf" }));
      expect(result.valid).toBe(false);
    });

    it("rejects files over 5MB", () => {
      const result = uploadService.validateFile(makeFile({ size: 6 * 1024 * 1024 }));
      expect(result.valid).toBe(false);
    });

    it("rejects files with no extension", () => {
      const result = uploadService.validateFile(makeFile({ originalname: "photo" }));
      expect(result.valid).toBe(false);
    });
  });
});