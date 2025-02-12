import React, { useState, useEffect, useMemo } from 'react';
import '../styles/Dashboard.css';
import archiveIcon from '../assets/archiver.png';
import deleteIcon from '../assets/supprimer.png';

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('date');
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Aucun token trouvé, l'utilisateur doit se reconnecter.");
        return;
      }
      try {
        const response = await fetch(`${API_URL}/job-applies/jobApply`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    fetchApplications();
  }, [API_URL]);
  

  const handleStatusChange = (status) => {
    setSelectedStatuses((prev) => {
        const newSet = new Set(prev);
        newSet.has(status) ? newSet.delete(status) : newSet.add(status);
        return newSet;
    });
  };

  const sortedAndFilteredApplications = useMemo(() => {
    const filtered = applications.filter(app => 
      (selectedStatuses.size === 0 || selectedStatuses.has(app.status)) &&
      (
        (app.company?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || 
        (app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
      )
    );  
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });
  }, [applications, selectedStatuses, sortBy, searchTerm]);
  
  return (
    <div>
      <div className="top-bar">
        <div className="objectives">
          {/* <h3>Objectif de la semaine :</h3> */}
        </div>
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher une candidature"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="dashboard-filter-buttons">
        <div className="filter-checkbox-group">
          {['Acceptée', 'En attente de réponse', 'Refusée'].map(status => (
              <label key={status} className="filter-checkbox">
                  <input
                      type="checkbox"
                      checked={selectedStatuses.has(status)}
                      onChange={() => handleStatusChange(status)}
                  />
                  <span className="custom-checkbox"></span>
                  {status}
              </label>
          ))}
        </div>
        <div className="sort-options">
            <label htmlFor="sort-select">Trier par : </label>
            <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date">Date</option>
                <option value="status">Statut</option>
            </select>
        </div>

        <div className="view-toggle">
          <button
            className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            Liste
          </button>
          <button
            className={`toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grille
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="dashboard-list">
          {sortedAndFilteredApplications.length > 0 ? (
            sortedAndFilteredApplications.map((application) => (
              <div key={application.id} className={`dashboard-list-card ${application.status.toLowerCase()}`}>
                <img
                  src={application.imageUrl}
                  alt={`${application.company} logo`}
                  className="dashboard-list-logo"
                />
                <div className="dashboard-list-content">
                  <h3 className="dashboard-list-company-name">{application.company || "Entreprise inconnue"}</h3>
                  <p className="dashboard-list-job-title">{application.jobTitle || "Titre inconnu"}</p>
                  <p className="dashboard-list-status">
                    Statut : <span className={`status-text ${application.status.toLowerCase()}`}>{application.status}</span>
                  </p>
                  <p className="dashboard-list-date">Date de candidature : {new Date(application.createdAt).toLocaleDateString('fr-FR') || "Date inconnue"}</p>
                  <button className="dashboard-list-details">Voir les détails</button>
                </div>
                <div className="dashboard-list-actions">
                  <button className="action-button archive-button">
                    <img src={archiveIcon} alt="Archiver"/>
                    <span className="list-tooltip">Archiver</span>
                  </button>
                  <button className="action-button delete-button">
                    <img src={deleteIcon} alt="Supprimer"/>
                    <span className="list-tooltip">Supprimer</span>
                  </button>
                </div>
                <div className={`dashboard-list-status-banner ${application.status.toLowerCase()}`}></div>
              </div>
            ))
          ) : (
            <p>Aucune candidature trouvée</p>
          )}
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="dashboard-grid">
          {sortedAndFilteredApplications.length > 0 ? (
            sortedAndFilteredApplications.map((application) => (
            <div key={application.id} className={`dashboard-grid-card ${application.status.toLowerCase()}`}>
              <div className="dashboard-grid-header">
              <img
                  src={application.imageUrl}
                  alt={`${application.company} logo`}
                  className="dashboard-grid-logo"
                />
                <div className="dashboard-grid-company-name">{application.company || "Entreprise inconnue"}</div>
              </div>
              <div className="dashboard-grid-content">
                <h4>{application.jobTitle || "Titre inconnu"}</h4>
                <hr />
                <p className="dashboard-grid-status">
                  Statut : <span className={`status-text ${application.status.toLowerCase()}`}>{application.status}</span>
                </p>
                <p>Date de candidature : {new Date(application.createdAt).toLocaleDateString('fr-FR') || "Date inconnue"}</p>
              </div>
              <button className="dashboard-grid-details">Voir les détails</button>
              <div className="dashboard-grid-actions">
                <button className="action-button archive-button">
                  <img src={archiveIcon} alt="Archiver"/>
                  <span className="grid-tooltip">Archiver</span>
                </button>
                <button className="action-button delete-button">
                  <img src={deleteIcon} alt="Supprimer"/>
                  <span className="grid-tooltip">Supprimer</span>
                </button>
              </div>
              <div className={`dashboard-grid-status-banner ${application.status.toLowerCase()}`}></div>
            </div>
          ))
          ) : (
            <p>Aucune candidature trouvée</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
