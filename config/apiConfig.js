const apiConfig = {
  geoNames: {
    username: process.env.GEO_NAMES_USERNAME || 'demo',
    baseUrl: 'http://api.geonames.org',
    rateLimit: 20000,
    description: 'Free geographical database with extensive country and city data'
  },
  
  countryLayer: {
    apiKey: process.env.COUNTRYLAYER_API_KEY,
    baseUrl: 'http://api.countrylayer.com/v2',
    rateLimit: 1000,
    description: 'Country data with info about currencies, flags, capitals, etc.',
    requiresKey: true
  },
  
  teleport: {
    apiKey: process.env.TELEPORT_API_KEY,
    baseUrl: 'https://api.teleport.org/api',
    rateLimit: 1000,
    description: 'Provides city scores, images, and urban area data',
    requiresKey: false,
    endpoints: {
      urbanAreas: '/urban_areas/',
      cities: '/cities/',
      countries: '/countries/'
    }
  },
  
  rapidApi: {
    apiKey: process.env.RAPIDAPI_KEY,
    baseUrl: 'https://wft-geo-db.p.rapidapi.com/v1',
    rateLimit: 1000,
    description: 'GeoDB Cities API (legacy)',
    requiresKey: true
  }
};

const getApiStatus = () => {
  const status = {};
  
  Object.keys(apiConfig).forEach(apiName => {
    const api = apiConfig[apiName];
    status[apiName] = {
      configured: api.requiresKey ? !!api.apiKey : true,
      description: api.description,
      rateLimit: api.rateLimit
    };
  });
  
  return status;
};

const validateApiKeys = () => {
  const missingKeys = [];
  
  Object.keys(apiConfig).forEach(apiName => {
    const api = apiConfig[apiName];
    if (api.requiresKey && !api.apiKey) {
      missingKeys.push(apiName);
    }
  });
  
  return {
    valid: missingKeys.length === 0,
    missingKeys
  };
};

export { apiConfig, getApiStatus, validateApiKeys }; 