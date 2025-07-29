import Trip from "../models/Trip.js";
import fetchWeather from "../services/weatherService.js";
import { getDestinationInfo } from "../services/destinationService.js";
import { generatePackingList } from "../services/packingListService.js";

export const getTrips = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    
    const trips = await Trip.find({ userId })
      .sort({ startDate: 1 })
      .populate("collaborators", "name email");

    const upcoming = trips.filter(trip => 
      new Date(trip.startDate) > new Date() || trip.status === "upcoming"
    );
    
    const past = trips.filter(trip => 
      new Date(trip.endDate) < new Date() || trip.status === "past"
    );

    res.json({
      success: true,
      data: {
        upcoming,
        past
      }
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trips"
    });
  }
};

export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    const trip = await Trip.findOne({ _id: id, userId })
      .populate("collaborators", "name email");

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }

    const destinationInfo = await getDestinationInfo(trip.destination, trip.country);
    
    if (destinationInfo) {
      trip.destinationInfo = destinationInfo;
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trip"
    });
  }
};

export const createTrip = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const {
      destination,
      country,
      startDate,
      endDate,
      activities,
      weather,
      collaborators
    } = req.body;

    const weatherData = await fetchWeather(destination, country);
    const destinationInfo = await getDestinationInfo(destination, country);
    
    const tripData = {
      destination,
      country,
      startDate,
      endDate,
      activities,
      weather: weatherData,
      destinationInfo,
      collaborators
    };

    const packingList = generatePackingList(tripData);

    const trip = new Trip({
      userId,
      destination,
      country,
      startDate,
      endDate,
      activities,
      weather: weatherData,
      destinationInfo,
      packingList,
      collaborators
    });

    await trip.save();

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create trip"
    });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;
    const updateData = req.body;

    const trip = await Trip.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    ).populate("collaborators", "name email");

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update trip"
    });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    const trip = await Trip.findOneAndDelete({ _id: id, userId });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }

    res.json({
      success: true,
      message: "Trip deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete trip"
    });
  }
};

export const updatePackingList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;
    const { packingList } = req.body;

    const trip = await Trip.findOneAndUpdate(
      { _id: id, userId },
      { packingList },
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error("Error updating packing list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update packing list"
    });
  }
};

export const regeneratePackingList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    const trip = await Trip.findOne({ _id: id, userId });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }

    const tripData = {
      destination: trip.destination,
      country: trip.country,
      startDate: trip.startDate,
      endDate: trip.endDate,
      activities: trip.activities,
      weather: trip.weather
    };

    const newPackingList = generatePackingList(tripData);

    trip.packingList = newPackingList;
    await trip.save();

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error("Error regenerating packing list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to regenerate packing list"
    });
  }
}; 