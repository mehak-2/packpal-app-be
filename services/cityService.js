import axios from 'axios';
import { searchCities as searchCitiesFromTeleport } from './teleportService.js';

const GEO_NAMES_USERNAME = process.env.GEO_NAMES_USERNAME || 'demo';
const GEO_NAMES_BASE_URL = 'http://api.geonames.org';

const getMockCities = (limit = 20) => {
  const mockCities = [
    { id: '1', name: 'New York', country: 'United States', countryCode: 'US', region: 'New York', population: 8336817, latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York', fullName: 'New York, New York, United States' },
    { id: '2', name: 'London', country: 'United Kingdom', countryCode: 'GB', region: 'England', population: 8982000, latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', fullName: 'London, England, United Kingdom' },
    { id: '3', name: 'Tokyo', country: 'Japan', countryCode: 'JP', region: 'Tokyo', population: 13929286, latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo', fullName: 'Tokyo, Tokyo, Japan' },
    { id: '4', name: 'Paris', country: 'France', countryCode: 'FR', region: 'Île-de-France', population: 2161000, latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris', fullName: 'Paris, Île-de-France, France' },
    { id: '5', name: 'Sydney', country: 'Australia', countryCode: 'AU', region: 'New South Wales', population: 5312000, latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney', fullName: 'Sydney, New South Wales, Australia' },
    { id: '6', name: 'Toronto', country: 'Canada', countryCode: 'CA', region: 'Ontario', population: 2930000, latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto', fullName: 'Toronto, Ontario, Canada' },
    { id: '7', name: 'Berlin', country: 'Germany', countryCode: 'DE', region: 'Berlin', population: 3669491, latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin', fullName: 'Berlin, Berlin, Germany' },
    { id: '8', name: 'Mumbai', country: 'India', countryCode: 'IN', region: 'Maharashtra', population: 20411274, latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata', fullName: 'Mumbai, Maharashtra, India' },
    { id: '9', name: 'São Paulo', country: 'Brazil', countryCode: 'BR', region: 'São Paulo', population: 12325232, latitude: -23.5505, longitude: -46.6333, timezone: 'America/Sao_Paulo', fullName: 'São Paulo, São Paulo, Brazil' },
    { id: '10', name: 'Cairo', country: 'Egypt', countryCode: 'EG', region: 'Cairo', population: 9539000, latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo', fullName: 'Cairo, Cairo, Egypt' }
  ];
  
  return mockCities.slice(0, limit);
};

const searchCitiesWithFallback = async (query, limit = 10) => {
  try {
    console.log('Attempting to search cities from GeoNames API...');
    const cities = await searchCitiesFromGeoNames(query, limit);
    if (cities.length > 0) {
      return cities;
    }
  } catch (error) {
    console.error('GeoNames API failed:', error.message);
  }

  try {
    console.log('Attempting to search cities from Teleport API...');
    const cities = await searchCitiesFromTeleport(query, limit);
    if (cities.length > 0) {
      return cities;
    }
  } catch (error) {
    console.error('Teleport API failed:', error.message);
  }

  console.log('Using mock data as fallback...');
  const mockCities = getMockCities(limit);
  if (query) {
    const filteredCities = mockCities.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.country.toLowerCase().includes(query.toLowerCase()) ||
      city.region.toLowerCase().includes(query.toLowerCase())
    );
    return filteredCities.slice(0, limit);
  }
  return mockCities;
};

const getPopularCitiesWithFallback = async (limit = 20) => {
  try {
    console.log('Attempting to fetch popular cities from GeoNames API...');
    const cities = await getPopularCitiesFromGeoNames(limit);
    if (cities.length > 0) {
      return cities;
    }
  } catch (error) {
    console.error('GeoNames API failed:', error.message);
  }

  try {
    console.log('Attempting to fetch popular cities from Teleport API...');
    const cities = await getPopularCitiesFromTeleport(limit);
    if (cities.length > 0) {
      return cities;
    }
  } catch (error) {
    console.error('Teleport API failed:', error.message);
  }

  console.log('Using mock data as fallback...');
  return getMockCities(limit);
};

const searchCitiesFromGeoNames = async (query, limit = 10) => {
  console.log(`Searching cities for query: ${query}`);
  
  const response = await axios.get(`${GEO_NAMES_BASE_URL}/searchJSON`, {
    params: {
      q: query,
      featureClass: 'P',
      maxRows: limit,
      username: GEO_NAMES_USERNAME,
      orderby: 'population',
      style: 'FULL'
    }
  });

  if (response.data.status) {
    throw new Error(response.data.status.message);
  }

  if (!response.data.geonames) {
    console.log('No cities found');
    return [];
  }

  console.log(`Found ${response.data.geonames.length} cities`);
  
  return response.data.geonames.map(city => ({
    id: city.geonameId,
    name: city.name,
    country: city.countryName,
    countryCode: city.countryCode,
    region: city.adminName1,
    regionCode: city.adminCode1,
    population: parseInt(city.population) || 0,
    latitude: parseFloat(city.lat),
    longitude: parseFloat(city.lng),
    timezone: city.timezone?.timeZoneId || '',
    wikiDataId: city.geonameId,
    type: 'CITY',
    fullName: `${city.name}, ${city.adminName1}, ${city.countryName}`
  }));
};

const getPopularCitiesFromGeoNames = async (limit = 20) => {
  console.log('Fetching popular cities from GeoNames');
  
  const response = await axios.get(`${GEO_NAMES_BASE_URL}/searchJSON`, {
    params: {
      featureClass: 'P',
      maxRows: limit,
      username: GEO_NAMES_USERNAME,
      orderby: 'population',
      style: 'FULL',
      minPopulation: 1000000
    }
  });

  if (response.data.status) {
    throw new Error(response.data.status.message);
  }

  if (!response.data.geonames) {
    console.log('No popular cities found');
    return [];
  }

  console.log(`Found ${response.data.geonames.length} popular cities`);
  
  return response.data.geonames.map(city => ({
    id: city.geonameId,
    name: city.name,
    country: city.countryName,
    countryCode: city.countryCode,
    region: city.adminName1,
    regionCode: city.adminCode1,
    population: parseInt(city.population) || 0,
    latitude: parseFloat(city.lat),
    longitude: parseFloat(city.lng),
    timezone: city.timezone?.timeZoneId || '',
    fullName: `${city.name}, ${city.adminName1}, ${city.countryName}`
  }));
};

const getPopularCitiesFromTeleport = async (limit = 20) => {
  console.log('Fetching popular cities from Teleport API');
  
  const cities = await searchCitiesFromTeleport('', limit);
  return cities.slice(0, limit);
};

const getCityDetails = async (cityId) => {
  try {
    console.log(`Fetching details for city ID: ${cityId}`);
    
    const response = await axios.get(`${GEO_NAMES_BASE_URL}/getJSON`, {
      params: {
        geonameId: cityId,
        username: GEO_NAMES_USERNAME,
        style: 'FULL'
      }
    });

    if (!response.data) {
      console.log('City not found');
      return null;
    }

    const city = response.data;
    
    return {
      id: city.geonameId,
      name: city.name,
      country: city.countryName,
      countryCode: city.countryCode,
      region: city.adminName1,
      regionCode: city.adminCode1,
      population: parseInt(city.population) || 0,
      latitude: parseFloat(city.lat),
      longitude: parseFloat(city.lng),
      timezone: city.timezone?.timeZoneId || '',
      wikiDataId: city.geonameId,
      type: 'CITY',
      fullName: `${city.name}, ${city.adminName1}, ${city.countryName}`,
      elevation: city.elevation,
      distance: 0
    };
  } catch (error) {
    console.error('Error fetching city details:', error);
    console.error('Error details:', error.response?.data || error.message);
    return null;
  }
};

const getNearbyCities = async (latitude, longitude, radius = 100, limit = 10) => {
  try {
    console.log(`Fetching nearby cities for coordinates: ${latitude}, ${longitude}`);
    
    const response = await axios.get(`${GEO_NAMES_BASE_URL}/findNearbyPlaceNameJSON`, {
      params: {
        lat: latitude,
        lng: longitude,
        radius: radius,
        maxRows: limit,
        username: GEO_NAMES_USERNAME,
        style: 'FULL',
        featureClass: 'P'
      }
    });

    if (!response.data.geonames) {
      console.log('No nearby cities found');
      return [];
    }

    console.log(`Found ${response.data.geonames.length} nearby cities`);
    
    return response.data.geonames.map(city => ({
      id: city.geonameId,
      name: city.name,
      country: city.countryName,
      countryCode: city.countryCode,
      region: city.adminName1,
      regionCode: city.adminCode1,
      population: parseInt(city.population) || 0,
      latitude: parseFloat(city.lat),
      longitude: parseFloat(city.lng),
      timezone: city.timezone?.timeZoneId || '',
      distance: parseFloat(city.distance),
      fullName: `${city.name}, ${city.adminName1}, ${city.countryName}`
    }));
  } catch (error) {
    console.error('Error fetching nearby cities:', error);
    console.error('Error details:', error.response?.data || error.message);
    return [];
  }
};

const getCitiesByCountry = async (countryCode, limit = 20) => {
  try {
    console.log(`Fetching cities for country: ${countryCode}`);
    
    const response = await axios.get(`${GEO_NAMES_BASE_URL}/searchJSON`, {
      params: {
        country: countryCode,
        featureClass: 'P',
        maxRows: limit,
        username: GEO_NAMES_USERNAME,
        orderby: 'population',
        style: 'FULL'
      }
    });

    if (!response.data.geonames) {
      console.log(`No cities found for country: ${countryCode}`);
      return [];
    }

    console.log(`Found ${response.data.geonames.length} cities for ${countryCode}`);
    
    return response.data.geonames.map(city => ({
      id: city.geonameId,
      name: city.name,
      country: city.countryName,
      countryCode: city.countryCode,
      region: city.adminName1,
      regionCode: city.adminCode1,
      population: parseInt(city.population) || 0,
      latitude: parseFloat(city.lat),
      longitude: parseFloat(city.lng),
      timezone: city.timezone?.timeZoneId || '',
      fullName: `${city.name}, ${city.adminName1}, ${city.countryName}`
    }));
  } catch (error) {
    console.error('Error fetching cities by country:', error);
    console.error('Error details:', error.response?.data || error.message);
    return [];
  }
};

export {
  searchCitiesWithFallback,
  getPopularCitiesWithFallback,
  getCityDetails,
  getNearbyCities,
  getCitiesByCountry
}; 