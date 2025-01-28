import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import archiveIcon from '../assets/archiver.png';
import deleteIcon from '../assets/supprimer.png';

// function Dashboard() {
//   useEffect(() => {
//     const fetchApplications = async () => {
//       try {
//         const response = await fetch('https://api.example.com/applications');
//         const data = await response.json();
//         setApplications(data);
//       } catch (error) {
//         console.error('Erreur lors de la récupération des données:', error);
//       }
//     };
//     fetchApplications();
//   }, []);
// }

function Dashboard() {
  const fakeDatabase = [
    {
      id: 1,
      logo: 'https://via.placeholder.com/100',
      companyName: 'Entreprise A',
      jobTitle: 'Développeur Frontend',
      status: 'En attente de réponse',
      applicationDate: '2024-12-01',
    },
    {
      id: 2,
      logo: 'https://via.placeholder.com/100',
      companyName: 'Entreprise B',
      jobTitle: 'Ingénieur Backend',
      status: 'Acceptée',
      applicationDate: '2024-12-10',
    },
    {
      id: 3,
      logo: 'https://via.placeholder.com/100',
      companyName: 'Entreprise C',
      jobTitle: 'Designer UI/UX',
      status: 'Refusée',
      applicationDate: '2024-12-15',
    },
    {
      id: 4,
      logo: 'https://via.placeholder.com/100',
      companyName: 'Entreprise D',
      jobTitle: 'Développeur Backend',
      status: 'En attente de réponse',
      applicationDate: "Aujourd'hui",
    },
    {
      id: 5,
      logo: 'https://via.placeholder.com/100',
      companyName: 'Entreprise E',
      jobTitle: 'Chef de Projet IT',
      status: 'En attente de réponse',
      applicationDate: "Aujourd'hui",
    },
    {
      id: 6,
      logo: 'https://via.placeholder.com/100',
      companyName: 'Entreprise F',
      jobTitle: 'Consultant DevOps',
      status: 'En attente de réponse',
      applicationDate: "Aujourd'hui",
    },
  ];

  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  useEffect(() => {
    const loadFakeData = () => {
      setTimeout(() => {
        setApplications(fakeDatabase);
      }, 500);
    };
    loadFakeData();
  }, []);

  const handleStatusChange = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const filteredApplications = applications.filter((application) => {
    const searchableContent = `
      ${application.companyName.toLowerCase()}
      ${application.jobTitle.toLowerCase()}
      ${application.status.toLowerCase()}
      ${application.applicationDate.toLowerCase()}
    `;
    const matchesSearch = searchableContent.includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatuses.length
      ? selectedStatuses.includes(application.status)
      : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="top-bar">
        <div className="objectives">
          <h3>Objectif de la semaine :</h3>
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
          {['Acceptée', 'En attente de réponse', 'Refusée'].map((status) => (
            <label key={status} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status)}
                onChange={() => handleStatusChange(status)}
              />
              <span className="custom-checkbox"></span>
              {status}
            </label>
          ))}
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
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <div key={application.id} className="dashboard-list-card">
                <img
                  src={application.logo}
                  alt={`${application.companyName} logo`}
                  className="dashboard-list-logo"
                />
                <div className="dashboard-list-content">
                  <h3 className="dashboard-list-company-name">{application.companyName}</h3>
                  <p className="dashboard-list-job-title">{application.jobTitle}</p>
                  <p className="dashboard-list-status">Statut : {application.status}</p>
                  <p className="dashboard-list-date">Date de candidature : {application.applicationDate}</p>
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
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
            <div key={application.id} className="dashboard-grid-card">
              <div className="dashboard-grid-header">
                <img
                  src={application.logo}
                  alt={`${application.companyName} logo`}
                  className="dashboard-grid-logo"
                />
                <div className="dashboard-grid-company-name">{application.companyName}</div>
              </div>
              <div className="dashboard-grid-content">
                <h4>{application.jobTitle}</h4>
                <hr />
                <p>Statut : {application.status}</p>
                <p>Date de candidature : {application.applicationDate}</p>
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
