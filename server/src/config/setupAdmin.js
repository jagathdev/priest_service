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
                console.warn("[setupAdmin] Invalid ADMIN_EMAIL format.");
                return;
            }

            if (String(adminPassword).length < 8) {
                console.warn("[setupAdmin] ADMIN_PASSWORD must be at least 8 characters. ");
                return;
            }

            const existingAdmin = await Admin.findOne({ email: cleanEmail });
            if (existingAdmin) {
                // Check if the environment password has changed compared to stored hash
                const isMatch = await bcrypt.compare(adminPassword, existingAdmin.passwordHash);
                if (!isMatch) {
                    existingAdmin.passwordHash = await bcrypt.hash(adminPassword, 12);
                    await existingAdmin.save();
                    console.log(`[setupAdmin] Admin password automatically updated from .env for: ${cleanEmail}`);
                }
            } else {
                const passwordHash = await bcrypt.hash(adminPassword, 12);
                await Admin.create({
                    email: cleanEmail,
                    passwordHash,
                    role: 'admin',
                    name: 'Admin'
                });
                console.log(`[setupAdmin] Initial admin account provisioned: ${cleanEmail}`);
            }
        }
    } catch (error) {
        console.error('[setupAdmin] Error setting up admin account:', error.message);
    }
};

export default setupAdmin;
