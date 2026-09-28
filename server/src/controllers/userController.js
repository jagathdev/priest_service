import User from '../models/userModel.js'

// CREATE

export const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            data: "User Created",
            user,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Read

export const readUser = async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json({
            success: true,
            data: users,
        })
        console.log(users)
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getUser = async (req, res) => {
    try {
        const getUser = await User.findById(req.params.id);
        if (!getUser) {
            return res.status(404).json({
                success: false,
                message: "No User Found"
            })
        }
        res.status(200).json({
            success: true,
            message: "User Fetched",
            user: getUser
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error
        })
    }
}
export const getUserQuery = async (req, res) => {
    try {
        const getUser = await User.findById(req.query.id);
        if (!getUser) {
            return res.status(404).json({
                success: false,
                message: "No User Found"
            })
        }
        res.status(200).json({
            success: true,
            message: "User Fetched",
            user: getUser
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error
        })
    }
}