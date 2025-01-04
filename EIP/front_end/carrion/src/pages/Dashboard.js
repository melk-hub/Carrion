import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

// function Dashboard() {
//   const [applications, setApplications] = useState([]);

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

//   return (
//     <div className="dashboard-container">
//       {applications.map((application) => (
//         <div key={application.id} className="dashboard-card">
//           <img
//             src={application.logo}
//             alt={`${application.companyName} logo`}
//             className="dashboard-logo"
//           />
//           <div className="dashboard-details">
//             <h3 className="dashboard-company-name">{application.companyName}</h3>
//             <p className="dashboard-job-title">{application.jobTitle}</p>
//             <p className="dashboard-status">Statut : {application.status}</p>
//             <p className="dashboard-date">Date de candidature : {application.applicationDate}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

function Dashboard() {
  const fakeDatabase = [
    {
      id: 1,
      logo: 'https://via.placeholder.com/75',
      companyName: 'Entreprise A',
      jobTitle: 'Développeur Frontend',
      status: 'En cours',
      applicationDate: '2024-12-01',
    },
    {
      id: 2,
      logo: 'https://via.placeholder.com/75',
      companyName: 'Entreprise B',
      jobTitle: 'Ingénieur Backend',
      status: 'Acceptée',
      applicationDate: '2024-12-10',
    },
    {
      id: 3,
      logo: 'https://via.placeholder.com/75',
      companyName: 'Entreprise C',
      jobTitle: 'Designer UI/UX',
      status: 'Refusée',
      applicationDate: '2024-12-15',
    },
    {
      id: 4,
      logo: 'https://via.placeholder.com/75',
      companyName: 'Entreprise D',
      jobTitle: 'Développeur Backend',
      status: 'En attente de réponse',
      applicationDate: "Aujourd'hui",
    },
    {
      id: 5,
      logo: 'https://via.placeholder.com/75',
      companyName: 'Entreprise E',
      jobTitle: 'Chef de Projet IT',
      status: 'En attente de réponse',
      applicationDate: "Aujourd'hui",
    },
    {
      id: 6,
      logo: 'https://via.placeholder.com/75',
      companyName: 'Entreprise F',
      jobTitle: 'Consultant DevOps',
      status: 'En attente de réponse',
      applicationDate: "Aujourd'hui",
    },
  ];

  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadFakeData = () => {
      setTimeout(() => {
        setApplications(fakeDatabase);
      }, 500);
    };

    loadFakeData();
  }, []);

  const filteredApplications = applications.filter((application) => {
    const searchableContent = `
      ${application.companyName.toLowerCase()}
      ${application.jobTitle.toLowerCase()}
      ${application.status.toLowerCase()}
      ${application.applicationDate.toLowerCase()}
    `;
    return searchableContent.includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <div className="preface">
        <div className="objectives">
          <p>Objectif de la semaine: 3/10</p>
        </div>
        <div className='dashboard-title'>
          <p>Mes Candidatures</p>
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
      <div className="dashboard-container">
      {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <div key={application.id} className="dashboard-card">
              <img
                src={application.logo}
                alt={`${application.companyName} logo`}
                className="dashboard-logo"
              />
              <div className="dashboard-details">
                <h3 className="dashboard-company-name">{application.companyName}</h3>
                <p className="dashboard-job-title">{application.jobTitle}</p>
                <p className="dashboard-status">Statut : {application.status}</p>
                <p className="dashboard-date">Date de candidature : {application.applicationDate}</p>
              </div>
            </div>
          ))
        ) : (
          <p>Aucune candidature trouvée</p>
        )}
      </div>
      <div className="dashboard-row">
      {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
          <div key={application.id} className="dashboard-new-card">
            <div className="card-header">
              <img
                src={application.logo}
                alt={`${application.companyName} logo`}
                className="new-card-logo"
              />
              <div className="new-card-company">{application.companyName}</div>
            </div>
            <div className="card-content">
              <h4>{application.jobTitle}</h4>
              <hr />
              <p>{application.status}</p>
              <small>{application.applicationDate}</small>
            </div>
            <button className="new-card-button">Voir les détails</button>
          </div>
        ))
        ) : (
          <p>Aucune candidature trouvée</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
