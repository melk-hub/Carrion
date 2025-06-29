import React, { useState, useEffect } from 'react';
import apiService from '../services/api.js';
import '../styles/Settings.css';
import Loading from '../components/Loading';

function Settings() {
  const [goalSettings, setGoalSettings] = useState({
    weeklyGoal: 10,
    monthlyGoal: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchGoalSettings();
  }, []);

  const fetchGoalSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/settings/goal", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoalSettings({
          weeklyGoal: data.weeklyGoal || 10,
          monthlyGoal: data.monthlyGoal || 30
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres d'objectif :", error);
    } finally {
      setLoading(false);
    }
  };

  const saveGoalSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await apiService.put("/settings/goal", goalSettings, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres d'objectif :", error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setGoalSettings(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  if (loading) {
    return <Loading message="Chargement des paramètres..." />;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Paramètres</h1>
        <p>Configurez vos préférences et objectifs</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="section-header">
            <h2>Objectifs de candidatures</h2>
            <p>Définissez vos objectifs de candidatures pour rester motivé</p>
          </div>

          <form onSubmit={saveGoalSettings} className="goal-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="weeklyGoal">
                  Objectif hebdomadaire
                </label>
                <input
                  id="weeklyGoal"
                  type="number"
                  min="1"
                  max="100"
                  value={goalSettings.weeklyGoal}
                  onChange={(e) => handleInputChange('weeklyGoal', e.target.value)}
                  required
                />
                <small>Nombre de candidatures par semaine</small>
              </div>

              <div className="form-group">
                <label htmlFor="monthlyGoal">
                  Objectif mensuel
                </label>
                <input
                  id="monthlyGoal"
                  type="number"
                  min="1"
                  max="500"
                  value={goalSettings.monthlyGoal}
                  onChange={(e) => handleInputChange('monthlyGoal', e.target.value)}
                  required
                />
                <small>Nombre de candidatures par mois</small>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="btn-spinner"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    Sauvegarder
                  </>
                )}
              </button>
            </div>

            {success && (
              <div className="success-message">
                Paramètres sauvegardés avec succès !
              </div>
            )}
          </form>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>Notifications</h2>
            <p>Gérez vos préférences de notifications</p>
          </div>
          
          <div className="feature-coming-soon">
            <p>Cette fonctionnalité sera bientôt disponible</p>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>Apparence</h2>
            <p>Personnalisez l'interface de l'application</p>
          </div>
          
          <div className="feature-coming-soon">
            <p>Cette fonctionnalité sera bientôt disponible</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 