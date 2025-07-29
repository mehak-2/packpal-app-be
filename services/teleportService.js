import axios from 'axios';
import { apiConfig } from '../config/apiConfig.js';

const fetchCities = async () => {
  try {
    const response = await axios.get(`${apiConfig.teleport.baseUrl}/urban_areas/`);
    const data = response.data;
    
    if (!data._links || !data._links['ua:item']) {
      console.log('No urban areas found in Teleport API response');
      return [];
    }
    
    return data._links['ua:item'].map((city) => ({
      id: city.href.split('/').pop(),
      name: city.name,
      href: city.href,
      fullName: city.name
    }));
  } catch (error) {
    console.error('Error fetching cities from Teleport API:', error);
    return [];
  }
};

const searchCities = async (query, limit = 10) => {
  try {
    const response = await axios.get(`${apiConfig.teleport.baseUrl}/cities/`, {
      params: {
        search: query,
        limit: limit
      }
    });
    
    if (!response.data._embedded || !response.data._embedded['city:search-results']) {
      return [];
    }
    
    return response.data._embedded['city:search-results'].map(result => {
      const city = result.matching_full_name;
      return {
        id: result._links['city:item'].href.split('/').pop(),
        name: city.split(',')[0],
        country: city.split(',').pop().trim(),
        countryCode: '',
        region: city.split(',').slice(1, -1).join(',').trim(),
        population: 0,
        latitude: 0,
        longitude: 0,
        timezone: '',
        fullName: city
      };
    });
  } catch (error) {
    console.error('Error searching cities from Teleport API:', error);
    return [];
  }
};

const getUrbanAreaDetails = async (urbanAreaId) => {
  try {
    const response = await axios.get(`${apiConfig.teleport.baseUrl}/urban_areas/${urbanAreaId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching urban area details:', error);
    return null;
  }
};

export { fetchCities, searchCities, getUrbanAreaDetails }; 