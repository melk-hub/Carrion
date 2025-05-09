import React, { useState, useEffect, useMemo } from 'react';
import '../styles/Archives.css';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/carrion_logo_crop.png';
import "../styles/Navbar.css";

// function Archives() {
//   const fakeDatabase = [
//     {
//       id: 1,
//       logo: 'https://via.placeholder.com/100',
//       companyName: 'Entreprise A',
//       jobTitle: 'Développeur Frontend',
//       status: 'En attente de réponse',
//       applicationDate: '2024-12-01',
//     },
//     {
//       id: 2,
//       logo: 'https://via.placeholder.com/100',
//       companyName: 'Entreprise B',
//       jobTitle: 'Ingénieur Backend',
//       status: 'Acceptée',
//       applicationDate: '2024-12-10',
//     },
//     {
//       id: 3,
//       logo: 'https://via.placeholder.com/100',
//       companyName: 'Entreprise C',
//       jobTitle: 'Designer UI/UX',
//       status: 'Refusée',
//       applicationDate: '2024-12-15',
//     },
//     {
//       id: 4,
//       logo: 'https://via.placeholder.com/100',
//       companyName: 'Entreprise D',
//       jobTitle: 'Développeur Backend',
//       status: 'En attente de réponse',
//       applicationDate: "Aujourd'hui",
//     },
//     {
//       id: 5,
//       logo: 'https://via.placeholder.com/100',
//       companyName: 'Entreprise E',
//       jobTitle: 'Chef de Projet IT',
//       status: 'En attente de réponse',
//       applicationDate: "Aujourd'hui",
//     },
//     {
//       id: 6,
//       logo: 'https://via.placeholder.com/100',
//       companyName: 'Entreprise F',
//       jobTitle: 'Consultant DevOps',
//       status: 'En attente de réponse',
//       applicationDate: "Aujourd'hui",
//     },
//   ];

//   const [applications, setApplications] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [viewMode, setViewMode] = useState('list');

//   useEffect(() => {
//     const loadFakeData = () => {
//       setTimeout(() => {
//         setApplications(fakeDatabase);
//       }, 500);
//     };
//     loadFakeData();
//   }, []);

//   const filteredApplications = applications.filter((application) => {
//     const searchableContent = `
//       ${application.companyName.toLowerCase()}
//       ${application.jobTitle.toLowerCase()}
//       ${application.status.toLowerCase()}
//       ${application.applicationDate.toLowerCase()}
//     `;
//     return searchableContent.includes(searchTerm.toLowerCase());
//   });

//   return (
//     <div>
//       <div className="top-bar">
//         <div className='archives-title'>
//           <h1>Mes Archives</h1>
//         </div>
//         <div className="search-input-container">
//           <span className="search-icon">🔍</span>
//           <input
//             type="text"
//             placeholder="Rechercher une candidature"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="search-input"
//           />
//         </div>
//       </div>

//       <div className="archives-toggle-buttons">
//         <button
//           className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
//           onClick={() => setViewMode('list')}
//         >Voir liste
//         </button>
//         <button
//           className={`toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
//           onClick={() => setViewMode('grid')}
//         >Voir grille
//         </button>
//       </div>

//       {viewMode === 'list' && (
//         <div className="archives-list">
//           {filteredApplications.length > 0 ? (
//             filteredApplications.map((application) => (
//               <div key={application.id} className="archives-list-card">
//                 <img
//                   src={application.logo}
//                   alt={`${application.companyName} logo`}
//                   className="archives-list-logo"
//                 />
//                 <div className="archives-list-details">
//                   <h3 className="archives-list-company-name">{application.companyName}</h3>
//                   <p className="archives-list-job-title">{application.jobTitle}</p>
//                   <p className="archives-list-status">Statut : {application.status}</p>
//                   <p className="archives-list-date">Date de candidature : {application.applicationDate}</p>
//                   <button className="archives-list-button">Voir les détails</button>
//                 </div>
//                 <div className={`archives-list-status-banner ${application.status.toLowerCase()}`}></div>
//               </div>
//             ))
//           ) : (
//             <p>Aucune candidature trouvée</p>
//           )}
//         </div>
//       )}

