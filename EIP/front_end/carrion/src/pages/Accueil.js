import React from "react";
import "../styles/Accueil.css";

export default function Acceuil() {
  return (
    <div className="dashboard-container">
      <h1>Tableau de bord</h1>
      <div className="top-cards">
        <div className="card highlight">
          <h3>Dernière candidature</h3>
          <div className="job-info">
            <img
              src="https://cdn.shopify.com/assets/images/logos/shopify-bag.png"
              alt="Shopify"
            />
            <div>
              <strong>Shopify</strong>
              <p>Stage - Product Owner</p>
            </div>
          </div>
          <p className="timestamp">Il y a 17h</p>
        </div>

        <div className="card">
          <h3>Changement de statut récent</h3>
          <div className="job-info">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6a/Boursorama_Logo_2021.png"
              alt="Boursorama"
            />
            <div>
              <strong>Boursorama</strong>
              <p>CDD - Développeur Full Stack Junior</p>
            </div>
          </div>
          <p className="timestamp">Il y a 5h</p>
        </div>

        <div className="card">
          <h3>Classement</h3>
          <p className="rank">#37</p>
          <ul className="ranking-list">
            <li>
                <span className="name">Joe MAIREIN</span>
                <span className="up">▲14</span>{" "}
              <strong>#34</strong>
            </li>
            <li>
              <span className="name">Vanessa WELLE</span> <span className="down">▼4</span>{" "}
              <strong>#35</strong>
            </li>
            <li>
              <span className="name">Sabrina PADLE</span> <span className="up">▲1</span>{" "}
              <strong>#36</strong>
            </li>
            <li>
              <span className="name">Jeremy Dupont</span> <span className="up">▲2</span>{" "}
              <strong>#37</strong>
            </li>
          </ul>
        </div>
      </div>

      <div className="bottom-section">
        <div className="recent-activity">
          <h3>Activité récente</h3>
          <p>Dernière modifications</p>
          <div className="empty-state">
            <p className="note">
              Le bouton est juste là pour vous montrer à quoi ça va ressembler
              si vous validez
            </p>
            <button>Click to change view</button>
            <div className="emoji">🤔</div>
            <p>Il n’y a pas un chat...</p>
            <button className="see-all">Voir toutes les candidatures</button>
          </div>
        </div>

        <div className="quick-access">
          <h3>Accès rapide</h3>
          <p>Accédez rapidement aux fonctionnalités</p>
          <button>Mes candidatures</button>
          <button>Nouvelles candidatures</button>
          <button>Statistiques</button>
          <button>Mes informations</button>
        </div>
      </div>
    </div>
  );
}
