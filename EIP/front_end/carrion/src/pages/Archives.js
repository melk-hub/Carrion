"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/Archives.css";
import ApplicationCard from "../components/Dashboardcard.js";
import ApplicationList from "../components/DashboardList.js";
import EditApplicationModal from "../components/EditApplicationModal.js";
import DetailsModal from "../components/DetailsModal.js";
import apiService from "../services/api.js";

function Archives() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date");
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [popupType, setPopupType] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await apiService.get(
          `/job_applies/get_archivedJobApply`
        );
        if (!response.ok) {
          throw new Error(
            `${t("dashboard.errors.fetchError")} ${response.status}`
          );
        }
        const data = await response.json();
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(t("dashboard.errors.fetchError"), error);
      }
    };
    fetchApplications();
  }, [t]);

  const handleUpdateApplication = async () => {
    try {
      const response = await apiService.put(
        `/job_applies/${selectedApplication.id}/archived-status`,
        {
          title: selectedApplication.title,
          company: selectedApplication.company,
          status: selectedApplication.status,
          location: selectedApplication.location || undefined,
          salary: selectedApplication.salary
            ? parseInt(selectedApplication.salary)
            : undefined,
          contractType: selectedApplication.contractType || "Full-time",
          interviewDate: selectedApplication.interviewDate
            ? new Date(selectedApplication.interviewDate).toISOString()
            : undefined,
          imageUrl: selectedApplication.imageUrl || undefined,
        }
      );

      if (!response.ok) {
        throw new Error(
          `${t("dashboard.errors.updateError")} ${response.status}`
        );
      }

      const updatedApplication = await response.json();

      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === selectedApplication.id
            ? { ...app, ...updatedApplication }
            : app
        )
      );
      closePopup();
    } catch (error) {
      console.error(t("dashboard.errors.updateError"), error);
    }
  };

  const handleDeArchiveApplication = async (id) => {
    try {
      const response = await apiService.post(
        `/job_applies/${id}/unarchive`
      );

      if (!response.ok) {
        throw new Error(
          `${t("dashboard.errors.archiveError")} ${response.status}`
        );
      }

      setApplications(applications.filter((app) => app.id !== id));
    } catch (error) {
      console.error(t("dashboard.errors.archiveError"), error);
    }
  };

  const handleDeleteApplication = async (id) => {
    try {
      const response = await apiService.delete(`/job_applies/${id}/archived`);

      if (!response.ok) {
        throw new Error(
          `${t("dashboard.errors.deleteError")} ${response.status}`
        );
      }

      setApplications(applications.filter((app) => app.id !== id));
    } catch (error) {
      console.error(t("dashboard.errors.deleteError"), error);
    }
  };

  const statusMap = {
    APPLIED: t("dashboard.statuses.APPLIED"),
    PENDING: t("dashboard.statuses.PENDING"),
    REJECTED_BY_COMPANY: t("dashboard.statuses.REJECTED_BY_COMPANY"),
  };

  const handleStatusChange = (status) => {
    setSelectedStatuses((prev) => {
      const newSet = new Set(prev);
      newSet.has(status) ? newSet.delete(status) : newSet.add(status);
      return newSet;
    });
  };

  const sortedAndFilteredApplications = useMemo(() => {
    const filtered = applications.filter(
      (app) =>
        (selectedStatuses.size === 0 ||
          selectedStatuses.has(statusMap[app.status])) &&
        (app.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "status") {
        return statusMap[a.status].localeCompare(statusMap[b.status]);
      }
      return 0;
    });
  }, [applications, selectedStatuses, sortBy, searchTerm]);

  const openEditPopup = (application) => {
    setSelectedApplication(application);
    setPopupType("edit");
  };

  const openDetailsPopup = (application) => {
    setSelectedApplication(application);
    setPopupType("details");
  };

  const closePopup = () => {
    setSelectedApplication(null);
    setPopupType(null);
  };

  // Statistiques
  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "PENDING").length,
    accepted: applications.filter((app) => app.status === "APPLIED").length,
    refused: applications.filter((app) => app.status === "REJECTED_BY_COMPANY")
      .length,
  };

  return (
    <div className="archives">
      <div className="container">
        <div className="stats-container">
          <div className="stat-card">
            <h3 className="stat-title">{t("shared.stats.total")}</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card pending">
            <h3 className="stat-title">{t("shared.stats.pending")}</h3>
            <p className="stat-value">{stats.pending}</p>
          </div>
          <div className="stat-card accepted">
            <h3 className="stat-title">{t("shared.stats.accepted")}</h3>
            <p className="stat-value">{stats.accepted}</p>
          </div>
          <div className="stat-card refused">
            <h3 className="stat-title">{t("shared.stats.refused")}</h3>
            <p className="stat-value">{stats.refused}</p>
          </div>
        </div>

        <div className="banner">
          <div className="banner-content">
            <h2 className="banner-title">{t("archives.title")}</h2>
            <p className="banner-text">{t("archives.description")}</p>
          </div>
          <div className="search-container">
          <input
            type="text"
              className="search-input"
              placeholder={t("archives.search.placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="archives-controls">
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
                {t("shared.sorting.label")} :
              </label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">{t("shared.sorting.date")}</option>
                <option value="status">{t("shared.sorting.status")}</option>
              </select>
      </div>

            <div className="view-toggle">
              <button
                className={`toggle-button ${
                  viewMode === "grid" ? "active" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                {t("shared.viewModes.grid")}
              </button>
              <button
                className={`toggle-button ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                {t("shared.viewModes.list")}
              </button>
            </div>
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
                  onArchive={handleDeArchiveApplication}
                  onDelete={handleDeleteApplication}
                  onDetails={openDetailsPopup}
                />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3 className="empty-title">{t("archives.empty.title")}</h3>
                <p className="empty-text">{t("archives.empty.text")}</p>
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
                  onArchive={handleDeArchiveApplication}
                  onDelete={handleDeleteApplication}
                  onDetails={openDetailsPopup}
                />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3 className="empty-title">{t("archives.empty.title")}</h3>
                <p className="empty-text">{t("archives.empty.text")}</p>
              </div>
            )}
            </div>
          )}
        </div>

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
        <DetailsModal
          application={selectedApplication}
          onClose={closePopup}
          statusMap={statusMap}
        />
      )}
    </div>
  );
}

export default Archives;
