import { fetchCountriesWithFallback, searchCitiesWithFallback } from './services/fallbackDestinationService.js';
import { getApiStatus, validateApiKeys } from './config/apiConfig.js';

const testAPIs = async () => {
  console.log('=== API Configuration Test ===\n');
  
  const apiStatus = getApiStatus();
  const keyValidation = validateApiKeys();
  
  console.log('API Status:');
  Object.keys(apiStatus).forEach(apiName => {
    const status = apiStatus[apiName];
    console.log(`  ${apiName}: ${status.configured ? '✅ Configured' : '❌ Not Configured'}`);
    console.log(`    Description: ${status.description}`);
    console.log(`    Rate Limit: ${status.rateLimit} requests`);
  });
  
  console.log('\nAPI Keys Validation:');
  if (keyValidation.valid) {
    console.log('  ✅ All required API keys are configured');
  } else {
    console.log('  ❌ Missing API keys:', keyValidation.missingKeys.join(', '));
  }
  
  console.log('\n=== Testing Country Fetching ===\n');
  
  try {
    console.log('Testing country fetching with fallback APIs...');
    const countries = await fetchCountriesWithFallback();
    
    if (countries.length > 0) {
      console.log(`✅ Successfully fetched ${countries.length} countries`);
      console.log('Sample countries:');
      countries.slice(0, 3).forEach(country => {
        console.log(`  - ${country.name} (${country.cca2})`);
      });
    } else {
      console.log('❌ No countries fetched');
    }
  } catch (error) {
    console.error('❌ Error fetching countries:', error.message);
  }
  
  console.log('\n=== Testing City Search ===\n');
  
  try {
    console.log('Testing city search with fallback APIs...');
    const cities = await searchCitiesWithFallback('London', 5);
    
    if (cities.length > 0) {
      console.log(`✅ Successfully found ${cities.length} cities`);
      console.log('Sample cities:');
      cities.slice(0, 3).forEach(city => {
        console.log(`  - ${city.name}, ${city.country} (${city.countryCode})`);
      });
    } else {
      console.log('❌ No cities found');
    }
  } catch (error) {
    console.error('❌ Error searching cities:', error.message);
  }
  
  console.log('\n=== Test Complete ===');
};

testAPIs().catch(console.error); 