import React, { useState, useEffect, useMemo } from 'react';
import '../styles/Dashboard.css';
import archiveIcon from '../assets/archiver.png';
import deleteIcon from '../assets/supprimer.png';
import editIcon from '../assets/edit-button.png';
import InfosModal from '../components/InfosModal';

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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isNew = urlParams.get('new') === 'true';

    if (isNew) {
      setShowWelcomeModal(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
    try {
      const response = await fetch(`${API_URL}/job_applies/${selectedApplication.id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(selectedApplication),
      });
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
  
      const updatedData = await response.json();
      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === updatedData.id ? { ...app, ...updatedData } : app
        )
      );
      closePopup();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la candidature:', error);
    }
  };

  const handleAddApplication = async () => {
    try {
      const response = await fetch(`${API_URL}/job_applies/add_jobApply`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: newApplication.company,
          title: newApplication.title,
          status: newApplication.status,
          location: newApplication.location,
          imageUrl: newApplication.imageUrl,
          salary: newApplication.salary,
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

  const handleDeleteApplication = async (id) => {
    try {
      const response = await fetch(`${API_URL}/job_applies/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setApplications(applications.filter((app) => app.id !== id));
    } catch (error) {
      console.error("Erreur :", error);
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
      title: '',
      status: 'PENDING',
    });
  };
  
  const closeAddPopup = () => {
    setNewApplication(null);
  };

  return (
    <div>
      <InfosModal isOpen={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
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
                  <button className="action-button delete-button" onClick={() => handleDeleteApplication(application.id)}>
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
                <h4>{application.title || "Poste inconnu"}</h4>
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
                <button className="action-button delete-button" onClick={() => handleDeleteApplication(application.id)}>
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
                value={newApplication.title}
                onChange={(e) => setNewApplication({ ...newApplication, title: e.target.value })}
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
              <label>Lieu :</label>
              <input
                type="text"
                value={newApplication.location}
                onChange={(e) => setNewApplication({ ...newApplication, location: e.target.value })}
              />
              <label>Salaire :</label>
              <input
                type="text"
                value={newApplication.salary}
                onChange={(e) => setNewApplication({ ...newApplication, salary: Number(e.target.value) })}
              />
              <label>Logo :</label>
              <input
                type="text"
                value={newApplication.imageUrl}
                onChange={(e) => setNewApplication({ ...newApplication, imageUrl: e.target.value })}
              />
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
                value={selectedApplication.company}
                onChange={(e) => setSelectedApplication({ ...selectedApplication, company: e.target.value })}
              />
              <label>Poste :</label>
              <input
                type="text"
                value={selectedApplication.title}
                onChange={(e) => setSelectedApplication({ ...selectedApplication, title: e.target.value })}
              />
              <label>Statut :</label>
              <select
                value={selectedApplication.status}
                onChange={(e) => setSelectedApplication({ ...selectedApplication, status: e.target.value })}
              >
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
              <p><strong>Poste :</strong> {selectedApplication.title || "Poste inconnu"}</p>
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
    </div>
  );
}

export default Dashboard;
