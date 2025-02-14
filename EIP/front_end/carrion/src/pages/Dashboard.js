import React, { useState, useEffect, useMemo } from 'react';
import '../styles/Dashboard.css';
import archiveIcon from '../assets/archiver.png';
import deleteIcon from '../assets/supprimer.png';
import editIcon from '../assets/edit-button.png';

function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [newApplication, setNewApplication] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(`${API_URL}/job_applies/get_jobApply`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };
    fetchApplications();
  }, [API_URL]);

  const handleUpdateApplication = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé, l'utilisateur doit se reconnecter.");
      return;
    }
  
    const updatedApplication = {
      company: selectedApplication.company,
      jobTitle: selectedApplication.title,
      status: selectedApplication.status,
    };
  
    try {
      const response = await fetch(`${API_URL}/job-applies/jobApply/${selectedApplication.id}`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedApplication),
      });
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
  
      const data = await response.json();
      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === data.id ? { ...app, ...data } : app
        )
      );
      closePopup();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la candidature:', error);
    }
  };

  const handleAddApplication = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé, l'utilisateur doit se reconnecter.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/job-applies/jobApply`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: newApplication.company,
          title: newApplication.title,
          status: newApplication.status,
        }),
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setApplications((prevApps) => [...prevApps, data]);
      closeAddPopup();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la candidature:', error);
    }
  };  

  const statusMap = {
    ON: "Acceptée",
    PENDING: "En attente de réponse",
    OFF: "Refusée"
  };

  const handleStatusChange = (status) => {
    setSelectedStatuses((prev) => {
        const newSet = new Set(prev);
        newSet.has(status) ? newSet.delete(status) : newSet.add(status);
        return newSet;
    });
  };

  const sortedAndFilteredApplications = useMemo(() => {
    const filtered = applications.filter(app => 
      (selectedStatuses.size === 0 || selectedStatuses.has(statusMap[app.status])) &&
      (
        (app.company?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || 
        (app.title?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
      )
    );  
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'status') {
        return statusMap[a.status].localeCompare(statusMap[b.status]);
      }
      return 0;
    });
  }, [applications, selectedStatuses, sortBy, searchTerm]);
  
  const openEditPopup = (application) => {
    setSelectedApplication(application);
    setPopupType('edit');
  };
  
  const openDetailsPopup = (application) => {
    setSelectedApplication(application);
    setPopupType('details');
  };

  const closePopup = () => {
    setSelectedApplication(null);
    setPopupType(null);
  };

  const openAddPopup = () => {
    setNewApplication({
      company: '',
      jobTitle: '',
      status: 'PENDING',
    });
  };
  
  const closeAddPopup = () => {
    setNewApplication(null);
  };

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
          {Object.values(statusMap).map(status => (
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
            className={`toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grille
          </button>
          <button
            className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            Liste
          </button>
        </div>
        <div className="add-button">
          <button className="add-application" onClick={openAddPopup}>
            Ajouter une candidature
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
                  <p className="dashboard-list-job-title">{application.title || "Poste inconnu"}</p>
                  <p className="dashboard-list-status">
                    Statut : <span className={`status-text ${application.status.toLowerCase()}`}>
                      {statusMap[application.status.trim().toUpperCase()] || " Statut inconnu"}
                    </span>
                  </p>                
                  <p className="dashboard-list-date">Date de candidature : {new Date(application.createdAt).toLocaleDateString('fr-FR') || " Date inconnue"}</p>
                  <button className="dashboard-list-details" onClick={() => openDetailsPopup(application)}>Voir les détails</button>
                </div>
                <div className="dashboard-list-actions">
                  <button className="action-button edit-button" onClick={() => openEditPopup(application)}>
                    <img src={editIcon} alt="Modifier"/>
                    <span className="list-tooltip">Modifier</span>
                  </button>
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
                <h4>{application.jobTitle || "Poste inconnu"}</h4>
                <hr />
                <p className="dashboard-list-status">
                  Statut : <span className={`status-text ${application.status.toLowerCase()}`}>
                    {statusMap[application.status.trim().toUpperCase()] || " Statut inconnu"}
                  </span>
                </p>
                <p>Date de candidature : {new Date(application.createdAt).toLocaleDateString('fr-FR') || " Date inconnue"}</p>
              </div>
              <button className="dashboard-grid-details" onClick={() => openDetailsPopup(application)}>Voir les détails</button>
              <div className="dashboard-grid-actions">
                <button className="action-button edit-button" onClick={() => openEditPopup(application)}>
                  <img src={editIcon} alt="Modifier" />
                  <span className="grid-tooltip">Modifier</span>
                </button>
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
      {newApplication && (
        <div className={`popup-overlay ${newApplication ? 'active' : ''}`}>
          <div className="popup-container">
            <h2 className="popup-header">Ajouter une candidature</h2>
            <div className="popup-content">
              <label>Entreprise :</label>
              <input
                type="text"
                value={newApplication.company}
                onChange={(e) => setNewApplication({ ...newApplication, company: e.target.value })}
              />

              <label>Poste :</label>
              <input
                type="text"
                value={newApplication.jobTitle}
                onChange={(e) => setNewApplication({ ...newApplication, jobTitle: e.target.value })}
              />

              <label>Statut :</label>
              <select
                value={newApplication.status}
                onChange={(e) => setNewApplication({ ...newApplication, status: e.target.value })}
              >
                <option value="PENDING">En attente de réponse</option>
                <option value="ON">Acceptée</option>
                <option value="OFF">Refusée</option>
              </select>
            </div>
            <div className="popup-buttons">
              <button className="popup-button cancel" onClick={closeAddPopup}>
                Annuler
              </button>
              <button className="popup-button confirm" onClick={handleAddApplication}>
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedApplication && popupType === 'edit' && (
        <div className="popup-overlay active">
          <div className="popup-container">
            <h2 className="popup-header">Modifier la candidature</h2>
            <div className="popup-content">
              <label>Entreprise :</label>
              <input
                type="text"
                defaultValue={selectedApplication.company}
              />
              <label>Poste :</label>
              <input
                type="text"
                defaultValue={selectedApplication.jobTitle}
              />
              <label>Statut :</label>
              <select defaultValue={selectedApplication.status}>
                <option value="PENDING">En attente de réponse</option>
                <option value="ON">Acceptée</option>
                <option value="OFF">Refusée</option>
              </select>
            </div>
            <div className="popup-buttons">
              <button className="popup-button cancel" onClick={closePopup}>Annuler</button>
              <button className="popup-button confirm" onClick={handleUpdateApplication}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {selectedApplication && popupType === 'details' && (
        <div className="popup-overlay active">
          <div className="popup-container">
            <h2 className="popup-header">Détails de la candidature</h2>
            <div className="popup-content">
              <p><strong>Entreprise :</strong> {selectedApplication.company || "Entreprise inconnue"}</p>
              <p><strong>Poste :</strong> {selectedApplication.jobTitle || "Poste inconnu"}</p>
              <p><strong>Statut :</strong> {statusMap[selectedApplication.status.toUpperCase()] || "Statut inconnu"}</p>
              <p><strong>Date de candidature :</strong> {new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR') || "Date inconnue"}</p>
              <p><strong>Lieu :</strong> {selectedApplication.location}</p>
              <p><strong>Salaire :</strong> {selectedApplication.salary}</p>
            </div>
            <div className="popup-buttons">
              <button className="popup-button confirm" onClick={closePopup}>Fermer</button>
            </div>
          </div>
        </div>
      )}
      {newApplication && (
        <div className={`popup-overlay ${newApplication ? 'active' : ''}`}>
          <div className="popup-container">
            <h2 className="popup-header">Ajouter une candidature</h2>
            <div className="popup-content">
              <label>Entreprise :</label>
              <input
                type="text"
                value={newApplication.company}
                onChange={(e) => setNewApplication({ ...newApplication, company: e.target.value })}
              />

              <label>Poste :</label>
              <input
                type="text"
                value={newApplication.jobTitle}
                onChange={(e) => setNewApplication({ ...newApplication, jobTitle: e.target.value })}
              />

              <label>Statut :</label>
              <select
                value={newApplication.status}
                onChange={(e) => setNewApplication({ ...newApplication, status: e.target.value })}
              >
                <option value="PENDING">En attente de réponse</option>
                <option value="ON">Acceptée</option>
                <option value="OFF">Refusée</option>
              </select>
            </div>
            <div className="popup-buttons">
              <button className="popup-button cancel" onClick={closeAddPopup}>
                Annuler
              </button>
              <button className="popup-button confirm" onClick={handleAddApplication}>
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
