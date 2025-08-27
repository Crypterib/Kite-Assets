
'use server';
import prisma from '@/lib/prisma';
import type { Asset, AssetStatus } from '@/lib/types';

export async function getAssets(organizationId: string): Promise<Asset[]> {
    if (!organizationId) return [];
    return prisma.asset.findMany({
        where: { 
            organizationId
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function addAsset(
    assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'purchaseDate'> & { value: number, status: AssetStatus }, 
    organizationId: string
): Promise<Asset | null> {
    if (!organizationId) {
        throw new Error("An organization ID is required to add an asset.");
    }
    const existingAsset = await prisma.asset.findFirst({
        where: { 
            assetTag: assetData.assetTag,
            organizationId: organizationId,
        }
    });

    if (existingAsset) {
        throw new Error(`An asset with tag "${assetData.assetTag}" already exists.`);
    }

    try {
        const newAsset = await prisma.asset.create({
            data: {
                ...assetData,
                purchaseDate: new Date(),
                organizationId,
            },
        });
        return newAsset;
    } catch (error) {
        console.error("Failed to add asset:", error);
        throw new Error("The database failed to create the asset. Please try again.");
    }
}

export async function updateAsset(
    assetId: string, 
    updatedData: Partial<Omit<Asset, 'id' | 'assetTag' | 'organizationId' | 'purchaseDate' | 'createdAt' | 'updatedAt'>> & { value?: number, status?: AssetStatus }, 
    organizationId: string
): Promise<Asset | null> {
    if (!organizationId) return null;
    
    const asset = await prisma.asset.findUnique({
        where: { id: assetId }
    });

    if (!asset || asset.organizationId !== organizationId) {
        throw new Error("Asset not found or you don't have permission to edit it.");
    }

    try {
        const updatedAsset = await prisma.asset.update({
            where: { id: assetId },
            data: updatedData,
        });
        return updatedAsset;
    } catch (error) {
        console.error("Failed to update asset:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "The database failed to update the asset. Please try again.");
        }
        throw new Error("The database failed to update the asset. Please try again.");
    }
}

export async function deleteAsset(assetId: string, organizationId: string): Promise<void> {
    if (!organizationId) {
        throw new Error("An organization ID is required to delete an asset.");
    }
    
    const asset = await prisma.asset.findUnique({
        where: { id: assetId }
    });

    if (!asset || asset.organizationId !== organizationId) {
        throw new Error("Asset not found or you do not have permission to delete it.");
    }

    try {
        await prisma.asset.delete({
            where: { id: assetId },
        });
    } catch (error) {
        console.error("Failed to delete asset:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "The database failed to delete the asset. It might be in use or have related records.");
        }
        throw new Error("The database failed to delete the asset. It might be in use or have related records.");
    }
}
