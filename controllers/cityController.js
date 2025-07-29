export const getCities = async (req, res) => {
    try {
        res.json({ message: "Cities endpoint", data: [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCityById = async (req, res) => {
    try {
        const { id } = req.params;
        res.json({ message: "City by ID", id, data: {} });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
