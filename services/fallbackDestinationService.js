import axios from 'axios';

const GEO_NAMES_USERNAME = process.env.GEO_NAMES_USERNAME || 'demo';
const COUNTRYLAYER_API_KEY = process.env.COUNTRYLAYER_API_KEY;
const TELEPORT_API_KEY = process.env.TELEPORT_API_KEY;

const fetchCountriesWithFallback = async () => {
  try {
    console.log('Attempting to fetch countries from GeoNames API...');
    const countries = await fetchCountriesFromGeoNames();
    if (countries.length > 0) {
      return countries;
    }
  } catch (error) {
    console.error('GeoNames API failed:', error.message);
  }

  try {
    console.log('Attempting to fetch countries from CountryLayer API...');
    const countries = await fetchCountriesFromCountryLayer();
    if (countries.length > 0) {
      return countries;
    }
  } catch (error) {
    console.error('CountryLayer API failed:', error.message);
  }

  try {
    console.log('Attempting to fetch countries from Teleport API...');
    const countries = await fetchCountriesFromTeleport();
    if (countries.length > 0) {
      return countries;
    }
  } catch (error) {
    console.error('Teleport API failed:', error.message);
  }

  console.error('All APIs failed, returning empty array');
  return [];
};

const fetchCountriesFromGeoNames = async () => {
  const response = await axios.get('http://api.geonames.org/countryInfoJSON', {
    params: {
      username: GEO_NAMES_USERNAME,
      maxRows: 300
    }
  });

  if (!response.data.geonames) {
    throw new Error('No data received from GeoNames');
  }

  return response.data.geonames.map(country => ({
    name: country.countryName,
    officialName: country.countryName,
    capital: country.capital || '',
    region: getRegionFromContinent(country.continent),
    subregion: country.continent,
    population: parseInt(country.population) || 0,
    currencies: country.currencyCode ? [country.currencyCode] : [],
    languages: [],
    flag: `https://flagcdn.com/${country.countryCode.toLowerCase()}.svg`,
    flagPng: `https://flagcdn.com/w320/${country.countryCode.toLowerCase()}.png`,
    cca2: country.countryCode,
    cca3: country.isoAlpha3,
    callingCodes: [],
    timezones: [],
    borders: [],
    area: parseFloat(country.areaInSqKm) || 0,
    coordinates: [parseFloat(country.lat), parseFloat(country.lng)],
    maps: {
      googleMaps: `https://maps.google.com/?q=${country.lat},${country.lng}`,
      openStreetMaps: `https://www.openstreetmap.org/?mlat=${country.lat}&mlon=${country.lng}`
    },
    emergencyNumbers: getEmergencyNumbers(country.countryCode),
    description: generateDestinationDescription({ region: getRegionFromContinent(country.continent) }),
    weatherDescription: generateWeatherDescription({ region: getRegionFromContinent(country.continent) }),
    popularCities: []
  }));
};

const fetchCountriesFromCountryLayer = async () => {
  if (!COUNTRYLAYER_API_KEY) {
    throw new Error('CountryLayer API key not configured');
  }

  const response = await axios.get(`http://api.countrylayer.com/v2/all`, {
    params: {
      access_key: COUNTRYLAYER_API_KEY
    }
  });

  return response.data.map(country => ({
    name: country.name,
    officialName: country.nativeName,
    capital: country.capital,
    region: getRegionFromContinent(country.region),
    subregion: country.subregion,
    population: country.population,
    currencies: country.currencies ? country.currencies.map(c => c.code) : [],
    languages: country.languages ? country.languages.map(l => l.name) : [],
    flag: country.flag,
    flagPng: country.flag,
    cca2: country.alpha2Code,
    cca3: country.alpha3Code,
    callingCodes: country.callingCodes,
    timezones: country.timezones,
    borders: country.borders,
    area: country.area,
    coordinates: country.latlng,
    maps: {
      googleMaps: country.maps?.googleMaps || '',
      openStreetMaps: country.maps?.openStreetMaps || ''
    },
    emergencyNumbers: getEmergencyNumbers(country.alpha2Code),
    description: generateDestinationDescription({ region: getRegionFromContinent(country.region) }),
    weatherDescription: generateWeatherDescription({ region: getRegionFromContinent(country.region) }),
    popularCities: []
  }));
};

const fetchCountriesFromTeleport = async () => {
  const response = await axios.get('https://api.teleport.org/api/countries/');
  
  const countries = response.data._links['country:items'].map(item => {
    const countryCode = item.href.split('/').pop();
    return {
      name: item.name,
      officialName: item.name,
      capital: '',
      region: getRegionFromContinent(item.href.includes('europe') ? 'EU' : 
                                   item.href.includes('asia') ? 'AS' : 
                                   item.href.includes('americas') ? 'NA' : 
                                   item.href.includes('africa') ? 'AF' : 
                                   item.href.includes('oceania') ? 'OC' : 'AN'),
      subregion: '',
      population: 0,
      currencies: [],
      languages: [],
      flag: `https://flagcdn.com/${countryCode.toLowerCase()}.svg`,
      flagPng: `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`,
      cca2: countryCode,
      cca3: countryCode,
      callingCodes: [],
      timezones: [],
      borders: [],
      area: 0,
      coordinates: [0, 0],
      maps: {
        googleMaps: '',
        openStreetMaps: ''
      },
      emergencyNumbers: getEmergencyNumbers(countryCode),
      description: generateDestinationDescription({ region: 'Unknown' }),
      weatherDescription: generateWeatherDescription({ region: 'Unknown' }),
      popularCities: []
    };
  });

  return countries;
};

