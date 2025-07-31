import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const generatePackingList = async (tripDetails) => {
  try {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
      console.log('⚠️  OpenAI API key not configured, using fallback packing list');
      return generateFallbackPackingList(tripDetails);
    }

    const {
      destination,
      country,
      startDate,
      endDate,
      activities,
      weather,
      destinationInfo
    } = tripDetails;

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const tripDuration = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));

    const weatherInfo = weather ? `
Weather: ${weather.description}, ${weather.temperature}°C
Humidity: ${weather.humidity}%
Wind Speed: ${weather.windSpeed} m/s
` : "Weather information not available";

    const activitiesList = activities && activities.length > 0 ? activities.join(", ") : "General travel";

    const prompt = `Generate a comprehensive packing list for a ${tripDuration}-day trip to ${destination}, ${country}.

Trip Details:
- Destination: ${destination}, ${country}
- Duration: ${tripDuration} days
- Activities: ${activitiesList}
${weatherInfo}

Please provide a detailed packing list organized by categories. For each item, specify if it's essential or optional. Consider the destination, weather, activities, and trip duration.

Return the response as a JSON object with the following structure:
{
  "clothing": [
    {"name": "item name", "quantity": number, "essential": boolean, "reason": "why this item is needed"}
  ],
  "accessories": [
    {"name": "item name", "essential": boolean, "reason": "why this item is needed"}
  ],
  "essentials": [
    {"name": "item name", "essential": boolean, "reason": "why this item is needed"}
  ],
  "electronics": [
    {"name": "item name", "essential": boolean, "reason": "why this item is needed"}
  ],
  "toiletries": [
    {"name": "item name", "essential": boolean, "reason": "why this item is needed"}
  ],
  "documents": [
    {"name": "item name", "essential": boolean, "reason": "why this item is needed"}
  ],
  "activities": [
    {"name": "item name", "essential": boolean, "reason": "why this item is needed"}
  ]
}

Focus on practical items that travelers commonly forget or need for this specific destination and activities.`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful travel assistant that creates comprehensive packing lists. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    
    try {
      const packingList = JSON.parse(aiResponse);
      
      const formatPackingList = (items) => {
        return items.map(item => ({
          name: item.name,
          quantity: item.quantity || 1,
          packed: false,
          essential: item.essential || false,
          reason: item.reason || ""
        }));
      };

      return {
        clothing: formatPackingList(packingList.clothing || []),
        accessories: formatPackingList(packingList.accessories || []),
        essentials: formatPackingList(packingList.essentials || []),
        electronics: formatPackingList(packingList.electronics || []),
        toiletries: formatPackingList(packingList.toiletries || []),
        documents: formatPackingList(packingList.documents || []),
        activities: formatPackingList(packingList.activities || [])
      };
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Falling back to default packing list");
      return generateFallbackPackingList(tripDetails);
    }
  } catch (error) {
    console.error("Error generating packing list:", error);
    console.log("Falling back to default packing list");
    return generateFallbackPackingList(tripDetails);
  }
};

