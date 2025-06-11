class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || "http://localhost:3000";
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  async request(url, options = {}) {
    const fullUrl = `${this.baseURL}${url}`;
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(fullUrl, defaultOptions);
      
      // Si la réponse est 401 (Unauthorized), essayer de refresh le token
      if (response.status === 401 && !this.isRefreshing) {
        return this.handleTokenRefresh(fullUrl, defaultOptions);
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async handleTokenRefresh(originalUrl, originalOptions) {
    if (this.isRefreshing) {
      // Si un refresh est déjà en cours, attendre qu'il se termine
      return new Promise((resolve) => {
        this.refreshSubscribers.push(() => {
          resolve(fetch(originalUrl, originalOptions));
        });
      });
    }

    this.isRefreshing = true;

    try {
      // Essayer de refresh le token via notre endpoint backend
      const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        // Token rafraîchi avec succès, retry la requête originale
        this.isRefreshing = false;
        
        // Notifier tous les abonnés que le refresh est terminé
        this.refreshSubscribers.forEach(callback => callback());
        this.refreshSubscribers = [];
        
        return fetch(originalUrl, originalOptions);
      } else {
        // Échec du refresh, rediriger vers login
        this.isRefreshing = false;
        this.redirectToLogin();
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      this.isRefreshing = false;
      this.redirectToLogin();
      throw error;
    }
  }

  redirectToLogin() {
    // Nettoyer le localStorage et rediriger vers login
    localStorage.removeItem('lastPath');
    window.location.href = '/';
  }

  // Méthodes raccourcies pour les différents types de requêtes
  async get(url, options = {}) {
    return this.request(url, { method: 'GET', ...options });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async patch(url, data, options = {}) {
    return this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { method: 'DELETE', ...options });
  }
}

// Exporter une instance singleton
export default new ApiService(); 