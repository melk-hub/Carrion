const API_BASE_URL = process.env.REACT_APP_API_URL;

class ApiService {
  constructor() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  async request(url, options = {}) {
    const fullUrl = `${API_BASE_URL}${url}`;
    const defaultOptions = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(fullUrl, defaultOptions);

      if (response.status === 401 && !options.isRetry) {
        return this.handleTokenRefresh(() =>
          this.request(url, { ...options, isRetry: true })
        );
      }

      return response;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }
  _logoutCallback = () => {};

  registerLogoutCallback(callback) {
    this._logoutCallback = callback;
  }

  handleLogoutAndRedirect() {
    this._logoutCallback();
  }

  async handleTokenRefresh(originalRequest) {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push(() => {
          resolve(originalRequest());
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      this.isRefreshing = false;

      if (refreshResponse.ok) {
        this.refreshSubscribers.forEach((callback) => callback());
        this.refreshSubscribers = [];

        return originalRequest();
      } else {
        this.handleLogoutAndRedirect();
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      this.isRefreshing = false;
      this.handleLogoutAndRedirect();
      throw error;
    }
  }

  redirectToLogin() {
    localStorage.removeItem("lastPath");
    window.location.href = "/";
  }

  async get(url, options = {}) {
    return this.request(url, { method: "GET", ...options });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async patch(url, data, options = {}) {
    return this.request(url, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { method: "DELETE", ...options });
  }

  async fetchAndFormatCities(inputValue) {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const response = await this.post(`/utils/countryList`, { inputValue });

      if (!response.ok) return [];

      const data = await response.json();
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
