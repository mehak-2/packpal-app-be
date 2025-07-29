import { getWeatherRecommendations } from './weatherService.js';

const generatePackingList = (tripData) => {
  const { destination, country, startDate, endDate, activities, weather } = tripData;
  
  const tripDuration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  const weatherRecommendations = getWeatherRecommendations(weather, activities);
  
  const packingList = {
    clothing: generateClothingList(weatherRecommendations.clothing, tripDuration, activities),
    accessories: generateAccessoriesList(weatherRecommendations.accessories, activities),
    essentials: generateEssentialsList(weatherRecommendations.essentials, tripDuration, destination, country),
    electronics: generateElectronicsList(activities, tripDuration),
    toiletries: generateToiletriesList(tripDuration, activities),
    documents: generateDocumentsList(destination, country),
    activities: generateActivitySpecificItems(activities, weather)
  };
  
  return packingList;
};

const generateClothingList = (weatherClothing, duration, activities) => {
  const clothing = [...weatherClothing];
  
  const baseClothing = [
    { name: 'Underwear', quantity: Math.max(3, Math.ceil(duration / 2)), packed: false },
    { name: 'Socks', quantity: Math.max(3, Math.ceil(duration / 2)), packed: false },
    { name: 'Pajamas', quantity: 1, packed: false }
  ];
  
  clothing.forEach(item => {
    baseClothing.push({ name: item, quantity: Math.ceil(duration / 3), packed: false });
  });
  
  if (activities.includes('business')) {
    baseClothing.push(
      { name: 'Business suit', quantity: 1, packed: false },
      { name: 'Dress shirts', quantity: Math.ceil(duration / 2), packed: false },
      { name: 'Dress shoes', quantity: 1, packed: false },
      { name: 'Tie', quantity: 2, packed: false }
    );
  }
  
  if (activities.includes('formal-events')) {
    baseClothing.push(
      { name: 'Formal dress/outfit', quantity: 1, packed: false },
      { name: 'Formal shoes', quantity: 1, packed: false },
      { name: 'Jewelry', quantity: 1, packed: false }
    );
  }
  
  return baseClothing;
};

const generateAccessoriesList = (weatherAccessories, activities) => {
  const accessories = [...weatherAccessories.map(item => ({ name: item, packed: false }))];
  
  const baseAccessories = [
    { name: 'Wallet', packed: false },
    { name: 'Watch', packed: false },
    { name: 'Belt', packed: false },
    { name: 'Jewelry', packed: false }
  ];
  
  accessories.push(...baseAccessories);
  
  if (activities.includes('outdoor-activities')) {
    accessories.push(
      { name: 'Backpack', packed: false },
      { name: 'Water bottle', packed: false },
      { name: 'Hat', packed: false },
      { name: 'Sunglasses', packed: false }
    );
  }
  
  if (activities.includes('relaxation')) {
    accessories.push(
      { name: 'Beach towel', packed: false },
      { name: 'Beach bag', packed: false },
      { name: 'Swimsuit', packed: false }
    );
  }
  
  return accessories;
};

const generateEssentialsList = (weatherEssentials, duration, destination, country) => {
  const essentials = [...weatherEssentials.map(item => ({ name: item, packed: false }))];
  
  const baseEssentials = [
    { name: 'Passport', packed: false },
    { name: 'Travel documents', packed: false },
    { name: 'Travel insurance', packed: false },
    { name: 'Cash and cards', packed: false },
    { name: 'Phone charger', packed: false },
    { name: 'Universal adapter', packed: false },
    { name: 'Medications', packed: false },
    { name: 'First aid kit', packed: false }
  ];
  
  essentials.push(...baseEssentials);
  
  if (duration > 7) {
    essentials.push(
      { name: 'Laundry detergent', packed: false },
      { name: 'Travel size toiletries', packed: false }
    );
  }
  
  return essentials;
};

const generateElectronicsList = (activities, duration) => {
  const electronics = [
    { name: 'Phone', packed: false },
    { name: 'Phone charger', packed: false },
    { name: 'Power bank', packed: false },
    { name: 'Universal adapter', packed: false }
  ];
  
  if (activities.includes('photography')) {
    electronics.push(
      { name: 'Camera', packed: false },
      { name: 'Camera charger', packed: false },
      { name: 'Memory cards', packed: false },
      { name: 'Tripod', packed: false }
    );
  }
  
  if (activities.includes('business')) {
    electronics.push(
      { name: 'Laptop', packed: false },
      { name: 'Laptop charger', packed: false },
      { name: 'USB drive', packed: false }
    );
  }
  
  if (activities.includes('entertainment')) {
    electronics.push(
      { name: 'Headphones', packed: false },
      { name: 'Tablet', packed: false },
      { name: 'E-reader', packed: false }
    );
  }
  
  if (duration > 14) {
    electronics.push({ name: 'Portable speaker', packed: false });
  }
  
  return electronics;
};