const searchCitiesWithFallback = async (query, limit = 10) => {
  try {
    console.log('Attempting to search cities from GeoNames API...');
    const cities = await searchCitiesFromGeoNames(query, limit);
    if (cities.length > 0) {
      return cities;
    }
  } catch (error) {
    console.error('GeoNames city search failed:', error.message);
  }

  try {
    console.log('Attempting to search cities from Teleport API...');
    const cities = await searchCitiesFromTeleport(query, limit);
    if (cities.length > 0) {
      return cities;
    }
  } catch (error) {
    console.error('Teleport city search failed:', error.message);
  }

  return [];
};

const searchCitiesFromGeoNames = async (query, limit = 10) => {
  const response = await axios.get('http://api.geonames.org/searchJSON', {
    params: {
      q: query,
      featureClass: 'P',
      maxRows: limit,
      username: GEO_NAMES_USERNAME,
      orderby: 'population',
      style: 'FULL'
    }
  });

  if (!response.data.geonames) {
    return [];
  }

  return response.data.geonames.map(city => ({
    id: city.geonameId,
    name: city.name,
    country: city.countryName,
    countryCode: city.countryCode,
    region: city.adminName1,
    population: parseInt(city.population) || 0,
    latitude: parseFloat(city.lat),
    longitude: parseFloat(city.lng),
    timezone: city.timezone?.timeZoneId || '',
    fullName: `${city.name}, ${city.adminName1}, ${city.countryName}`
  }));
};

const searchCitiesFromTeleport = async (query, limit = 10) => {
  const response = await axios.get(`https://api.teleport.org/api/cities/?search=${encodeURIComponent(query)}&limit=${limit}`);
  
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
};

const getRegionFromContinent = (continent) => {
  const continentMap = {
    'EU': 'Europe',
    'AS': 'Asia',
    'NA': 'Americas',
    'SA': 'Americas',
    'AF': 'Africa',
    'OC': 'Oceania',
    'AN': 'Antarctica'
  };
  return continentMap[continent] || 'Unknown';
};

const getEmergencyNumbers = (countryCode) => {
  const emergencyNumbers = {
    'US': { police: '911', ambulance: '911', fire: '911' },
    'GB': { police: '999', ambulance: '999', fire: '999' },
    'CA': { police: '911', ambulance: '911', fire: '911' },
    'AU': { police: '000', ambulance: '000', fire: '000' },
    'DE': { police: '110', ambulance: '112', fire: '112' },
    'FR': { police: '17', ambulance: '15', fire: '18' },
    'IT': { police: '113', ambulance: '118', fire: '115' },
    'ES': { police: '091', ambulance: '061', fire: '080' },
    'JP': { police: '110', ambulance: '119', fire: '119' },
    'CN': { police: '110', ambulance: '120', fire: '119' },
    'IN': { police: '100', ambulance: '102', fire: '101' },
    'BR': { police: '190', ambulance: '192', fire: '193' },
    'MX': { police: '911', ambulance: '911', fire: '911' }
  };
  
  return emergencyNumbers[countryCode] || { police: 'N/A', ambulance: 'N/A', fire: 'N/A' };
};

const generateDestinationDescription = (country) => {
  const descriptions = {
    'Europe': 'Explore the rich history, diverse cultures, and stunning architecture of this European destination. From ancient ruins to modern cities, experience the perfect blend of tradition and innovation.',
    'Asia': 'Discover the vibrant culture, ancient traditions, and modern technology of this Asian destination. Experience the perfect balance of historical heritage and contemporary innovation.',
    'Americas': 'Experience the diverse landscapes, rich cultures, and warm hospitality of this American destination. From bustling cities to natural wonders, there\'s something for every traveler.',
    'Africa': 'Immerse yourself in the rich cultural heritage, diverse wildlife, and stunning landscapes of this African destination. Experience authentic local traditions and breathtaking natural beauty.',
    'Oceania': 'Discover the unique culture, pristine beaches, and stunning natural landscapes of this Oceanian destination. Experience the perfect blend of island life and modern amenities.',
    'Antarctica': 'Experience the pristine wilderness and unique ecosystem of Antarctica. This remote destination offers unparalleled natural beauty and scientific exploration opportunities.'
  };
  
  return descriptions[country.region] || `Explore the beautiful ${country.region} region and discover its unique culture, landmarks, and experiences.`;
};

const generateWeatherDescription = (country) => {
  const weatherDescriptions = {
    'Europe': 'Variable weather with seasonal changes. Pack layers and check the forecast for your specific travel dates.',
    'Asia': 'Diverse climate zones with seasonal variations. Research the specific weather patterns for your destination and travel dates.',
    'Americas': 'Varied climate across different regions. Check local weather forecasts and pack accordingly for your specific destination.',
    'Africa': 'Diverse climate from tropical to desert regions. Research the specific weather patterns for your destination and travel season.',
    'Oceania': 'Tropical and temperate climates with seasonal variations. Check local weather forecasts and pack appropriate clothing.',
    'Antarctica': 'Extreme cold weather year-round. Specialized gear and preparation required for this unique destination.'
  };
  
  return weatherDescriptions[country.region] || 'Check the local weather forecast and pack appropriate clothing for your destination.';
};

export {
  fetchCountriesWithFallback,
  searchCitiesWithFallback
}; 