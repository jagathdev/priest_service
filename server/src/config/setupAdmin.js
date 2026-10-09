import User from '../models/user.js';

const setupAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (adminEmail && adminPassword) {
            const admin = await User.findOne({ email: adminEmail, role: 'admin' });
            if (!admin) {
                await User.create({
                    email: adminEmail,
                    password: adminPassword,
                    role: 'admin',
                    mobileNumber: '9360270984',
                    name: 'Admin',
                    isVerified: true
                });
                console.log(`Admin account created with email: ${adminEmail}`);
            } else if (admin.password !== adminPassword) {
                await User.updateOne(
                    { _id: admin._id }, 
                    { $set: { password: adminPassword } }
                );
                console.log(`Admin account password updated for email: ${adminEmail}`);
            }
        }
    } catch (error) {
        console.error('Error setting up admin account:', error);
    }
};

export default setupAdmin;
