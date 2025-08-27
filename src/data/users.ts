
'use server';

import prisma from '@/lib/prisma';
import type { User } from '@/lib/types';
import { createOrganizationAndFirstUser } from './organizations';
import bcrypt from 'bcryptjs';
import type { User as PrismaUser } from '@prisma/client';

async function findUserByEmailWithPassword(email: string) {
  return prisma.user.findFirst({
      where: { email },
      include: { organization: true }
  });
}

export async function login(email: string, password?: string): Promise<User | null> {
  const platformAdminEmail = process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL;
  
  if (!email || !password) return null;
  
  const userWithPassword = await findUserByEmailWithPassword(email);

  if (email === platformAdminEmail && !userWithPassword) {
    // This is a special case for the first-time setup.
    // The platform admin should be created through the registration page
    // using the credentials from the .env file.
    throw new Error(`Platform admin account for ${platformAdminEmail} does not exist. Please use the registration page to create it with the password from your .env file.`);
  }

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, userWithPassword.password);

  if (isPasswordValid) {
    const { password: _, ...userWithoutPassword } = userWithPassword;
    return userWithoutPassword;
  }

  return null;
}

export async function getUsers(organizationId: string): Promise<User[]> {
    if (!organizationId) return [];
    const users = await prisma.user.findMany({
        where: { 
            organizationId,
        },
        orderBy: { name: 'asc' },
        include: { organization: true }
    });
    return users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
}

type AddUserInput = {
    name: string;
    email: string;
    role: "PlatformAdmin" | "Admin" | "Manager" | "Staff";
    department: string;
    password: string;
    organizationId: string;
}

export async function addUser(userData: AddUserInput): Promise<PrismaUser | null> {
    if (!userData.organizationId) {
        throw new Error("An organization ID is required to add a user.");
    }
     const existingUser = await prisma.user.findFirst({ where: { email: userData.email }});
    if (existingUser) {
        throw new Error(`User with email ${userData.email} already exists.`);
    }

    try {
        const hashedPassword = userData.password.startsWith('$2a$') ? userData.password : await bcrypt.hash(userData.password, 10);

        const newUser = await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
                departmentName: userData.department,
                organizationId: userData.organizationId,
            },
            include: { organization: true }
        });
        return newUser;
    } catch(error) {
        console.error("Failed to add user:", error);
        if (error instanceof Error && error.message.includes('already exists')) {
            throw error;
        }
        throw new Error("The database failed to create the user. Please try again.");
    }
}


export async function deleteUser(userId: string, organizationId: string): Promise<void> {
    if (!organizationId) {
        throw new Error("An organization ID is required to delete a user.");
    }

    const userToDelete = await findUserById(userId);
    if (!userToDelete || userToDelete.organizationId !== organizationId) {
        throw new Error("User not found or you do not have permission to delete this user.");
    }

    if (userToDelete.role === 'Admin') {
        const adminCount = await prisma.user.count({
            where: {
                organizationId,
                role: 'Admin',
            }
        });
        if (adminCount <= 1) {
            throw new Error("Cannot delete the last admin of an organization.");
        }
    }

    try {
        await prisma.user.delete({
            where: { id: userId },
        });
    } catch (error) {
        console.error("Failed to delete user:", error);
        throw new Error("The database failed to delete the user. Please try again.");
    }
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({ 
        where: { email },
        include: { organization: true }
    });
    if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
}

export async function updateUser(userId: string, data: Partial<Omit<PrismaUser, 'id'| 'organizationId'>> & {password?: string}): Promise<User | null> {
    const user = await findUserById(userId);
    if (!user) {
        throw new Error("User not found.");
    }
    
    const { password, ...restData } = data;
    const updateData: any = restData;
    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: { organization: true }
        });
        const { password: _, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    } catch (error) {
        console.error("Failed to update user:", error);
        throw new Error("The database failed to update the user profile. Please try again.");
    }
}

export async function findUserById(userId: string): Promise<User | null> {
    const user = await prisma.user.findFirst({ 
        where: { id: userId },
        include: { organization: true }
    });
     if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
}

export async function updateUserPassword(userId: string, newPassword?: string): Promise<User | null> {
    if (!newPassword) {
        throw new Error("A new password must be provided.");
    }
    const user = await findUserById(userId);
    if (!user) {
        throw new Error("User not found.");
    }
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
            include: { organization: true }
        });
        const { password: _, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    } catch(error) {
        console.error("Failed to update password:", error);
        throw new Error("The database failed to update the password. Please try again.");
    }
}