const generateToiletriesList = (duration, activities) => {
  const toiletries = [
    { name: 'Toothbrush', packed: false },
    { name: 'Toothpaste', packed: false },
    { name: 'Shampoo', packed: false },
    { name: 'Conditioner', packed: false },
    { name: 'Body wash', packed: false },
    { name: 'Deodorant', packed: false },
    { name: 'Hair brush', packed: false },
    { name: 'Razor', packed: false },
    { name: 'Shaving cream', packed: false },
    { name: 'Face wash', packed: false },
    { name: 'Moisturizer', packed: false },
    { name: 'Sunscreen', packed: false },
    { name: 'Lip balm', packed: false },
    { name: 'Nail clippers', packed: false },
    { name: 'Tweezers', packed: false }
  ];
  
  if (activities.includes('formal-events')) {
    toiletries.push(
      { name: 'Makeup', packed: false },
      { name: 'Hair styling products', packed: false },
      { name: 'Perfume/cologne', packed: false }
    );
  }
  
  if (activities.includes('outdoor-activities')) {
    toiletries.push(
      { name: 'Insect repellent', packed: false },
      { name: 'Aloe vera gel', packed: false },
      { name: 'Hand sanitizer', packed: false }
    );
  }
  
  return toiletries;
};

const generateDocumentsList = (destination, country) => {
  return [
    { name: 'Passport', packed: false },
    { name: 'Visa (if required)', packed: false },
    { name: 'Travel insurance', packed: false },
    { name: 'Flight tickets', packed: false },
    { name: 'Hotel reservations', packed: false },
    { name: 'Emergency contacts', packed: false },
    { name: 'Local embassy contact', packed: false },
    { name: 'Medical information', packed: false },
    { name: 'Credit card information', packed: false },
    { name: 'Travel itinerary', packed: false }
  ];
};

const generateActivitySpecificItems = (activities, weather) => {
  const activityItems = [];
  
  if (activities.includes('outdoor-activities')) {
    activityItems.push(
      { name: 'Hiking boots', packed: false },
      { name: 'Compass', packed: false },
      { name: 'Map', packed: false },
      { name: 'Water bottle', packed: false },
      { name: 'Energy bars', packed: false },
      { name: 'Multi-tool', packed: false }
    );
  }
  
  if (activities.includes('relaxation')) {
    activityItems.push(
      { name: 'Beach towel', packed: false },
      { name: 'Beach umbrella', packed: false },
      { name: 'Beach chair', packed: false },
      { name: 'Beach bag', packed: false },
      { name: 'Swimsuit', packed: false },
      { name: 'Beach games', packed: false }
    );
  }
  
  if (activities.includes('shopping')) {
    activityItems.push(
      { name: 'Shopping bag', packed: false },
      { name: 'Shopping list', packed: false },
      { name: 'Extra space in luggage', packed: false },
      { name: 'Gift wrapping supplies', packed: false }
    );
  }
  
  if (activities.includes('food-drink')) {
    activityItems.push(
      { name: 'Restaurant recommendations', packed: false },
      { name: 'Food allergy cards', packed: false },
      { name: 'Tasting notes app', packed: false }
    );
  }
  
  if (activities.includes('arts-culture')) {
    activityItems.push(
      { name: 'Museum passes', packed: false },
      { name: 'Guide book', packed: false },
      { name: 'Audio guide app', packed: false },
      { name: 'Comfortable walking shoes', packed: false }
    );
  }
  
  if (activities.includes('entertainment')) {
    activityItems.push(
      { name: 'Event tickets', packed: false },
      { name: 'Dress code appropriate clothing', packed: false },
      { name: 'Entertainment venue information', packed: false }
    );
  }
  
  return activityItems;
};

const getPackingListSummary = (packingList) => {
  const summary = {
    totalItems: 0,
    packedItems: 0,
    categories: {}
  };
  
  Object.keys(packingList).forEach(category => {
    const items = packingList[category];
    const total = items.length;
    const packed = items.filter(item => item.packed).length;
    
    summary.totalItems += total;
    summary.packedItems += packed;
    summary.categories[category] = { total, packed };
  });
  
  summary.packedPercentage = Math.round((summary.packedItems / summary.totalItems) * 100);
  
  return summary;
};

export {
  generatePackingList,
  getPackingListSummary
}; 