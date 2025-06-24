import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface cityData {
  state: string;
  country: string;
  city: string;
}

@Injectable()
export class UtilsService {
  constructor(private readonly prisma: PrismaService) {}

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
      const cityMap = new Map<string, cityData>();

      data.results.forEach((city) => {
        if (
          city.country &&
          city.city &&
          city.state &&
          city.city.includes(inputValue)
        ) {
          const key = `${city.state}|${city.country}|${city.city}`;

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

  async hasProfile(userId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (user.hasProfile) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return false;
    }
  }
}
