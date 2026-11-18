/**
 * User & Devotee Profile Type Definitions
 */

export interface DevoteeAddress {
  _id?: string;
  name?: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface FamilyMemberItem {
  _id?: string;
  name: string;
  relationship: string;
  rashi?: string;
  nakshatra?: string;
  gothra?: string;
  dob?: string;
}

export interface DevoteeProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: "user" | "admin" | "superadmin";
  addresses?: DevoteeAddress[];
  familyMembers?: FamilyMemberItem[];
  rashi?: string;
  nakshatra?: string;
  gothra?: string;
  createdAt?: string;
  updatedAt?: string;
}
