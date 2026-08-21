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
  });

  describe("deleteFile", () => {
    it("deletes via storageService when configured", async () => {
      mockedStorage.isConfigured.mockReturnValue(true);
      mockedStorage.deleteFile.mockResolvedValue(undefined);

      await uploadService.deleteFile("123-photo.png");

      expect(mockedStorage.deleteFile).toHaveBeenCalledWith("123-photo.png");
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

    it("rejects an unsupported extension (e.g. svg)", () => {
      const result = uploadService.validateFile(makeFile({ originalname: "evil.svg" }));
      expect(result.valid).toBe(false);
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