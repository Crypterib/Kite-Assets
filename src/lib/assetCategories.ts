
'use server';
import prisma from '@/lib/prisma';
import type { AssetCategory } from './types';

export async function getAssetCategoriesForOrg(organizationId: string): Promise<AssetCategory[]> {
    if (!organizationId) return [];
    return prisma.assetCategory.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' },
    });
}

export async function addAssetCategory(name: string, organizationId: string): Promise<AssetCategory | null> {
    if (!name || !organizationId) {
        throw new Error("Name and organization ID are required.");
    }
    try {
        return prisma.assetCategory.create({
            data: {
                name,
                organizationId,
            },
        });
    } catch (error) {
        console.error("Failed to add asset category:", error);
        throw new Error("The database failed to add the asset category. Please try again.");
    }
}

export async function removeAssetCategory(id: string, organizationId: string): Promise<void> {
    try {
        await prisma.assetCategory.delete({
            where: { id, organizationId },
        });
    } catch (error) {
        console.error("Failed to remove asset category:", error);
        throw new Error("The database failed to remove the asset category. It might be in use.");
    }
}
