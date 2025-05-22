import axios from 'axios';

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    // Добавляем задержку для соблюдения правил использования API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await axios.get<NominatimResponse[]>(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'ru'
        }
      }
    );

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lon)
      };
    }

    console.error('Geocoding failed: No results found');
    return null;
  } catch (error) {
    console.error('Error during geocoding:', error);
    return null;
  }
}; 