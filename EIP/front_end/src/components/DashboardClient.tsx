"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import apiService from "@/services/api";
import ApplicationCard from "@/components/Dashboardcard";
import ApplicationList from "@/components/DashboardList";
import EditApplicationModal from "@/components/EditApplicationModal";
import DetailsModal from "@/components/DetailsModal";
import AddApplicationModal, {
  ApplicationFormData,
} from "@/components/AddApplicationModal";
import { Application } from "@/interface/application.interface";

interface DashboardClientProps {
  initialApplications: Application[];
  error: string | null;
}

export default function DashboardClient({
  initialApplications,
  error: initialError,
}: DashboardClientProps) {
  const { t } = useLanguage();
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set()
  );
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [popupType, setPopupType] = useState<"add" | "edit" | "details" | null>(
    null
  );
  const [error, setError] = useState<string | null>(initialError);

  const statusMap = useMemo(
    () => ({
      APPLIED: t("dashboard.statuses.APPLIED") as string,
      PENDING: t("dashboard.statuses.PENDING") as string,
      REJECTED_BY_COMPANY: t(
        "dashboard.statuses.REJECTED_BY_COMPANY"
      ) as string,
      INTERVIEW_SCHEDULED: t(
        "dashboard.statuses.INTERVIEW_SCHEDULED"
      ) as string,
      OFFER_RECEIVED: t("dashboard.statuses.OFFER_RECEIVED") as string,
    }),
    [t]
  );

  const handleSaveNewApplication = async (
    applicationData: ApplicationFormData
  ) => {
    try {
      const newApplication = await apiService.post<Application>(
        "/job_applies",
        applicationData
      );
      setApplications((prev) => [newApplication, ...prev]);
      closePopup();
    } catch (err: unknown) {
      console.error(t("dashboard.errors.addError"), err);
    }
  };

  const handleUpdateApplication = async () => {
    if (!selectedApplication) return;
    try {
      const updatedApp = await apiService.put<Application>(
        `/job_applies/${selectedApplication.id}`,
        selectedApplication
      );
      setApplications((prev) =>
        prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
      );
      closePopup();
    } catch (err: unknown) {
      console.error(t("dashboard.errors.updateError"), err);
    }
  };

  const handleArchiveApplication = async (id: string) => {
    try {
      await apiService.post(`/job_applies/${id}/archive`, {});
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err: unknown) {
      console.error(t("dashboard.errors.archiveError"), err);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      await apiService.delete(`/job_applies/${id}`);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err: unknown) {
      console.error(t("dashboard.errors.deleteError"), err);
    }
  };

  const handleStatusChange = (statusKey: string) => {
    setSelectedStatuses((prev) => {
      const newSet = new Set(prev);
      newSet.has(statusKey) ? newSet.delete(statusKey) : newSet.add(statusKey);
      return newSet;
    });
  };

  const sortedAndFilteredApplications = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return applications
      .filter(
        (app) =>
          (selectedStatuses.size === 0 || selectedStatuses.has(app.status)) &&
          (app.company?.toLowerCase().includes(lowercasedSearchTerm) ||
            app.title?.toLowerCase().includes(lowercasedSearchTerm))
      )
      .sort((a, b) => {
        if (sortBy === "date")
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (sortBy === "status")
          return statusMap[a.status].localeCompare(statusMap[b.status]);
        return 0;
      });
  }, [applications, selectedStatuses, sortBy, searchTerm, statusMap]);

  const openAddPopup = () => setPopupType("add");
  const openEditPopup = (application: Application) => {
    setSelectedApplication(application);
    setPopupType("edit");
  };
  const openDetailsPopup = (application: Application) => {
    setSelectedApplication(application);
    setPopupType("details");
  };
  const closePopup = () => {
    setSelectedApplication(null);
    setPopupType(null);
  };

  const stats = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((app) => app.status === "PENDING").length,
      interview: applications.filter(
        (app) => app.status === "INTERVIEW_SCHEDULED"
      ).length,
      offer: applications.filter((app) => app.status === "OFFER_RECEIVED")
        .length,
    }),
    [applications]
  );

  if (error) {
    return (
      <main className="dashboard-error-state">
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <div className="container">
        <header className="banner">
          <div className="banner-content">
            <h1 className="banner-title">{t("dashboard.title") as string}</h1>
            <p className="banner-text">
              {t("dashboard.description") as string}
            </p>
          </div>
          <div className="banner-actions">
            <button className="add-application-btn" onClick={openAddPopup}>
              + {t("dashboard.addApplication") as string}
            </button>
            <div className="search-container" role="search">
              <input
                type="search"
                className="search-input"
                placeholder={t("dashboard.search.placeholder") as string}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label={t("dashboard.search.label") as string}
              />
              <span className="search-icon" aria-hidden="true">
                🔍
              </span>
            </div>
          </div>
        </header>

        <section aria-labelledby="stats-title" className="stats-container">
          <h2 id="stats-title" className="visually-hidden">
            Statistiques des candidatures actives
          </h2>
          <div className="stat-card">
            <h3 className="stat-title">
              {t("shared.stats.totalActive") as string}
            </h3>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card pending">
            <h3 className="stat-title">
              {t("shared.stats.pending") as string}
            </h3>
            <p className="stat-value">{stats.pending}</p>
          </div>
          <div className="stat-card interview">
            <h3 className="stat-title">
              {t("shared.stats.interviews") as string}
            </h3>
            <p className="stat-value">{stats.interview}</p>
          </div>
          <div className="stat-card offer">
            <h3 className="stat-title">{t("shared.stats.offers") as string}</h3>
            <p className="stat-value">{stats.offer}</p>
          </div>
        </section>

        <section
          aria-labelledby="controls-title"
          className="dashboard-controls"
        >
          <h2 id="controls-title" className="visually-hidden">
            Contrôles de filtrage, tri et affichage
          </h2>
          <div className="filter-container">
            <fieldset>
              <legend className="visually-hidden">Filtrer par statut</legend>
              {Object.keys(statusMap).map((statusKey) => (
                <label key={statusKey} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.has(statusKey)}
                    onChange={() => handleStatusChange(statusKey)}
                  />
                  <span className="checkbox-label">
                    {statusMap[statusKey as keyof typeof statusMap]}
                  </span>
                </label>
              ))}
            </fieldset>
          </div>
          <div className="controls-right">
            <div className="sort-container">
              <label htmlFor="sort-select" className="sort-label">
                {t("shared.sorting.label") as string} :
              </label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "status")}
              >
                <option value="date">
                  {t("shared.sorting.date") as string}
                </option>
                <option value="status">
                  {t("shared.sorting.status") as string}
                </option>
              </select>
            </div>
            <div
              className="view-toggle"
              role="group"
              aria-label={t("shared.viewModes.label") as string}
            >
              <button
                className={`toggle-button ${
                  viewMode === "grid" ? "active" : ""
                }`}
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
              >
                {t("shared.viewModes.grid") as string}
              </button>
              <button
                className={`toggle-button ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
              >
                {t("shared.viewModes.list") as string}
              </button>
            </div>
          </div>
        </section>

        <section aria-labelledby="applications-list-title">
          <h2 id="applications-list-title" className="visually-hidden">
            Liste des candidatures
          </h2>
          {viewMode === "grid" ? (
            <div className="applications-grid">
              {sortedAndFilteredApplications.length > 0 ? (
                sortedAndFilteredApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    statusMap={statusMap}
                    onEdit={openEditPopup}
                    onArchive={handleArchiveApplication}
                    onDelete={handleDeleteApplication}
                    onDetails={openDetailsPopup}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📂</div>
                  <h3 className="empty-title">
                    {t("dashboard.empty.title") as string}
                  </h3>
                  <p className="empty-text">
                    {t("dashboard.empty.text") as string}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="applications-list">
              {sortedAndFilteredApplications.length > 0 ? (
                sortedAndFilteredApplications.map((app) => (
                  <ApplicationList
                    key={app.id}
                    application={app}
                    statusMap={statusMap}
                    onEdit={openEditPopup}
                    onArchive={handleArchiveApplication}
                    onDelete={handleDeleteApplication}
                    onDetails={openDetailsPopup}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📂</div>
                  <h3 className="empty-title">
                    {t("dashboard.empty.title") as string}
                  </h3>
                  <p className="empty-text">
                    {t("dashboard.empty.text") as string}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {popupType === "add" && (
        <AddApplicationModal
          onAdd={handleSaveNewApplication}
          onClose={closePopup}
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
        <DetailsModal
          application={selectedApplication}
          onClose={closePopup}
          statusMap={statusMap}
        />
      )}
    </main>
  );
}
