import { fetchAllCountriesWithFallback, searchDestinations } from "../services/destinationService.js";

export const getCountries = async (req, res) => {
    try {
        const countries = await fetchAllCountriesWithFallback();
        res.json({ 
            message: "Countries fetched successfully", 
            data: countries,
            count: countries.length
        });
    } catch (err) {
        console.error("Error fetching countries:", err);
        res.status(500).json({ message: err.message });
    }
};

export const searchCountries = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ 
                message: "Search query too short", 
                data: [],
                count: 0
            });
        }
        
        const results = await searchDestinations(q);
        res.json({ 
            message: "Search completed successfully", 
            data: results,
            count: results.length
        });
    } catch (err) {
        console.error("Error searching countries:", err);
        res.status(500).json({ message: err.message });
    }
};

export const getCountryById = async (req, res) => {
    try {
        const { id } = req.params;
        const countries = await fetchAllCountriesWithFallback();
        const country = countries.find(c => c.id === id || c.code === id);
        
        if (!country) {
            return res.status(404).json({ message: "Country not found" });
        }
        
        res.json({ 
            message: "Country fetched successfully", 
            data: country
        });
    } catch (err) {
        console.error("Error fetching country:", err);
        res.status(500).json({ message: err.message });
    }
};
