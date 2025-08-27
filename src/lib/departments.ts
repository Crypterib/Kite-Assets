
'use server';
import prisma from '@/lib/prisma';
import type { Department } from './types';

export async function getDepartments(organizationId: string): Promise<Department[]> {
    if (!organizationId) return [];
    return prisma.department.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' },
    });
}

export async function addDepartment(name: string, organizationId: string): Promise<Department | null> {
    if (!name || !organizationId) {
        throw new Error("Name and organization ID are required.");
    }
    try {
        const newDepartment = await prisma.department.create({
            data: {
                name,
                organizationId,
            },
        });
        return newDepartment;
    } catch (error) {
        console.error("Failed to add department:", error);
        throw new Error("The database failed to add the department. Please try again.");
    }
}

export async function removeDepartment(id: string, organizationId: string): Promise<void> {
    try {
        await prisma.department.delete({
            where: { id, organizationId },
        });
    } catch (error) {
        console.error("Failed to remove department:", error);
        throw new Error("The database failed to remove the department. It might be in use.");
    }
}
