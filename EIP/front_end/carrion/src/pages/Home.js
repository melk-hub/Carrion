import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Home.css";


export default function Home() {
    const navigate = useNavigate();
    return (
        <div>
            <div className="main-content">
                <div className="dashboard-container">
                    <h1 className="title">Tableau de bord</h1>
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
                            <ul className="ranking-list">Vous êtes premier ! Enfin je crois...</ul>
                            {/*
                <p className="rank">#37</p>
                <ul className="ranking-list">
                    <li>
                    <span className="name">Joe MAIREIN</span> <span className="up">▲14</span>{" "}
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
                */}
                        </div>
                    </div>

                    <div className="bottom-section">
                        <div className="recent-activity">
                            <h3>Activité récente</h3>
                            <p>Dernière modifications</p>
                            <div className="empty-state">
                                <div className="emoji">🤔</div>
                                <p>Il n’y a pas un chat...</p>
                                <button className="see-all" onClick={() => navigate('/dashboard')}>Voir toutes les candidatures</button>
                            </div>
                        </div>

                        <div className="quick-access">
                            <h3>Accès rapide</h3>
                            <p>Accédez rapidement aux fonctionnalités</p>
                            <button onClick={() => navigate('/dashboard')}>Mes candidatures</button>
                            <button>Nouvelles candidatures</button>
                            <button onClick={() => navigate('/Archives')}>Statistiques</button>
                            <button onClick={() => navigate('/Paramaters')}>Mes informations</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
