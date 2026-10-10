import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';

const setupAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (adminEmail && adminPassword) {
            const adminCount = await Admin.countDocuments({});
            if (adminCount === 0) {
                const passwordHash = await bcrypt.hash(adminPassword, 12);
                await Admin.create({
                    email: adminEmail,
                    passwordHash,
                    role: 'admin',
                    name: 'Admin'
                });
                console.log(`Admin account created with email: ${adminEmail}`);
            }
            // Do not overwrite existing admin passwords
        }
    } catch (error) {
        console.error('Error setting up admin account:', error);
    }
};

export default setupAdmin;
