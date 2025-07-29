import axios from 'axios';
import { fetchCountriesWithFallback, searchCitiesWithFallback } from './fallbackDestinationService.js';

const GEO_NAMES_USERNAME = process.env.GEO_NAMES_USERNAME || 'demo';
const GEO_NAMES_BASE_URL = 'http://api.geonames.org';

const getMockDestinations = () => {
  const mockCountries = [
    {
      name: 'United States',
      officialName: 'United States of America',
      capital: 'Washington, D.C.',
      region: 'Americas',
      subregion: 'North America',
      population: 331002651,
      currencies: ['USD'],
      languages: ['English'],
      flag: 'https://flagcdn.com/us.svg',
      flagPng: 'https://flagcdn.com/w320/us.png',
      cca2: 'US',
      cca3: 'USA',
      callingCodes: ['1'],
      timezones: ['UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00'],
      borders: ['CAN', 'MEX'],
      area: 9833517,
      coordinates: [38, -97],
      maps: {
        googleMaps: 'https://maps.google.com/?q=38,-97',
        openStreetMaps: 'https://www.openstreetmap.org/?mlat=38&mlon=-97'
      },
      emergencyNumbers: { police: '911', ambulance: '911', fire: '911' },
      description: 'Explore the diverse landscapes and vibrant cities of the United States. From the bustling streets of New York to the natural wonders of the Grand Canyon.',
      weatherDescription: 'The United States experiences diverse weather patterns. Check local forecasts for your specific destination and pack accordingly.',
      popularCities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']
    },
    {
      name: 'United Kingdom',
      officialName: 'United Kingdom of Great Britain and Northern Ireland',
      capital: 'London',
      region: 'Europe',
      subregion: 'Northern Europe',
      population: 67215293,
      currencies: ['GBP'],
      languages: ['English'],
      flag: 'https://flagcdn.com/gb.svg',
      flagPng: 'https://flagcdn.com/w320/gb.png',
      cca2: 'GB',
      cca3: 'GBR',
      callingCodes: ['44'],
      timezones: ['UTC+00:00'],
      borders: ['IRL'],
      area: 242900,
      coordinates: [54, -2],
      maps: {
        googleMaps: 'https://maps.google.com/?q=54,-2',
        openStreetMaps: 'https://www.openstreetmap.org/?mlat=54&mlon=-2'
      },
      emergencyNumbers: { police: '999', ambulance: '999', fire: '999' },
      description: 'Discover the rich history and culture of the United Kingdom. From the historic streets of London to the scenic landscapes of Scotland.',
      weatherDescription: 'The UK has a temperate maritime climate with frequent rain. Pack waterproof clothing and layers for variable weather.',
      popularCities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool']
    },
    {
      name: 'Japan',
      officialName: 'Japan',
      capital: 'Tokyo',
      region: 'Asia',
      subregion: 'Eastern Asia',
      population: 125836021,
      currencies: ['JPY'],
      languages: ['Japanese'],
      flag: 'https://flagcdn.com/jp.svg',
      flagPng: 'https://flagcdn.com/w320/jp.png',
      cca2: 'JP',
      cca3: 'JPN',
      callingCodes: ['81'],
      timezones: ['UTC+09:00'],
      borders: [],
      area: 377975,
      coordinates: [36, 138],
      maps: {
        googleMaps: 'https://maps.google.com/?q=36,138',
        openStreetMaps: 'https://www.openstreetmap.org/?mlat=36&mlon=138'
      },
      emergencyNumbers: { police: '110', ambulance: '119', fire: '119' },
      description: 'Experience the perfect blend of tradition and modernity in Japan. From ancient temples to cutting-edge technology.',
      weatherDescription: 'Japan has four distinct seasons. Spring brings cherry blossoms, summer is hot and humid, autumn is mild, and winter can be cold with snow.',
      popularCities: ['Tokyo', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka']
    },
    {
      name: 'France',
      officialName: 'French Republic',
      capital: 'Paris',
      region: 'Europe',
      subregion: 'Western Europe',
      population: 67391582,
      currencies: ['EUR'],
      languages: ['French'],
      flag: 'https://flagcdn.com/fr.svg',
      flagPng: 'https://flagcdn.com/w320/fr.png',
      cca2: 'FR',
      cca3: 'FRA',
      callingCodes: ['33'],
      timezones: ['UTC+01:00'],
      borders: ['AND', 'BEL', 'DEU', 'ITA', 'LUX', 'MCO', 'ESP', 'CHE'],
      area: 551695,
      coordinates: [46, 2],
      maps: {
        googleMaps: 'https://maps.google.com/?q=46,2',
        openStreetMaps: 'https://www.openstreetmap.org/?mlat=46&mlon=2'
      },
      emergencyNumbers: { police: '17', ambulance: '15', fire: '18' },
      description: 'Immerse yourself in the art, culture, and cuisine of France. From the romantic streets of Paris to the beautiful French Riviera.',
      weatherDescription: 'France has a varied climate. Northern regions are cooler, while the south enjoys a Mediterranean climate with hot summers.',
      popularCities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice']
    },
    {
      name: 'Australia',
      officialName: 'Commonwealth of Australia',
      capital: 'Canberra',
      region: 'Oceania',
      subregion: 'Australia and New Zealand',
      population: 25499884,
      currencies: ['AUD'],
      languages: ['English'],
      flag: 'https://flagcdn.com/au.svg',
      flagPng: 'https://flagcdn.com/w320/au.png',
      cca2: 'AU',
      cca3: 'AUS',
      callingCodes: ['61'],
      timezones: ['UTC+05:00', 'UTC+06:30', 'UTC+07:00', 'UTC+08:00', 'UTC+09:30', 'UTC+10:00', 'UTC+10:30', 'UTC+11:00'],
      borders: [],
      area: 7692024,
      coordinates: [-27, 133],
      maps: {
        googleMaps: 'https://maps.google.com/?q=-27,133',
        openStreetMaps: 'https://www.openstreetmap.org/?mlat=-27&mlon=133'
      },
      emergencyNumbers: { police: '000', ambulance: '000', fire: '000' },
      description: 'Explore the vast landscapes and unique wildlife of Australia. From the iconic Sydney Opera House to the stunning Great Barrier Reef.',
      weatherDescription: 'Australia has diverse climates. The north is tropical, the center is arid, and the south has temperate weather. Seasons are opposite to the Northern Hemisphere.',
      popularCities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide']
    }
  ];

  const mockCities = [
    {
      name: 'New York',
      officialName: 'New York, New York, United States',
      capital: 'New York',
      region: 'New York',
      subregion: 'New York',
      population: 8336817,
      currencies: ['USD'],
      languages: ['English'],
      flag: '',
      flagPng: '',
      cca2: 'US',
      cca3: 'USA',
      callingCodes: ['1'],
      timezones: ['America/New_York'],
      borders: [],
      area: 0,
      coordinates: [40.7128, -74.0060],
      maps: {
        googleMaps: 'https://maps.google.com/?q=40.7128,-74.0060',
        openStreetMaps: 'https://www.openstreetmap.org/?mlat=40.7128&mlon=-74.0060'
      },
      emergencyNumbers: { police: '911', ambulance: '911', fire: '911' },
      description: 'Experience the vibrant energy of New York City. From Times Square to Central Park, discover the city that never sleeps.',
      weatherDescription: 'New York has four distinct seasons. Summers are hot and humid, winters are cold with snow, and spring and fall are mild.',
      popularCities: ['New York'],
      isCity: true,
      cityId: '1',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    },
    {
      name: 'London',
      officialName: 'London, England, United Kingdom',
      capital: 'London',
      region: 'England',
      subregion: 'England',
      population: 8982000,
      currencies: ['GBP'],
      languages: ['English'],
      flag: '',
      flagPng: '',
      cca2: 'GB',
      cca3: 'GBR',
      callingCodes: ['44'],
      timezones: ['Europe/London'],
      borders: [],
      area: 0,
      coordinates: [51.5074, -0.1278],
      maps: {
        googleMaps: 'https://maps.google.com/?q=51.5074,-0.1278',
        openStreetMaps: 'https://www.openstreetmap.org/?mlat=51.5074&mlon=-0.1278'
      },
      emergencyNumbers: { police: '999', ambulance: '999', fire: '999' },
      description: 'Discover the rich history and culture of London. From Buckingham Palace to the Tower of London, explore centuries of British heritage.',
      weatherDescription: 'London has a temperate maritime climate with frequent rain throughout the year. Pack waterproof clothing and layers.',
      popularCities: ['London'],
      isCity: true,
      cityId: '2',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London'
    }
  ];

  return [...mockCountries, ...mockCities];
};

const fetchAllCountriesWithFallback = async () => {
  try {
    console.log('Fetching countries with fallback APIs...');
    
    const countries = await fetchCountriesWithFallback();
    
    if (countries.length > 0) {
      console.log(`Fetched ${countries.length} countries from APIs`);
      return countries;
    }
  } catch (error) {
    console.error('All APIs failed:', error.message);
  }

  console.log('Using mock data as fallback...');
  return getMockDestinations();
};

const getPopularCitiesFromGeoNames = async (countryCode, maxRows = 10) => {
  try {
    const params = {
      featureClass: 'P',
      maxRows,
      username: GEO_NAMES_USERNAME,
      orderby: 'population',
      style: 'FULL'
    };
    
    if (countryCode) {
      params.country = countryCode;
    }
    
    const response = await axios.get(`${GEO_NAMES_BASE_URL}/searchJSON`, { params });
    
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
  } catch (err) {
    console.error('Error fetching cities from GeoNames:', err);
    return [];
  }
};

const searchCitiesFromGeoNames = async (query, limit = 10) => {
  try {
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
  } catch (err) {
    console.error('Error searching cities from GeoNames:', err);
    return [];
  }
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
    'MX': { police: '911', ambulance: '911', fire: '911' },
    'AR': { police: '101', ambulance: '107', fire: '100' },
    'CL': { police: '133', ambulance: '131', fire: '132' },
    'CO': { police: '123', ambulance: '123', fire: '123' },
    'PE': { police: '105', ambulance: '106', fire: '116' },
    'VE': { police: '171', ambulance: '171', fire: '171' },
    'EC': { police: '101', ambulance: '131', fire: '102' },
    'BO': { police: '110', ambulance: '118', fire: '119' },
    'PY': { police: '911', ambulance: '141', fire: '132' },
    'UY': { police: '911', ambulance: '911', fire: '911' },
    'GY': { police: '911', ambulance: '913', fire: '912' },
    'SR': { police: '115', ambulance: '113', fire: '110' },
    'GF': { police: '17', ambulance: '15', fire: '18' },
    'FK': { police: '999', ambulance: '999', fire: '999' },
    'GS': { police: '999', ambulance: '999', fire: '999' },
    'AQ': { police: 'N/A', ambulance: 'N/A', fire: 'N/A' },
    'TF': { police: '17', ambulance: '15', fire: '18' },
    'IO': { police: '999', ambulance: '999', fire: '999' },
    'PN': { police: '999', ambulance: '999', fire: '999' },
    'SH': { police: '999', ambulance: '999', fire: '999' },
    'TC': { police: '911', ambulance: '911', fire: '911' },
    'VG': { police: '911', ambulance: '911', fire: '911' },
    'VI': { police: '911', ambulance: '911', fire: '911' },
    'AI': { police: '911', ambulance: '911', fire: '911' },
    'AW': { police: '100', ambulance: '911', fire: '911' },
    'BB': { police: '211', ambulance: '511', fire: '311' },
    'BZ': { police: '911', ambulance: '911', fire: '911' },
    'BM': { police: '911', ambulance: '911', fire: '911' },
    'CA': { police: '911', ambulance: '911', fire: '911' },
    'CR': { police: '911', ambulance: '911', fire: '911' },
    'CU': { police: '106', ambulance: '104', fire: '105' },
    'DM': { police: '999', ambulance: '999', fire: '999' },
    'DO': { police: '911', ambulance: '911', fire: '911' },
    'SV': { police: '911', ambulance: '911', fire: '911' },
    'GD': { police: '911', ambulance: '434', fire: '434' },
    'GT': { police: '110', ambulance: '122', fire: '123' },
    'HT': { police: '114', ambulance: '116', fire: '115' },
    'HN': { police: '199', ambulance: '195', fire: '198' },
    'JM': { police: '119', ambulance: '110', fire: '110' },
    'MX': { police: '911', ambulance: '911', fire: '911' },
    'NI': { police: '118', ambulance: '128', fire: '115' },
    'PA': { police: '104', ambulance: '911', fire: '103' },
    'PR': { police: '911', ambulance: '911', fire: '911' },
    'KN': { police: '911', ambulance: '911', fire: '911' },
    'LC': { police: '911', ambulance: '911', fire: '911' },
    'VC': { police: '911', ambulance: '911', fire: '911' },
    'TT': { police: '999', ambulance: '811', fire: '990' },
    'US': { police: '911', ambulance: '911', fire: '911' }
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

const generatePopularCities = (country) => {
  const popularCities = {
    'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
    'GB': ['London', 'Birmingham', 'Leeds', 'Glasgow', 'Sheffield', 'Bradford', 'Edinburgh', 'Liverpool', 'Manchester', 'Bristol'],
    'CA': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
    'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'],
    'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
    'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
    'IT': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania'],
    'ES': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
    'JP': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama'],
    'CN': ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Tianjin', 'Chongqing', 'Nanjing', 'Wuhan', 'Xi\'an'],
    'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur'],
    'BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
    'MX': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Ciudad Juárez', 'León', 'Zapopan', 'Nezahualcóyotl', 'Guadalupe'],
    'AR': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'San Miguel de Tucumán', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan'],
    'CL': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Viña del Mar', 'Temuco', 'Rancagua', 'Iquique', 'Arica'],
    'CO': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué'],
    'PE': ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Chimbote', 'Huancayo', 'Tacna'],
    'VE': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'Petare', 'Maturín', 'Barcelona', 'Turmero'],
    'EC': ['Guayaquil', 'Quito', 'Cuenca', 'Santo Domingo', 'Machala', 'Durán', 'Manta', 'Portoviejo', 'Loja', 'Ambato'],
    'BO': ['Santa Cruz de la Sierra', 'El Alto', 'La Paz', 'Cochabamba', 'Oruro', 'Sucre', 'Tarija', 'Potosí', 'Sacaba', 'Montero'],
    'PY': ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá', 'Lambaré', 'Fernando de la Mora', 'Limpio', 'Ñemby', 'Encarnación'],
    'UY': ['Montevideo', 'Salto', 'Ciudad de la Costa', 'Paysandú', 'Las Piedras', 'Rivera', 'Maldonado', 'Tacuarembó', 'Melo', 'Mercedes'],
    'GY': ['Georgetown', 'Linden', 'New Amsterdam', 'Rose Hall', 'Corriverton', 'Anna Regina', 'Bartica', 'Skeldon', 'Rosignol', 'Mahaica'],
    'SR': ['Paramaribo', 'Lelydorp', 'Brokopondo', 'Nieuw Nickerie', 'Moengo', 'Nieuw Amsterdam', 'Mariënburg', 'Wageningen', 'Albina', 'Groningen'],
    'GF': ['Cayenne', 'Matoury', 'Saint-Laurent-du-Maroni', 'Kourou', 'Remire-Montjoly', 'Macouria', 'Apatou', 'Grand-Santi', 'Papaïchton', 'Saint-Georges'],
    'FK': ['Stanley', 'Goose Green', 'Port Howard', 'Port San Carlos', 'San Carlos', 'Port Louis', 'Bluff Cove', 'Chartres', 'Salvador', 'Darwin'],
    'GS': ['Grytviken', 'King Edward Point', 'Cumberland Bay', 'Stromness', 'Husvik', 'Leith Harbour', 'Ocean Harbour', 'Prince Olav Harbour', 'Godthul', 'Grytviken'],
    'AQ': ['McMurdo Station', 'Amundsen-Scott South Pole Station', 'Palmer Station', 'Rothera Research Station', 'Vostok Station', 'Concordia Station', 'Dumont d\'Urville Station', 'Mawson Station', 'Davis Station', 'Casey Station'],
    'TF': ['Saint-Pierre', 'Port-aux-Français', 'Alfred Faure', 'La Roche Godon', 'Cap Ratmanoff', 'Pointe des Cascades', 'Port-Jeanne-d\'Arc', 'Baie de l\'Oiseau', 'Anse des Pétrels', 'Cap des Aiguilles'],
    'IO': ['Diego Garcia', 'Peros Banhos', 'Salomon Islands', 'Egmont Islands', 'Three Brothers', 'Nelson Island', 'Eagle Island', 'Danger Island', 'Six Islands', 'Pitt Island'],
    'PN': ['Adamstown', 'Bounty Bay', 'Down Rope', 'The Landing', 'The Rope', 'The Edge', 'The Ridge', 'The Valley', 'The Gap', 'The Point'],
    'SH': ['Jamestown', 'Georgetown', 'Edinburgh of the Seven Seas', 'Longwood', 'Half Tree Hollow', 'Blue Hill', 'Sandy Bay', 'Levelwood', 'Saint Paul\'s', 'Alarm Forest'],
    'TC': ['Cockburn Town', 'Balfour Town', 'Blue Hills', 'Five Cays', 'Leeward', 'Long Bay', 'North Caicos', 'Providenciales', 'South Caicos', 'West Caicos'],
    'VG': ['Road Town', 'Spanish Town', 'The Settlement', 'Great Harbour', 'Little Harbour', 'Cane Garden Bay', 'Carrot Bay', 'Brewers Bay', 'Apple Bay', 'Long Bay'],
    'VI': ['Charlotte Amalie', 'Christiansted', 'Frederiksted', 'Cruz Bay', 'Coral Bay', 'Red Hook', 'Charlotte Amalie West', 'East End', 'Northside', 'Southside'],
    'AI': ['The Valley', 'Blowing Point', 'Sandy Ground', 'Shoal Bay Village', 'Island Harbour', 'Stoney Ground', 'North Hill', 'South Hill', 'West End', 'East End'],
    'AW': ['Oranjestad', 'San Nicolas', 'Noord', 'Tanki Leendert', 'Paradera', 'Santa Cruz', 'Savaneta', 'Pos Chikito', 'Angochi', 'Malmok'],
    'BB': ['Bridgetown', 'Speightstown', 'Oistins', 'Holetown', 'Worthing', 'Bathsheba', 'Bath', 'Warrens', 'Christ Church', 'Saint Michael'],
    'BZ': ['Belize City', 'Belmopan', 'San Ignacio', 'Orange Walk', 'San Pedro', 'Corozal', 'Dangriga', 'Punta Gorda', 'Placencia', 'Hopkins'],
    'BM': ['Hamilton', 'Saint George', 'Somerset', 'Warwick', 'Paget', 'Devonshire', 'Smith\'s', 'Southampton', 'Sandys', 'Pembroke'],
    'CR': ['San José', 'Cartago', 'Alajuela', 'Heredia', 'Liberia', 'Puntarenas', 'Limón', 'Guanacaste', 'San Carlos', 'Tilarán'],
    'CU': ['Havana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Santa Clara', 'Guantánamo', 'Bayamo', 'Cienfuegos', 'Pinar del Río', 'Matanzas'],
    'DM': ['Roseau', 'Portsmouth', 'Marigot', 'Grand Bay', 'La Plaine', 'Wesley', 'Saint Joseph', 'Castle Bruce', 'Calibishie', 'Scotts Head'],
    'DO': ['Santo Domingo', 'Santiago', 'Santo Domingo Este', 'Santo Domingo Norte', 'Santo Domingo Oeste', 'San Pedro de Macorís', 'La Romana', 'San Francisco de Macorís', 'Salvaleón de Higüey', 'Concepción de La Vega'],
    'SV': ['San Salvador', 'Santa Ana', 'San Miguel', 'Mejicanos', 'Soyapango', 'San Martín', 'Apopa', 'Delgado', 'Ahuachapán', 'Ilopango'],
    'GD': ['Saint George\'s', 'Gouyave', 'Grenville', 'Victoria', 'Hillsborough', 'Sauteurs', 'Woburn', 'St. David\'s', 'Grand Roy', 'L\'Anse aux Epines'],
    'GT': ['Guatemala City', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'San Miguel Petapa', 'Villa Canales', 'Escuintla', 'San Juan Sacatepéquez', 'San José Pinula', 'Chinautla'],
    'HT': ['Port-au-Prince', 'Carrefour', 'Delmas', 'Pétion-Ville', 'Port-de-Paix', 'Gonaïves', 'Cap-Haïtien', 'Saint-Marc', 'Les Cayes', 'Verrettes'],
    'HN': ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'El Progreso', 'Choluteca', 'Comayagua', 'Puerto Cortés', 'La Lima', 'Danlí'],
    'JM': ['Kingston', 'New Kingston', 'Portmore', 'Spanish Town', 'Montego Bay', 'May Pen', 'Mandeville', 'Ocho Rios', 'Old Harbour', 'Linstead'],
    'NI': ['Managua', 'León', 'Masaya', 'Chinandega', 'Matagalpa', 'Estelí', 'Granada', 'Jinotega', 'Juigalpa', 'Tipitapa'],
    'PA': ['Panama City', 'San Miguelito', 'Tocumen', 'David', 'Arraiján', 'Colón', 'Santiago', 'La Chorrera', 'Chitré', 'Penonomé'],
    'PR': ['San Juan', 'Bayamón', 'Carolina', 'Ponce', 'Caguas', 'Guaynabo', 'Arecibo', 'Toa Baja', 'Mayagüez', 'Trujillo Alto'],
    'KN': ['Basseterre', 'Charlestown', 'Sandy Point Town', 'Cayon', 'Gingerland', 'Fig Tree', 'Trinity', 'Middle Island', 'Tabernacle', 'Phillips'],
    'LC': ['Castries', 'Vieux Fort', 'Micoud', 'Dennery', 'Soufrière', 'Gros Islet', 'Anse la Raye', 'Canaries', 'Laborie', 'Choiseul'],
    'VC': ['Kingstown', 'Arnos Vale', 'Layou', 'Barrouallie', 'Georgetown', 'Port Elizabeth', 'Chateaubelair', 'Calliaqua', 'Mesopotamia', 'Union Island'],
    'TT': ['Port of Spain', 'San Fernando', 'Arima', 'Point Fortin', 'Tunapuna', 'Scarborough', 'Sangre Grande', 'Rio Claro', 'Princes Town', 'Debe']
  };
  
  return popularCities[country.cca2] || [country.capital].filter(Boolean);
};

