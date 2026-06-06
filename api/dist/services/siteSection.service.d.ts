import { SiteSectionUpdateInput, SiteSectionReorderInput } from '@jsoft/shared';
export declare const siteSectionService: {
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        order: number;
        key: string;
        visible: boolean;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        order: number;
        key: string;
        visible: boolean;
    } | null>;
    reorder(data: SiteSectionReorderInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        order: number;
        key: string;
        visible: boolean;
    }[]>;
    update(id: string, data: SiteSectionUpdateInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        order: number;
        key: string;
        visible: boolean;
    }>;
};
//# sourceMappingURL=siteSection.service.d.ts.map