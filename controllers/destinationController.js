export const getDestinations = async (req, res) => {
    try {
        res.json({ message: "Destinations endpoint", data: [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getDestinationById = async (req, res) => {
    try {
        const { id } = req.params;
        res.json({ message: "Destination by ID", id, data: {} });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
