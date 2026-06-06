import { ClientContactInput, RecruiterContactInput, FormOrigin } from '@jsoft/shared';
export interface ContactFilterInput {
    originType?: FormOrigin;
    page?: number;
    limit?: number;
    search?: string;
    isRead?: boolean;
    isArchived?: boolean;
    isStarred?: boolean;
    label?: string;
}
export declare const contactService: {
    createClientContact(data: ClientContactInput, source: string): Promise<{
        id: string;
        firstName: string;
        lastName: string | null;
        whatsapp: string | null;
        email: string;
        message: string;
        source: string;
        originType: import("@prisma/client").$Enums.FormOrigin;
        readAt: Date | null;
        archived: boolean;
        starred: boolean;
        labels: string[];
        createdAt: Date;
    }>;
    createRecruiterContact(data: RecruiterContactInput): Promise<{
        id: string;
        firstName: string;
        lastName: string | null;
        whatsapp: string | null;
        email: string;
        message: string;
        source: string;
        originType: import("@prisma/client").$Enums.FormOrigin;
        readAt: Date | null;
        archived: boolean;
        starred: boolean;
        labels: string[];
        createdAt: Date;
    }>;
    findAll(filter?: ContactFilterInput): Promise<{
        data: {
            id: string;
            firstName: string;
            lastName: string | null;
            whatsapp: string | null;
            email: string;
            message: string;
            source: string;
            originType: import("@prisma/client").$Enums.FormOrigin;
            readAt: Date | null;
            archived: boolean;
            starred: boolean;
            labels: string[];
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    /**
     * Get a single contact form by ID
     */
    findById(id: string): Promise<{
        id: string;
        firstName: string;
        lastName: string | null;
        whatsapp: string | null;
        email: string;
        message: string;
        source: string;
        originType: import("@prisma/client").$Enums.FormOrigin;
        readAt: Date | null;
        archived: boolean;
        starred: boolean;
        labels: string[];
        createdAt: Date;
    } | null>;
    /**
     * Delete a contact form
     */
    delete(id: string): Promise<{
        id: string;
        firstName: string;
        lastName: string | null;
        whatsapp: string | null;
        email: string;
        message: string;
        source: string;
        originType: import("@prisma/client").$Enums.FormOrigin;
        readAt: Date | null;
        archived: boolean;
        starred: boolean;
        labels: string[];
        createdAt: Date;
    }>;
    /**
     * Mark a contact form as read
     */
    markRead(id: string): Promise<{
        id: string;
        readAt: Date | null;
    }>;
    /**
     * Toggle archive status of a contact form
     */
    toggleArchive(id: string): Promise<{
        id: string;
        archived: boolean;
    }>;
    /**
     * Toggle starred status of a contact form
     */
    toggleStar(id: string): Promise<{
        id: string;
        starred: boolean;
    }>;
    /**
     * Set labels on a contact form
     */
    setLabels(id: string, labels: string[]): Promise<{
        id: string;
        labels: string[];
    }>;
    /**
     * Get contact statistics
     */
    getStats(): Promise<{
        total: number;
        clientCount: number;
        recruiterCount: number;
        recentCount: number;
    }>;
};
//# sourceMappingURL=contact.service.d.ts.map