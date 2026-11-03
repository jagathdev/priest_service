import mongoose from "mongoose";
import CustomerQuery from "../models/customerQuery.js";


// CREATE CUSTOMER QUERY / COMPLAINT

export const createCustomerQuery = async (req, res) => {
    try {
        const {
            userId,
            name,
            mobileNumber,
            email,
            bookingId,
            subject,
            message,
            consent,
        } = req.body;

        // Name
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        // Mobile number
        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required",
            });
        }

        const mobile = String(mobileNumber).trim();

        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message:
                    "Mobile number must be exactly 10 digits",
            });
        }

        // Email - optional
        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        // Subject
        const allowedSubjects = [
            "Booking Issue",
            "Puja Video Query",
            "Refund/Cancellation",
            "Other",
        ];

        if (!subject) {
            return res.status(400).json({
                success: false,
                message: "Subject is required",
            });
        }

        if (!allowedSubjects.includes(subject)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject",
            });
        }

        // Message
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        if (message.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message:
                    "Message cannot exceed 1000 characters",
            });
        }

        // Consent
        if (consent !== true) {
            return res.status(400).json({
                success: false,
                message:
                    "Please authorize us to contact you",
            });
        }

        // Optional user ID
        let validUserId = null;

        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID",
                });
            }

            validUserId = userId;
        }

        // Create query
        const customerQuery = await CustomerQuery.create({
            userId: validUserId,
            name: name.trim(),
            mobileNumber: mobile,
            email: email?.trim().toLowerCase() || "",
            bookingId: bookingId?.trim() || "",
            subject,
            message: message.trim(),
            consent: true,
            status: "OPEN",
        });

        return res.status(201).json({
            success: true,
            message:
                "Your request has been submitted successfully",
            data: {
                queryId: customerQuery._id,
                status: customerQuery.status,
                createdAt: customerQuery.createdAt,
            },
        });
    } catch (error) {
        console.error(
            "Create Customer Query Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to submit your request",
        });
    }
};

// GET ALL CUSTOMER QUERIES (Admin)
export const getAdminCustomerQueries = async (req, res) => {
    try {
        const { search, status, subject, fromDate, toDate, page = 1, limit = 10, sort = 'latest' } = req.query;

        const query = {};

        if (search && search.trim()) {
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'i');
            query.$or = [
                { name: regex },
                { mobileNumber: regex },
                { email: regex },
                { bookingId: regex },
                { message: regex },
                { subject: regex },
            ];
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        if (subject && subject !== 'All') {
            query.subject = subject;
        }

        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) {
                const start = new Date(fromDate);
                start.setHours(0, 0, 0, 0);
                query.createdAt.$gte = start;
            }
            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 10);
        const skip = (pageNum - 1) * limitNum;

        let sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'name_asc') sortOption = { name: 1 };

        const [queries, totalQueries, openQueries, inProgressQueries, resolvedQueries] = await Promise.all([
            CustomerQuery.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
            CustomerQuery.countDocuments(query),
            CustomerQuery.countDocuments({ status: 'OPEN' }),
            CustomerQuery.countDocuments({ status: 'IN_PROGRESS' }),
            CustomerQuery.countDocuments({ status: 'RESOLVED' }),
        ]);

        return res.status(200).json({
            success: true,
            queries,
            pagination: {
                totalQueries,
                currentPage: pageNum,
                totalPages: Math.ceil(totalQueries / limitNum) || 1,
                limit: limitNum,
            },
            stats: {
                totalQueries,
                openQueries,
                inProgressQueries,
                resolvedQueries,
            },
        });
    } catch (error) {
        console.error('Get Admin Customer Queries Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch customer queries',
        });
    }
};

// UPDATE CUSTOMER QUERY STATUS / REPLY (Admin)
export const updateAdminCustomerQuery = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminReply } = req.body;

        const updateData = {};
        if (status) {
            updateData.status = status;
            if (status === 'RESOLVED' || status === 'CLOSED') {
                updateData.resolvedAt = new Date();
            }
        }
        if (adminReply !== undefined) {
            updateData.adminReply = adminReply;
        }

        const updated = await CustomerQuery.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Query not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Customer query updated successfully',
            query: updated,
        });
    } catch (error) {
        console.error('Update Customer Query Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update query' });
    }
};

// DELETE CUSTOMER QUERY (Admin)
export const deleteAdminCustomerQuery = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await CustomerQuery.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Query not found' });
        }
        return res.status(200).json({
            success: true,
            message: 'Customer query deleted successfully',
        });
    } catch (error) {
        console.error('Delete Customer Query Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete query' });
    }
};

// BULK DELETE CUSTOMER QUERIES (Admin)
export const bulkDeleteAdminCustomerQueries = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No IDs provided' });
        }

        await CustomerQuery.deleteMany({ _id: { $in: ids } });
        return res.status(200).json({
            success: true,
            message: 'Selected customer queries deleted successfully',
        });
    } catch (error) {
        console.error('Bulk Delete Customer Queries Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete queries' });
    }
};
