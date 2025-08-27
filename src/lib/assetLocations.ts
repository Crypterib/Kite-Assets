
'use server';
import prisma from '@/lib/prisma';
import type { AssetLocation } from './types';

export async function getAssetLocationsForOrg(organizationId: string): Promise<AssetLocation[]> {
    if (!organizationId) return [];
    return prisma.assetLocation.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' },
    });
}

export async function addAssetLocation(name: string, organizationId: string): Promise<AssetLocation | null> {
    if (!name || !organizationId) {
        throw new Error("Name and organization ID are required.");
    }
    try {
        return prisma.assetLocation.create({
            data: {
                name,
                organizationId,
            },
        });
    } catch (error) {
        console.error("Failed to add asset location:", error);
        throw new Error("The database failed to add the asset location. Please try again.");
    }
}

export async function removeAssetLocation(id: string, organizationId: string): Promise<void> {
    try {
        await prisma.assetLocation.delete({
            where: { id, organizationId },
        });
    } catch (error) {
        console.error("Failed to remove asset location:", error);
        throw new Error("The database failed to remove the asset location. It might be in use.");
    }
}
