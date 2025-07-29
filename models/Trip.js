import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  destination: { type: String, required: true },
  country: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  activities: [{ type: String }],
  weather: {
    temperature: Number,
    condition: String,
    description: String,
    humidity: Number,
    windSpeed: Number,
    pressure: Number,
    visibility: Number,
    sunrise: String,
    sunset: String,
    forecast: [{
      date: String,
      temperature: Number,
      condition: String,
      description: String,
      precipitation: Number,
      humidity: Number,
      windSpeed: Number
    }]
  },
  destinationInfo: {
    name: String,
    officialName: String,
    capital: String,
    region: String,
    subregion: String,
    population: Number,
    currencies: [String],
    languages: [String],
    flag: String,
    flagPng: String,
    cca2: String,
    cca3: String,
    callingCodes: [String],
    timezones: [String],
    borders: [String],
    area: Number,
    coordinates: [Number],
    maps: {
      googleMaps: String,
      openStreetMaps: String
    },
    emergencyNumbers: {
      police: String,
      ambulance: String,
      fire: String
    },
    description: String,
    weatherDescription: String,
    popularCities: [String]
  },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  packingList: {
    clothing: [{
      name: String,
      quantity: { type: Number, default: 1 },
      packed: { type: Boolean, default: false }
    }],
    accessories: [{
      name: String,
      packed: { type: Boolean, default: false }
    }],
    essentials: [{
      name: String,
      packed: { type: Boolean, default: false }
    }],
    electronics: [{
      name: String,
      packed: { type: Boolean, default: false }
    }],
    toiletries: [{
      name: String,
      packed: { type: Boolean, default: false }
    }],
    documents: [{
      name: String,
      packed: { type: Boolean, default: false }
    }],
    activities: [{
      name: String,
      packed: { type: Boolean, default: false }
    }]
  },
  status: { type: String, enum: ["upcoming", "past"], default: "upcoming" }
}, { timestamps: true });

export default mongoose.model("Trip", tripSchema); 