
import type { Organization as PrismaOrganization, User as PrismaUser, Asset as PrismaAsset, Department as PrismaDepartment, AssetCategory as PrismaAssetCategory, AssetLocation as PrismaAssetLocation } from '@prisma/client';

export type AssetStatus = "InUse" | "InStorage" | "UnderMaintenance" | "Retired";
export type UserRole = "PlatformAdmin" | "Admin" | "Manager" | "Staff";
export type UserStatus = "Active" | "Inactive";

// We can extend the Prisma types if we need to add fields that are not in the DB
export type Asset = PrismaAsset;
export type Department = PrismaDepartment;
export type AssetCategory = PrismaAssetCategory;
export type AssetLocation = PrismaAssetLocation;
export type Organization = PrismaOrganization;

// Define a client-safe User type that omits the password
export type User = Omit<PrismaUser, 'password'> & {
  organization?: Organization;
};
