import React from 'react';
import '../styles/Home.css';

function Home() {
return (
    <div className="container">
        <main className="dashboard">
        <section className="overview">
          <h2>Aperçu de vos candidatures</h2>
          <div className="cards">
            <div className="card">
              <p>Total</p>
              <span>0</span>
            </div>
            <div className="card waiting">
              <p>En attente</p>
              <span>0</span>
            </div>
            <div className="card accepted">
              <p>Acceptées</p>
              <span>0</span>
            </div>
            <div className="card refused">
              <p>Refusées</p>
              <span>0</span>
            </div>
          </div>
        </section>

        <section className="activity-tools">
          <div className="recent-activity">
            <h3>Activité récente</h3>
            <p>Vos 5 dernières candidatures</p>
            <p className="empty">Aucune candidature trouvée</p>
            <button>Voir toutes les candidatures</button>
          </div>

          <div className="quick-tools">
            <h3>Outils rapides</h3>
            <p>Accédez rapidement aux fonctionnalités</p>
            <button>Tableau de bord</button>
            <button>Nouvelle candidature</button>
            <button>Statistiques</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;