const searchDestinations = async (query) => {
  try {
    const searchTerm = query.toLowerCase();
    const results = [];
    
    // Search countries
    const countries = await fetchAllCountriesWithFallback();
    const countryResults = countries.filter(country => 
      country.name.toLowerCase().includes(searchTerm) ||
      country.officialName.toLowerCase().includes(searchTerm) ||
      country.capital.toLowerCase().includes(searchTerm) ||
      country.region.toLowerCase().includes(searchTerm) ||
      country.subregion?.toLowerCase().includes(searchTerm) ||
      country.popularCities.some(city => city.toLowerCase().includes(searchTerm))
    );
    
    results.push(...countryResults);
    
    // Search cities using fallback APIs
    try {
      const cityResults = await searchCitiesWithFallback(query, 10);
      const cityDestinations = cityResults.map(city => ({
        name: city.name,
        officialName: city.fullName,
        capital: city.name,
        region: city.region,
        subregion: city.region,
        population: city.population,
        currencies: [],
        languages: [],
        flag: '',
        flagPng: '',
        cca2: city.countryCode,
        cca3: city.countryCode,
        callingCodes: [],
        timezones: [city.timezone],
        borders: [],
        area: 0,
        coordinates: [city.latitude, city.longitude],
        maps: {
          googleMaps: `https://maps.google.com/?q=${city.latitude},${city.longitude}`,
          openStreetMaps: `https://www.openstreetmap.org/?mlat=${city.latitude}&mlon=${city.longitude}`
        },
        emergencyNumbers: getEmergencyNumbers(city.countryCode),
        description: `Explore the vibrant city of ${city.name} in ${city.country}. Experience the unique culture, landmarks, and local attractions.`,
        weatherDescription: `Check the local weather forecast for ${city.name} and pack appropriate clothing for your destination.`,
        popularCities: [city.name],
        isCity: true,
        cityId: city.id,
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone
      }));
      
      results.push(...cityDestinations);
    } catch (cityError) {
      console.error('Error searching cities:', cityError);
    }
    
    return results;
  } catch (error) {
    console.error('Error searching destinations:', error);
    return [];
  }
};

const getDestinationInfo = async (destination, country) => {
  try {
    const countries = await fetchAllCountriesWithFallback();
    const countryData = countries.find(c => 
      c.name.toLowerCase() === country.toLowerCase() ||
      c.cca2.toLowerCase() === country.toLowerCase() ||
      c.cca3.toLowerCase() === country.toLowerCase()
    );
    
    if (!countryData) {
      return null;
    }
    
    return {
      ...countryData,
      destination: destination,
      country: countryData.name
    };
  } catch (error) {
    console.error('Error getting destination info:', error);
    return null;
  }
};

export {
  fetchAllCountriesWithFallback,
  searchDestinations,
  getDestinationInfo
}; 