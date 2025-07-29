import axios from 'axios';

const fetchWeather = async (city, country) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (!apiKey || apiKey === "demo-key") {
      console.log("Weather API key not configured, using default weather data");
      return {
        temperature: 20,
        condition: "Clear",
        description: "Weather data unavailable",
        humidity: 60,
        windSpeed: 5,
        pressure: 1013,
        visibility: 10000,
        sunrise: "06:00",
        sunset: "18:00",
        forecast: generateDefaultForecast()
      };
    }
    
    const currentWeatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`
    );
    
    if (currentWeatherResponse.status !== 200) {
      throw new Error("Weather API request failed");
    }
    
    const currentData = currentWeatherResponse.data;
    
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=${apiKey}&units=metric`
    );
    
    let forecastData = [];
    if (forecastResponse.status === 200) {
      const forecast = forecastResponse.data;
      forecastData = processForecastData(forecast.list);
    }
    
    return {
      temperature: Math.round(currentData.main.temp),
      condition: currentData.weather[0].main,
      description: currentData.weather[0].description,
      humidity: currentData.main.humidity,
      windSpeed: currentData.wind.speed,
      pressure: currentData.main.pressure,
      visibility: currentData.visibility,
      sunrise: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(currentData.sys.sunset * 1000).toLocaleTimeString(),
      forecast: forecastData
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return {
      temperature: 20,
      condition: "Clear",
      description: "Weather data unavailable",
      humidity: 60,
      windSpeed: 5,
      pressure: 1013,
      visibility: 10000,
      sunrise: "06:00",
      sunset: "18:00",
      forecast: generateDefaultForecast()
    };
  }
};

const processForecastData = (forecastList) => {
  const dailyForecasts = {};
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    const temp = Math.round(item.main.temp);
    const condition = item.weather[0].main;
    const description = item.weather[0].description;
    const precipitation = item.pop * 100;
    
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        date: new Date(item.dt * 1000).toISOString().split('T')[0],
        temperature: temp,
        condition: condition,
        description: description,
        precipitation: Math.round(precipitation),
        humidity: item.main.humidity,
        windSpeed: item.wind.speed
      };
    }
  });
  
  return Object.values(dailyForecasts).slice(0, 7);
};

const generateDefaultForecast = () => {
  const forecast = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      temperature: 20 + Math.floor(Math.random() * 10),
      condition: "Clear",
      description: "Clear sky",
      precipitation: Math.floor(Math.random() * 20),
      humidity: 60 + Math.floor(Math.random() * 20),
      windSpeed: 5 + Math.floor(Math.random() * 10)
    });
  }
  
  return forecast;
};

const getWeatherRecommendations = (weatherData, activities) => {
  const recommendations = {
    clothing: [],
    accessories: [],
    essentials: []
  };
  
  const temp = weatherData.temperature;
  const condition = weatherData.condition.toLowerCase();
  const precipitation = weatherData.forecast?.[0]?.precipitation || 0;
  
  if (temp < 10) {
    recommendations.clothing.push('Warm jacket', 'Thermal underwear', 'Winter hat', 'Gloves', 'Scarf');
  } else if (temp < 20) {
    recommendations.clothing.push('Light jacket', 'Long sleeve shirts', 'Pants', 'Sweater');
  } else if (temp < 30) {
    recommendations.clothing.push('T-shirts', 'Shorts', 'Light dresses', 'Comfortable pants');
  } else {
    recommendations.clothing.push('Lightweight clothing', 'Tank tops', 'Shorts', 'Breathable fabrics');
  }
  
  if (condition.includes('rain') || precipitation > 30) {
    recommendations.accessories.push('Umbrella', 'Rain jacket', 'Waterproof shoes', 'Waterproof bag');
  }
  
  if (condition.includes('snow')) {
    recommendations.accessories.push('Winter boots', 'Snow jacket', 'Snow pants', 'Hand warmers');
  }
  
  if (temp > 25) {
    recommendations.accessories.push('Sunglasses', 'Sunscreen', 'Hat', 'Light scarf');
  }
  
  if (activities.includes('outdoor-activities')) {
    recommendations.essentials.push('Comfortable walking shoes', 'Water bottle', 'First aid kit', 'Map');
  }
  
  if (activities.includes('relaxation')) {
    recommendations.essentials.push('Beach towel', 'Sunscreen', 'Swimsuit', 'Beach bag');
  }
  
  if (activities.includes('shopping')) {
    recommendations.essentials.push('Comfortable shoes', 'Shopping bag', 'Cash/cards', 'Shopping list');
  }
  
  recommendations.essentials.push('Passport', 'Travel documents', 'Phone charger', 'Universal adapter', 'Medications');
  
  return recommendations;
};

export default fetchWeather;
export { getWeatherRecommendations }; 