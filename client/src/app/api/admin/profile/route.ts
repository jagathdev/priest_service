import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // There should only be one admin for now, or we can fetch the first one
    const admin = await db.collection("admins").findOne({});
    
    if (admin) {
      return NextResponse.json({
        name: admin.name || "Admin",
        email: admin.email,
      });
    }

    // Fallback to env variables if no admin is in DB
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@astroved.com';
    
    return NextResponse.json({
      name: "Admin",
      email: adminEmail,
    });
  } catch (error: any) {
    console.error('Admin profile fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { name, email, currentPassword, newPassword } = await req.json();
    
    if (!email || !name) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const client = await clientPromise;
    const db = client.db();
    const existingAdmin = await db.collection("admins").findOne({});
    
    // If they want to change the password, verify the current one first
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to change password" }, { status: 400 });
      }

      let isCurrentPasswordValid = false;

      if (existingAdmin && existingAdmin.password) {
        isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingAdmin.password);
      } else {
        // Fallback check against env variables if no admin is in db
        const envPassword = process.env.ADMIN_PASSWORD || 'astroved_admin_2026';
        if (currentPassword === envPassword) {
          isCurrentPasswordValid = true;
        }
      }

      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
      }
    }

    const updateData: any = {
      name,
      email: normalizedEmail,
      updatedAt: new Date(),
    };

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    if (existingAdmin) {
      await db.collection("admins").updateOne(
        { _id: existingAdmin._id },
        { $set: updateData }
      );
    } else {
      if (!newPassword) {
         // Create the first admin with the default password from env if not changing it
         const adminPassword = process.env.ADMIN_PASSWORD || 'astroved_admin_2026';
         const salt = await bcrypt.genSalt(10);
         updateData.password = await bcrypt.hash(adminPassword, salt);
      }
      updateData.createdAt = new Date();
      await db.collection("admins").insertOne(updateData);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin profile update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
