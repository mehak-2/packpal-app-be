# Alternative APIs Setup Guide

This guide explains how to set up alternative APIs to replace the REST Countries API and GeoDB Cities API in case of downtime or changes.

## Overview

The application now uses a fallback system with multiple APIs:

1. **GeoNames API** (Primary) - Free, reliable geographical database
2. **CountryLayer API** (Fallback) - Country data with detailed information
3. **Teleport API** (Fallback) - City and country information
4. **GeoDB Cities API** (Legacy) - Original API (requires RapidAPI key)

## API Setup Instructions

### 1. GeoNames API (Recommended - Free)

GeoNames is the primary API and requires only a free account.

**Setup:**
1. Go to [GeoNames](http://www.geonames.org/login)
2. Create a free account
3. Add your username to environment variables

**Environment Variable:**
```bash
GEO_NAMES_USERNAME=your_geonames_username
```

**Features:**
- Free tier: 20,000 requests per hour
- Comprehensive country and city data
- No API key required (just username)
- Reliable and well-maintained

### 2. CountryLayer API (Fallback)

Provides detailed country information including currencies, flags, and capitals.

**Setup:**
1. Go to [CountryLayer](https://countrylayer.com/)
2. Sign up for a free account
3. Get your API key
4. Add to environment variables

**Environment Variable:**
```bash
COUNTRYLAYER_API_KEY=your_countrylayer_api_key
```

**Features:**
- Free tier: 1,000 requests per month
- Detailed country information
- Currency and language data
- Flag URLs

### 3. Teleport API (Fallback)

Provides city and country information with scores and images.

**Setup:**
1. Go to [Teleport API](https://developers.teleport.org/api/)
2. No registration required for basic usage
3. Optional API key for higher limits

**Environment Variable (Optional):**
```bash
TELEPORT_API_KEY=your_teleport_api_key
```

**Features:**
- Free tier available
- City quality of life scores
- No API key required for basic usage
- Comprehensive city data

### 4. GeoDB Cities API (Legacy)

The original API through RapidAPI (requires RapidAPI key).

**Setup:**
1. Go to [RapidAPI](https://rapidapi.com/wirefreetech/api/geodb-cities/)
2. Subscribe to the GeoDB Cities API
3. Get your RapidAPI key
4. Add to environment variables

**Environment Variable:**
```bash
RAPIDAPI_KEY=your_rapidapi_key
```

## Environment Variables Setup

Create a `.env` file in your server directory:

```bash
# Primary API (Free)
GEO_NAMES_USERNAME=your_geonames_username

# Fallback APIs (Optional)
COUNTRYLAYER_API_KEY=your_countrylayer_api_key
TELEPORT_API_KEY=your_teleport_api_key

# Legacy API (Optional)
RAPIDAPI_KEY=your_rapidapi_key
```

## API Priority Order

The system will try APIs in this order:

1. **GeoNames API** - Primary choice (free, reliable)
2. **CountryLayer API** - First fallback (detailed country data)
3. **Teleport API** - Second fallback (city data)
4. **GeoDB Cities API** - Legacy fallback (original API)

## Rate Limits

| API | Free Tier Limit | Paid Options |
|-----|----------------|--------------|
| GeoNames | 20,000 requests/hour | Available |
| CountryLayer | 1,000 requests/month | Available |
| Teleport | No strict limit | Available |
| GeoDB Cities | 1,000 requests/month | Available |

## Testing Your Setup

You can test your API configuration by running:

```javascript
import { getApiStatus, validateApiKeys } from './config/apiConfig.js';

console.log('API Status:', getApiStatus());
console.log('API Keys Validation:', validateApiKeys());
```

## Troubleshooting

### Common Issues

1. **GeoNames API not working:**
   - Verify your username is correct
   - Check if you've exceeded the rate limit
   - Ensure your account is activated

2. **CountryLayer API errors:**
   - Verify your API key is correct
   - Check if you've exceeded the monthly limit
   - Ensure your subscription is active

3. **Teleport API issues:**
   - Usually works without API key
   - Check network connectivity
   - Verify API endpoints are accessible

### Fallback Behavior

If the primary API fails, the system will automatically try the next available API. You can monitor this in the server logs:

```
Attempting to fetch countries from GeoNames API...
GeoNames API failed: Rate limit exceeded
Attempting to fetch countries from CountryLayer API...
Successfully fetched 195 countries from CountryLayer API
```

## Migration from Original APIs

The new implementation maintains the same data structure as the original APIs, so no changes are needed in your frontend code. The system will automatically handle the transition between different APIs.

## Support

If you encounter issues with any of these APIs:

1. Check the API documentation for the specific service
2. Verify your API keys and account status
3. Monitor rate limits and usage
4. Check server logs for detailed error messages

## Cost Comparison

| API | Cost | Features |
|-----|------|----------|
| GeoNames | Free | Comprehensive, reliable |
| CountryLayer | Free tier + paid | Detailed country data |
| Teleport | Free tier + paid | City quality scores |
| GeoDB Cities | Free tier + paid | Original API |

**Recommendation:** Start with GeoNames API as it's free, reliable, and provides comprehensive data for most use cases. 