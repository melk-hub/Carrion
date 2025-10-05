interface ApiOptions extends RequestInit {
  isRetry?: boolean;
}

interface CityOption {
  label: string;
  value: string;
}

class ApiService {
  private isRefreshing: boolean = false;
  private refreshSubscribers: (() => void)[] = [];
  private _logoutCallback: () => void = () => {};

  constructor() {
    this.handleTokenRefresh = this.handleTokenRefresh.bind(this);
    this.request = this.request.bind(this);
  }

  public registerLogoutCallback(callback: () => void) {
    this._logoutCallback = callback;
  }

  private handleLogoutAndRedirect() {
    if (typeof window === "undefined") return;

    this._logoutCallback();
    localStorage.removeItem("lastPath");
    window.location.href = "/";
  }

  private async handleTokenRefresh(
    originalRequest: () => Promise<Response>
  ): Promise<Response> {
    if (typeof window === "undefined") {
      throw new Error("Authentication failed on the server.");
    }

    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push(() => {
          resolve(originalRequest());
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      this.isRefreshing = false;

      if (refreshResponse.ok) {
        this.refreshSubscribers.forEach((callback) => callback());
        this.refreshSubscribers = [];
        return originalRequest();
      } else {
        this.handleLogoutAndRedirect();
        throw new Error("Token refresh failed, logging out.");
      }
    } catch (error) {
      this.isRefreshing = false;
      this.handleLogoutAndRedirect();
      throw error;
    }
  }

  public async request(
    url: string,
    options: ApiOptions = {}
  ): Promise<Response> {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`;

    const defaultOptions: ApiOptions = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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

  public async get<T>(url: string, options: ApiOptions = {}): Promise<T> {
    const response = await this.request(url, { method: "GET", ...options });
    if (!response.ok) throw new Error(await response.text());
    return response.json() as Promise<T>;
  }

  public async post<T>(
    url: string,
    data: unknown = {},
    options: ApiOptions = {}
  ): Promise<T> {
    const response = await this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json() as Promise<T>;
  }

  public async put<T>(
    url: string,
    data: unknown,
    options: ApiOptions = {}
  ): Promise<T> {
    const response = await this.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json() as Promise<T>;
  }

  public async patch<T>(
    url: string,
    data: unknown,
    options: ApiOptions = {}
  ): Promise<T> {
    const response = await this.request(url, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json() as Promise<T>;
  }

  public async delete<T>(url: string, options: ApiOptions = {}): Promise<T> {
    const response = await this.request(url, { method: "DELETE", ...options });
    if (!response.ok) throw new Error(await response.text());
    return response.json() as Promise<T>;
  }

  public async fetchAndFormatCities(inputValue: string): Promise<CityOption[]> {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const data = await this.post<
        { city: string; state: string; country: string }[]
      >(`/utils/countryList`, { inputValue });
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
