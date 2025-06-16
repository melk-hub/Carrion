import { Injectable } from '@nestjs/common';

interface cityData {
  state: string;
  country: string;
  city: string;
}

@Injectable()
export class UtilsService {
  async getCountryList(inputValue: string) {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(inputValue)}&apiKey=${process.env.GEOAPIFY_API_KEY}&type=city&limit=15&lang=en&format=json&bias=countrycode:fr`,
      );
      if (!response.ok) {
        console.error('Failed to fetch city suggestions');
        return [];
      }
      const data = await response.json();
      const cityMap = new Map<string, cityData>(); // Assuming cityData is your type

      data.results.forEach((city) => {
        if (
          city.country &&
          city.city &&
          city.state &&
          city.city.includes(inputValue)
        ) {
          const key = `${city.state}|${city.country}|${city.city}`;

          // We only need to create the object if we haven't seen this key before
          if (!cityMap.has(key)) {
            const cityObj: cityData = {
              state: city.state,
              country: city.country,
              city: city.city,
            };
            cityMap.set(key, cityObj);
          }
        }
      });

      return Array.from(cityMap.values());
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      return [];
    }
  }
}
