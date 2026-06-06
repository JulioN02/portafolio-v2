export interface UploadResult {
    filename: string;
    url: string;
    size: number;
    mimetype: string;
}
export declare const uploadService: {
    /**
     * Save uploaded file — uploads to R2 in production, local disk in dev
     */
    saveFile(file: Express.Multer.File): Promise<UploadResult>;
    /**
     * Delete a file — from R2 or local disk
     */
    deleteFile(filename: string): Promise<void>;
    /**
     * Validate file type and size
     */
    validateFile(file: Express.Multer.File): {
        valid: boolean;
        error?: string;
    };
};
//# sourceMappingURL=upload.service.d.ts.map