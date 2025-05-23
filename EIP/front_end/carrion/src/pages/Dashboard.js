"use client"

import React, { useState, useEffect, useMemo } from "react"
import "../styles/Dashboard.css"
import ApplicationCard from "../components/Dashboardcard.js"
import ApplicationList from "../components/DashboardList.js"
import AddApplicationModal from "../components/AddApplicationModal.js"
import EditApplicationModal from "../components/EditApplicationModal.js"
import DetailsModal from "../components/DetailsModal.js"

function Dashboard() {
  const [applications, setApplications] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("date")
  const [selectedStatuses, setSelectedStatuses] = useState(new Set())
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [newApplication, setNewApplication] = useState(null)
  const [popupType, setPopupType] = useState(null)
  const API_URL = process.env.REACT_APP_API_URL || "https://api.example.com"

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
      setApplications((prevApps) =>
        prevApps.map((app) => (app.id === selectedApplication.id ? { ...app, ...selectedApplication } : app)),
      )
      closePopup()
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la candidature:", error)
    }
  }

  const handleAddApplication = async () => {
    try {
      const newApp = {
        ...newApplication,
        id: applications.length + 1,
        createdAt: new Date().toISOString(),
      }
      setApplications((prevApps) => [...prevApps, newApp])
      closeAddPopup()
    } catch (error) {
      console.error("Erreur lors de l'ajout de la candidature:", error)
    }
  }

  const handleDeleteApplication = async (id) => {
    try {
      setApplications(applications.filter((app) => app.id !== id))
    } catch (error) {
      console.error("Erreur :", error)
    }
  }

  const statusMap = {
    APPLIED: "Postulée",
    PENDING: "En attente de réponse",
    OFF: "Refusée",
  }

  const handleStatusChange = (status) => {
    setSelectedStatuses((prev) => {
      const newSet = new Set(prev)
      newSet.has(status) ? newSet.delete(status) : newSet.add(status)
      return newSet
    })
  }

  const sortedAndFilteredApplications = useMemo(() => {
    const filtered = applications.filter(
      (app) =>
        (selectedStatuses.size === 0 || selectedStatuses.has(statusMap[app.status])) &&
        (app.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.title?.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === "status") {
        return statusMap[a.status].localeCompare(statusMap[b.status])
      }
      return 0
    })
  }, [applications, selectedStatuses, sortBy, searchTerm])

  const openEditPopup = (application) => {
    setSelectedApplication(application)
    setPopupType("edit")
  }

  const openDetailsPopup = (application) => {
    setSelectedApplication(application)
    setPopupType("details")
  }

  const closePopup = () => {
    setSelectedApplication(null)
    setPopupType(null)
  }

  const openAddPopup = () => {
    setNewApplication({
      company: "",
      title: "",
      status: "PENDING",
      location: "",
      salary: "",
      imageUrl: "https://via.placeholder.com/100",
    })
    setPopupType("add")
  }

  const closeAddPopup = () => {
    setNewApplication(null)
    setPopupType(null)
  }

  // Statistiques
  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "PENDING").length,
    accepted: applications.filter((app) => app.status === "ON").length,
    refused: applications.filter((app) => app.status === "OFF").length,
  }

  return (
    <div>
    <div className="main-content">
    <div className="dashboard">
      <div className="container">
        <h1 className="dashboard-title">Aperçu de vos candidatures</h1>

        <div className="stats-container">
          <div className="stat-card">
            <h3 className="stat-title">Total</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card pending">
            <h3 className="stat-title">En attente</h3>
            <p className="stat-value">{stats.pending}</p>
          </div>
          <div className="stat-card accepted">
            <h3 className="stat-title">Acceptées</h3>
            <p className="stat-value">{stats.accepted}</p>
          </div>
          <div className="stat-card refused">
            <h3 className="stat-title">Refusées</h3>
            <p className="stat-value">{stats.refused}</p>
          </div>
        </div>

        <div className="banner">
          <div className="banner-content">
            <h2 className="banner-title">Trouvez votre emploi idéal</h2>
            <p className="banner-text">Suivez vos candidatures et maximisez vos chances de succès</p>
          </div>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher une candidature"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="dashboard-controls">
          <div className="filter-container">
            {Object.values(statusMap).map((status) => (
              <label key={status} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedStatuses.has(status)}
                  onChange={() => handleStatusChange(status)}
                />
                <span className="checkbox-label">{status}</span>
              </label>
            ))}
          </div>

          <div className="controls-right">
            <div className="sort-container">
              <label htmlFor="sort-select" className="sort-label">
                TRIER PAR :
              </label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Date</option>
                <option value="status">Statut</option>
              </select>
            </div>

            <div className="view-toggle">
              <button
                className={`toggle-button ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                GRILLE
              </button>
              <button
                className={`toggle-button ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                LISTE
              </button>
            </div>

            <button className="add-button" onClick={openAddPopup}>
              AJOUTER UNE CANDIDATURE
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="applications-grid">
            {sortedAndFilteredApplications.length > 0 ? (
              sortedAndFilteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  statusMap={statusMap}
                  onEdit={openEditPopup}
                  onDelete={handleDeleteApplication}
                  onDetails={openDetailsPopup}
                />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3 className="empty-title">Aucune candidature trouvée</h3>
                <p className="empty-text">
                  Commencez à suivre vos candidatures d'emploi en ajoutant votre première candidature
                </p>
                <button className="add-button" onClick={openAddPopup}>
                  AJOUTER UNE CANDIDATURE
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="applications-list">
            {sortedAndFilteredApplications.length > 0 ? (
              sortedAndFilteredApplications.map((application) => (
                <ApplicationList
                  key={application.id}
                  application={application}
                  statusMap={statusMap}
                  onEdit={openEditPopup}
                  onDelete={handleDeleteApplication}
                  onDetails={openDetailsPopup}
                />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3 className="empty-title">Aucune candidature trouvée</h3>
                <p className="empty-text">
                  Commencez à suivre vos candidatures d'emploi en ajoutant votre première candidature
                </p>
                <button className="add-button" onClick={openAddPopup}>
                  AJOUTER UNE CANDIDATURE
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {popupType === "add" && (
        <AddApplicationModal
          newApplication={newApplication}
          setNewApplication={setNewApplication}
          onAdd={handleAddApplication}
          onClose={closeAddPopup}
          statusMap={statusMap}
        />
      )}

      {popupType === "edit" && selectedApplication && (
        <EditApplicationModal
          application={selectedApplication}
          setApplication={setSelectedApplication}
          onUpdate={handleUpdateApplication}
          onClose={closePopup}
          statusMap={statusMap}
        />
      )}

      {popupType === "details" && selectedApplication && (
        <DetailsModal application={selectedApplication} onClose={closePopup} statusMap={statusMap} />
      )}
    </div>
    </div>
    </div>
  )
}

export default Dashboard