const generateFallbackPackingList = (tripDetails) => {
  const { destination, country, startDate, endDate, activities } = tripDetails;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const tripDuration = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));

  return {
    clothing: [
      { name: "T-shirts", quantity: Math.max(3, Math.ceil(tripDuration / 2)), packed: false, essential: true, reason: "Basic clothing for daily wear" },
      { name: "Pants/Shorts", quantity: Math.max(2, Math.ceil(tripDuration / 3)), packed: false, essential: true, reason: "Essential bottoms for your trip" },
      { name: "Underwear", quantity: Math.max(3, Math.ceil(tripDuration / 2)), packed: false, essential: true, reason: "Daily essentials" },
      { name: "Socks", quantity: Math.max(3, Math.ceil(tripDuration / 2)), packed: false, essential: true, reason: "Footwear essentials" },
      { name: "Pajamas", quantity: 1, packed: false, essential: false, reason: "Comfortable sleepwear" },
      { name: "Jacket/Sweater", quantity: 1, packed: false, essential: false, reason: "For cooler weather" }
    ],
    accessories: [
      { name: "Wallet", quantity: 1, packed: false, essential: true, reason: "For carrying money and cards" },
      { name: "Backpack/Day Bag", quantity: 1, packed: false, essential: true, reason: "For daily excursions" },
      { name: "Sunglasses", quantity: 1, packed: false, essential: false, reason: "Eye protection from sun" },
      { name: "Hat/Cap", quantity: 1, packed: false, essential: false, reason: "Sun protection" }
    ],
    essentials: [
      { name: "Passport", quantity: 1, packed: false, essential: true, reason: "Required for international travel" },
      { name: "Phone Charger", quantity: 1, packed: false, essential: true, reason: "Keep your phone powered" },
      { name: "Power Bank", quantity: 1, packed: false, essential: false, reason: "Backup power source" },
      { name: "Water Bottle", quantity: 1, packed: false, essential: false, reason: "Stay hydrated" }
    ],
    electronics: [
      { name: "Phone", quantity: 1, packed: false, essential: true, reason: "Communication and navigation" },
      { name: "Camera", quantity: 1, packed: false, essential: false, reason: "Capture memories" },
      { name: "Laptop/Tablet", quantity: 1, packed: false, essential: false, reason: "Work or entertainment" },
      { name: "Universal Adapter", quantity: 1, packed: false, essential: false, reason: "For different power outlets" }
    ],
    toiletries: [
      { name: "Toothbrush", quantity: 1, packed: false, essential: true, reason: "Daily hygiene" },
      { name: "Toothpaste", quantity: 1, packed: false, essential: true, reason: "Daily hygiene" },
      { name: "Shampoo", quantity: 1, packed: false, essential: true, reason: "Hair care" },
      { name: "Soap/Body Wash", quantity: 1, packed: false, essential: true, reason: "Body hygiene" },
      { name: "Deodorant", quantity: 1, packed: false, essential: true, reason: "Personal hygiene" },
      { name: "Sunscreen", quantity: 1, packed: false, essential: false, reason: "Sun protection" }
    ],
    documents: [
      { name: "Travel Insurance", quantity: 1, packed: false, essential: false, reason: "Protection during travel" },
      { name: "Hotel Reservations", quantity: 1, packed: false, essential: false, reason: "Accommodation details" },
      { name: "Flight Tickets", quantity: 1, packed: false, essential: false, reason: "Transportation details" },
      { name: "Emergency Contacts", quantity: 1, packed: false, essential: false, reason: "Important phone numbers" }
    ],
    activities: [
      { name: "Comfortable Walking Shoes", quantity: 1, packed: false, essential: true, reason: "For exploring and activities" },
      { name: "Swimsuit", quantity: 1, packed: false, essential: false, reason: "If swimming is planned" },
      { name: "Hiking Boots", quantity: 1, packed: false, essential: false, reason: "For outdoor activities" }
    ]
  };
};

const suggestPackingList = async (tripDetails) => {
  try {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
      console.log('⚠️  OpenAI API key not configured, using fallback suggestions');
      return generateFallbackSuggestions(tripDetails);
    }

    const {
      destination,
      country,
      startDate,
      endDate,
      activities
    } = tripDetails;

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const tripDuration = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));

    const activitiesList = activities && activities.length > 0 ? activities.join(", ") : "General travel";

    const prompt = `Suggest a packing list for a ${tripDuration}-day trip to ${destination}, ${country}.

Activities: ${activitiesList}

Provide 3-5 key items that are commonly forgotten or essential for this type of trip. Return as JSON:
{
  "suggestions": [
    {"name": "item name", "category": "category", "reason": "why this is important"}
  ]
}`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful travel assistant. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    return JSON.parse(aiResponse);
  } catch (error) {
    console.error("Error suggesting packing list:", error);
    console.log("Falling back to default suggestions");
    return generateFallbackSuggestions(tripDetails);
  }
};

const generateFallbackSuggestions = (tripDetails) => {
  const { destination, activities } = tripDetails;
  
  const suggestions = [
    {
      name: "Universal Power Adapter",
      category: "electronics",
      reason: "Essential for charging devices in different countries"
    },
    {
      name: "Portable First Aid Kit",
      category: "essentials",
      reason: "Important for handling minor injuries while traveling"
    },
    {
      name: "Travel Insurance Documents",
      category: "documents",
      reason: "Protection against unexpected travel issues"
    }
  ];

  if (activities && activities.some(activity => activity.toLowerCase().includes('swim'))) {
    suggestions.push({
      name: "Waterproof Phone Case",
      category: "accessories",
      reason: "Protect your phone during water activities"
    });
  }

  if (activities && activities.some(activity => activity.toLowerCase().includes('hike'))) {
    suggestions.push({
      name: "Hiking Boots",
      category: "activities",
      reason: "Essential for safe and comfortable hiking"
    });
  }

  return { suggestions };
};

export { generatePackingList, suggestPackingList };