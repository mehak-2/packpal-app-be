import express from "express";
import { getCountries, getCountryById, searchCountries } from "../controllers/countryController.js";

const router = express.Router();

router.get("/", getCountries);
router.get("/search", searchCountries);
router.get("/:id", getCountryById);

export default router;