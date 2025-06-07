import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import "../styles/Home.css";

export default function Home() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    
    return (
        <div>
            <div className="dashboard-container">
                <h1 className="title">{t('home.welcome')}</h1>
                <div className="top-cards">
                    <div className="card highlight">
                        <h3>{t('home.recentApplications')}</h3>
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
                        <h3>{t('home.recentStatusChange')}</h3>
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
                        <h3>{t('home.ranking')}</h3>
                        <ul className="ranking-list">{t('home.rankingMessage')}</ul>
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
                        <h3>{t('home.recentActivity')}</h3>
                        <p>{t('home.lastModifications')}</p>
                        <div className="empty-state">
                            <div className="emoji">🤔</div>
                            <p>{t('home.noActivity')}</p>
                            <button className="see-all" onClick={() => navigate('/dashboard')}>{t('home.seeAllApplications')}</button>
                        </div>
                    </div>

                    <div className="quick-access">
                        <h3>{t('home.quickAccess')}</h3>
                        <p>{t('home.quickAccessDescription')}</p>
                        <button onClick={() => navigate('/dashboard')}>{t('home.myApplications')}</button>
                        <button>{t('home.newApplications')}</button>
                        <button onClick={() => navigate('/Archives')}>{t('home.statistics')}</button>
                        <button onClick={() => navigate('/Paramaters')}>{t('home.myInformation')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
