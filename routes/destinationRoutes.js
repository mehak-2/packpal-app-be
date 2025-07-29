import express from "express";
import { fetchAllCountriesWithFallback, searchDestinations } from "../services/destinationService.js";

const router = express.Router();

router.get("/countries", async (req, res) => {
  try {
    console.log("GET /api/destinations/countries called");
    const countries = await fetchAllCountriesWithFallback();
    console.log(`Returning ${countries.length} countries`);
    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch countries"
    });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    
    const destinations = await searchDestinations(q);
    res.json({
      success: true,
      data: destinations
    });
  } catch (error) {
    console.error("Error searching destinations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search destinations"
    });
  }
});

export default router; 