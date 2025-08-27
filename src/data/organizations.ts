
'use server';
import prisma from '@/lib/prisma';
import type { User as PrismaUser } from '@prisma/client';
import { addAssetCategory } from '@/lib/assetCategories';
import { addAssetLocation } from '@/lib/assetLocations';
import { addDepartment } from '@/lib/departments';
import { addUser } from './users';
import bcrypt from 'bcryptjs';
import type { Organization, User } from '@/lib/types';


export type NewOrgData = {
    orgName: string;
    userName: string;
    userEmail: string;
    userPassword?: string;
}

export async function getOrganizationById(id: string) {
    return prisma.organization.findUnique({ where: { id } });
}

export async function createOrganizationAndFirstUser(data: NewOrgData): Promise<PrismaUser | null> {
    const existingUser = await prisma.user.findUnique({ where: { email: data.userEmail }});
    if (existingUser) {
        throw new Error(`User with email ${data.userEmail} already exists.`);
    }
    
    if (!data.userPassword) {
        throw new Error("Password is required to create a user.");
    }

    try {
        const organization = await prisma.organization.create({
            data: {
                name: data.orgName,
            }
        });

        const adminDepartment = await addDepartment('Administration', organization.id);
        if (!adminDepartment) {
            throw new Error("Failed to create the initial department for the organization.");
        }
        await addDepartment('Engineering', organization.id);
        await addDepartment('Marketing', organization.id);
        await addDepartment('Finance', organization.id);
        
        const isPlatformAdmin = data.userEmail === process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL;
        
        const user = await addUser({
            name: data.userName,
            email: data.userEmail,
            password: data.userPassword,
            role: isPlatformAdmin ? 'PlatformAdmin' : 'Admin',
            department: adminDepartment.name,
            organizationId: organization.id,
        });

        if (!user) {
            throw new Error("Failed to create the initial user for the organization.");
        }

        // Only create default categories/locations for non-platform-admin orgs
        if (!isPlatformAdmin) {
            await addAssetCategory('Electronics', organization.id);
            await addAssetCategory('Furniture', organization.id);
            await addAssetCategory('Peripherals', organization.id);

            await addAssetLocation('Main Office', organization.id);
            await addAssetLocation('Warehouse', organization.id);
            await addAssetLocation('Remote', organization.id);
        }
        
        return user;

    } catch(error) {
        console.error("Failed to create organization and first user:", error);
        if (error instanceof Error && error.message.includes('already exists')) {
            throw error;
        }
        throw new Error("A database error occurred during organization setup. Please try again.");
    }
}

export async function getAllOrganizations(): Promise<Organization[]> {
    try {
        const organizations = await prisma.organization.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return organizations;
    } catch (error) {
        console.error("Failed to get all organizations:", error);
        throw new Error("Failed to retrieve organization list from the database.");
    }
}
