interface ApiOptions extends RequestInit {
  isRetry?: boolean;
}

interface CityOption {
  label: string;
  value: string;
}

class ApiService {
  private isRefreshing: boolean = false;
  private refreshSubscribers: (() => Promise<void>)[] = [];
  private _logoutCallback: (callApi?: boolean) => void = () => {};

  constructor() {}

  public registerLogoutCallback(callback: (callApi?: boolean) => void) {
    this._logoutCallback = callback;
  }

  private getBaseUrl(): string {
    if (typeof window === "undefined") {
      return process.env.INTERNAL_API_URL || "http://server:8080";
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  }

  private handleLocalLogout() {
    if (typeof window === "undefined") return;
    this._logoutCallback(false);
    localStorage.removeItem("lastPath");
  }

  private async handleTokenRefresh(
    originalRequest: () => Promise<Response>
  ): Promise<Response> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push(async () => {
          resolve(await originalRequest());
        });
      });
    }
    this.isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${this.getBaseUrl()}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshResponse.ok) {
        await Promise.all(
          this.refreshSubscribers.map((callback) => callback())
        );
        this.refreshSubscribers = [];
        return await originalRequest();
      } else {
        this.handleLocalLogout();
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      this.handleLocalLogout();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  public async request(
    url: string,
    options: ApiOptions = {}
  ): Promise<Response> {
    const fullUrl = `${this.getBaseUrl()}${url}`;
    const defaultOptions: ApiOptions = {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    };

    const response = await fetch(fullUrl, defaultOptions);

    if (response.status === 401 && !options.isRetry) {
      return this.handleTokenRefresh(() =>
        this.request(url, { ...options, isRetry: true })
      );
    }
    return response;
  }

  private async processResponse<T>(response: Response): Promise<T | null> {
    if (!response.ok) {
      const errorData = (await response
        .json()
        .catch(() => ({ message: response.statusText }))) as {
        message?: string;
      };

      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    if (response.status === 204) {
      return null;
    }
    return response.json() as Promise<T>;
  }

  public async get<T>(
    url: string,
    options: ApiOptions = {}
  ): Promise<T | null> {
    try {
      const response = await this.request(url, { method: "GET", ...options });
      return await this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === "Token refresh failed") {
        return null;
      }
      console.error(`GET ${url} failed:`, error);
      return null;
    }
  }

  public async post<T>(
    url: string,
    data: unknown = {},
    options: ApiOptions = {}
  ): Promise<T | null> {
    try {
      const response = await this.request(url, {
        method: "POST",
        body: JSON.stringify(data),
        ...options,
      });
      return await this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === "Token refresh failed") {
        return null;
      }
      console.error(`POST ${url} failed:`, error);
      return null;
    }
  }

  public async put<T>(
    url: string,
    data: unknown,
    options: ApiOptions = {}
  ): Promise<T | null> {
    try {
      const response = await this.request(url, {
        method: "PUT",
        body: JSON.stringify(data),
        ...options,
      });
      return await this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === "Token refresh failed") {
        return null;
      }
      console.error(`PUT ${url} failed:`, error);
      return null;
    }
  }

  public async patch<T>(
    url: string,
    data: unknown,
    options: ApiOptions = {}
  ): Promise<T | null> {
    try {
      const response = await this.request(url, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...options,
      });
      return await this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === "Token refresh failed") {
        return null;
      }
      console.error(`PATCH ${url} failed:`, error);
      return null;
    }
  }

  public async delete<T>(
    url: string,
    data: unknown,
    options: ApiOptions = {}
  ): Promise<T | null> {
    try {
      const response = await this.request(url, {
        method: "DELETE",
        body: JSON.stringify(data),
        ...options,
      });
      return await this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === "Token refresh failed") {
        return null;
      }
      console.error(`DELETE ${url} failed:`, error);
      return null;
    }
  }

  public async fetchAndFormatCities(inputValue: string): Promise<CityOption[]> {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const data = await this.post<
        { city: string; state: string; country: string }[]
      >(`/utils/countryList`, { inputValue });
      if (!data) return [];
      return data.map((loc) => ({
        label: `${loc.city}, ${loc.state}, ${loc.country}`,
        value: `${loc.city}, ${loc.state}, ${loc.country}`,
      }));
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
  }
}

const apiServiceInstance = new ApiService();
export default apiServiceInstance;
