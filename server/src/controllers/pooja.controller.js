import Pooja from "../models/Pooja.js";

export const getPoojaById = async (req, res) => {
    try {
        const { poojaId } = req.params;

        const pooja = await Pooja.findOne({
            _id: poojaId,
            isActive: true,
        });

        if (!pooja) {
            return res.status(404).json({
                success: false,
                message: "Pooja not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: pooja,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pooja",
            error: error.message,
        });
    }
};