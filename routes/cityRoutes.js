import express from "express";
import { 
  searchCitiesWithFallback, 
  getCityDetails, 
  getNearbyCities, 
  getPopularCitiesWithFallback, 
  getCitiesByCountry 
} from "../services/cityService.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    
    console.log(`GET /api/cities/search called with query: ${q}`);
    const cities = await searchCitiesWithFallback(q, parseInt(limit));
    console.log(`Returning ${cities.length} cities`);
    
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error("Error searching cities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search cities"
    });
  }
});

router.get("/popular", async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    console.log("GET /api/cities/popular called");
    const cities = await getPopularCitiesWithFallback(parseInt(limit));
    console.log(`Returning ${cities.length} popular cities`);
    
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error("Error fetching popular cities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular cities"
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`GET /api/cities/${id} called`);
    const city = await getCityDetails(id);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }
    
    res.json({
      success: true,
      data: city
    });
  } catch (error) {
    console.error("Error fetching city details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch city details"
    });
  }
});

router.get("/nearby/:latitude/:longitude", async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const { radius = 100, limit = 10 } = req.query;
    
    console.log(`GET /api/cities/nearby/${latitude}/${longitude} called`);
    const cities = await getNearbyCities(
      parseFloat(latitude), 
      parseFloat(longitude), 
      parseInt(radius), 
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error("Error fetching nearby cities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby cities"
    });
  }
});

router.get("/country/:countryCode", async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { limit = 20 } = req.query;
    
    console.log(`GET /api/cities/country/${countryCode} called`);
    const cities = await getCitiesByCountry(countryCode, parseInt(limit));
    
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error("Error fetching cities by country:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities by country"
    });
  }
});

export default router; 