//       {viewMode === 'grid' && (
//         <div className="archives-grid">
//           {filteredApplications.length > 0 ? (
//             filteredApplications.map((application) => (
//             <div key={application.id} className="archives-grid-card">
//               <div className="archives-grid-header">
//                 <img
//                   src={application.logo}
//                   alt={`${application.companyName} logo`}
//                   className="archives-grid-logo"
//                 />
//                 <div className="archives-grid-company-name">{application.companyName}</div>
//               </div>
//               <div className="archives-grid-content">
//                 <h4>{application.jobTitle}</h4>
//                 <hr />
//                 <p>Statut : {application.status}</p>
//                 <small>Date de candidature : {application.applicationDate}</small>
//               </div>
//               <button className="archives-grid-button">Voir les détails</button>
//               <div className={`archives-grid-status-banner ${application.status.toLowerCase()}`}></div>
//             </div>
//           ))
//           ) : (
//             <p>Aucune candidature trouvée</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

function Archives() {
  const navigate = useNavigate();
  const fakeDatabase = useMemo(() => [
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
  ], []);

  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    const loadFakeData = () => {
      setTimeout(() => {
        setApplications(fakeDatabase);
      }, 500);
    };
    loadFakeData();
  }, [fakeDatabase]);

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
    <div className="layout">
          <header className="topbar">
            <div className="notifications">
              <span className="bell">🔔</span>
            </div>
            <div className="user-profile" onClick={() => navigate('/parameters')}>
              <img alt="User" className="avatar" />
              <span className="username">Jeremy</span>
            </div>
          </header>
      
          <div className="layout-body">
            <nav className={`sidebar`}>
            <div className="logo">
              <span className="icon" onClick={() => navigate('/home')}>
                <img src={logo} alt="Carrion" className="logo-img"/>
                <span className="logo-text">CARRION</span>
              </span>
            </div>
              <ul className="menu">
                <li onClick={() => navigate('/home')}>
                  <span>🏠</span> {"Accueil"}
                </li>
                <li onClick={() => navigate('/dashboard')}>
                  <span>📄</span> {"Candidatures"}
                </li>
                <li onClick={() => navigate('/archives')}>
                  <span>📊</span> {"Archives"}
                </li>
              </ul>
            </nav>
          </div>
            <main className="main-content">
    <div>
      <div className="top-bar">
        <div className='archives-title'>
          <h1>Mes Archives</h1>
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

      <div className="archives-toggle-buttons">
        <button
          className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >Voir liste
        </button>
        <button
          className={`toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
        >Voir grille
        </button>
      </div>

      {viewMode === 'list' && (
        <div className="archives-list">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <div key={application.id} className="archives-list-card">
                <img
                  src={application.logo}
                  alt={`${application.companyName} logo`}
                  className="archives-list-logo"
                />
                <div className="archives-list-details">
                  <h3 className="archives-list-company-name">{application.companyName}</h3>
                  <p className="archives-list-job-title">{application.jobTitle}</p>
                  <p className="archives-list-status">Statut : {application.status}</p>
                  <p className="archives-list-date">Date de candidature : {application.applicationDate}</p>
                  <button className="archives-list-button">Voir les détails</button>
                </div>
                <div className={`archives-list-status-banner ${application.status.toLowerCase()}`}></div>
              </div>
            ))
          ) : (
            <p>Aucune candidature trouvée</p>
          )}
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="archives-grid">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
            <div key={application.id} className="archives-grid-card">
              <div className="archives-grid-header">
                <img
                  src={application.logo}
                  alt={`${application.companyName} logo`}
                  className="archives-grid-logo"
                />
                <div className="archives-grid-company-name">{application.companyName}</div>
              </div>
              <div className="archives-grid-content">
                <h4>{application.jobTitle}</h4>
                <hr />
                <p>Statut : {application.status}</p>
                <small>Date de candidature : {application.applicationDate}</small>
              </div>
              <button className="archives-grid-button">Voir les détails</button>
              <div className={`archives-grid-status-banner ${application.status.toLowerCase()}`}></div>
            </div>
          ))
          ) : (
            <p>Aucune candidature trouvée</p>
          )}
        </div>
      )}
    </div>
            </main>
            </div>
  );
}

export default Archives;
