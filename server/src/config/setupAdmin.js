import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';

const setupAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (adminEmail && adminPassword) {
            const cleanEmail = String(adminEmail).trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                console.warn("[setupAdmin] Invalid ADMIN_EMAIL format. Skipping admin bootstrap.");
                return;
            }

            if (String(adminPassword).length < 8) {
                console.warn("[setupAdmin] ADMIN_PASSWORD must be at least 8 characters. Skipping admin bootstrap.");
                return;
            }

            const adminCount = await Admin.countDocuments({});
            if (adminCount === 0) {
                const passwordHash = await bcrypt.hash(adminPassword, 12);
                await Admin.create({
                    email: cleanEmail,
                    passwordHash,
                    role: 'admin',
                    name: 'Admin'
                });
                console.log(`[setupAdmin] Initial admin account provisioned: ${cleanEmail}`);
            }
            // Do not overwrite existing admin passwords
        }
    } catch (error) {
        console.error('[setupAdmin] Error setting up admin account:', error.message);
    }
};

export default setupAdmin;
