export declare const r2Service: {
    /**
     * Upload a file to Supabase Storage
     * @param bucket - Module bucket (servicios, productos, herramientas, blog, proyectos, casos-exito, general)
     */
    uploadFile(buffer: Buffer, filename: string, mimetype: string, bucket?: string): Promise<{
        url: string;
        filename: string;
    }>;
    /**
     * Delete a file from Supabase Storage
     */
    deleteFile(filename: string, bucket?: string): Promise<void>;
    /**
     * Get the public URL for a file (no API call needed — URL is deterministic)
     */
    getPublicUrl(filename: string, bucket?: string): string | null;
    /**
     * Check if remote storage is configured
     */
    isConfigured(): boolean;
};
//# sourceMappingURL=r2.service.d.ts.map