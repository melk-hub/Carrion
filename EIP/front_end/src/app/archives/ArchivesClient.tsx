"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import apiService from "@/services/api";
import ApplicationCard from "@/components/Dashboardcard";
import ApplicationList from "@/components/DashboardList";
import EditApplicationModal from "@/components/EditApplicationModal";
import DetailsModal from "@/components/DetailsModal";
import { Application } from "@/interface/application.interface";
import { ApplicationStatus } from "@/enum/application-status.enum";
import { JobApply } from "@/interface/job-apply.interface";

interface ArchivesClientProps {
  initialApplications: Application[];
  error: string | null;
}

export default function ArchivesClient({
  initialApplications,
  error: initialError,
}: ArchivesClientProps) {
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
  const [popupType, setPopupType] = useState<"edit" | "details" | null>(null);

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

  const handleUpdateApplication = async () => {
    if (!selectedApplication) return;
    try {
      const updatedApp = await apiService.put<Application>(
        `/job_applies/${selectedApplication.id}/archived-status`,
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

  const handleDeArchiveApplication = async (id: string) => {
    try {
      await apiService.post(`/job_applies/${id}/unarchive`, {});
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err: unknown) {
      console.error(t("dashboard.errors.archiveError"), err);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      await apiService.delete(`/job_applies/${id}/archived`);
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
      applied: applications.filter((app) => app.status === "APPLIED").length,
      refused: applications.filter(
        (app) => app.status === "REJECTED_BY_COMPANY"
      ).length,
    }),
    [applications]
  );

  if (initialError) {
    return (
      <main className="archives-error-state">
        <p>{initialError}</p>
      </main>
    );
  }

  return (
    <main className="archives">
      <div className="container">
        <header className="banner">
          <div className="banner-content">
            <h1 className="banner-title">{t("archives.title") as string}</h1>
            <p className="banner-text">{t("archives.description") as string}</p>
          </div>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder={t("archives.search.placeholder") as string}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </header>

        <section aria-labelledby="stats-title" className="stats-container">
          <h2 id="stats-title" className="visually-hidden">
            Statistiques des archives
          </h2>
          <div className="stat-card">
            <h3 className="stat-title">{t("shared.stats.total") as string}</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card pending">
            <h3 className="stat-title">
              {t("shared.stats.pending") as string}
            </h3>
            <p className="stat-value">{stats.pending}</p>
          </div>
          <div className="stat-card accepted">
            <h3 className="stat-title">
              {t("shared.stats.accepted") as string}
            </h3>
            <p className="stat-value">{stats.applied}</p>
          </div>
          <div className="stat-card refused">
            <h3 className="stat-title">
              {t("shared.stats.refused") as string}
            </h3>
            <p className="stat-value">{stats.refused}</p>
          </div>
        </section>

        <section aria-labelledby="controls-title" className="archives-controls">
          <h2 id="controls-title" className="visually-hidden">
            Contrôles de filtrage et de tri
          </h2>
          <div className="filter-container">
            {Object.keys(statusMap)
              .filter((key) =>
                ["APPLIED", "PENDING", "REJECTED_BY_COMPANY"].includes(key)
              )
              .map((statusKey) => (
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
            <div className="view-toggle">
              <button
                className={`toggle-button ${
                  viewMode === "grid" ? "active" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                {t("shared.viewModes.grid") as string}
              </button>
              <button
                className={`toggle-button ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                {t("shared.viewModes.list") as string}
              </button>
            </div>
          </div>
        </section>

        <section aria-labelledby="applications-list-title">
          <h2 id="applications-list-title" className="visually-hidden">
            Liste des candidatures archivées
          </h2>
          {viewMode === "grid" ? (
            <div className="applications-grid">
              {sortedAndFilteredApplications.length > 0 ? (
                sortedAndFilteredApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app as JobApply}
                    statusMap={statusMap as Record<ApplicationStatus, string>}
                    onEdit={openEditPopup as (application: JobApply) => void}
                    onArchive={handleDeArchiveApplication}
                    onDelete={handleDeleteApplication}
                    onDetails={
                      openDetailsPopup as (application: JobApply) => void
                    }
                  />
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3 className="empty-title">
                    {t("archives.empty.title") as string}
                  </h3>
                  <p className="empty-text">
                    {t("archives.empty.text") as string}
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
                    application={app as JobApply}
                    statusMap={statusMap as Record<ApplicationStatus, string>}
                    onEdit={openEditPopup as (application: JobApply) => void}
                    onArchive={handleDeArchiveApplication}
                    onDelete={handleDeleteApplication}
                    onDetails={openDetailsPopup as (application: JobApply) => void}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3 className="empty-title">
                    {t("archives.empty.title") as string}
                  </h3>
                  <p className="empty-text">
                    {t("archives.empty.text") as string}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {popupType === "edit" && selectedApplication && (
        <EditApplicationModal
          application={selectedApplication as JobApply}
          setApplication={
            setSelectedApplication as (application: JobApply) => void
          }
          onUpdate={handleUpdateApplication}
          onClose={closePopup}
          statusMap={statusMap as Record<ApplicationStatus, string>}
        />
      )}
      {popupType === "details" && selectedApplication && (
        <DetailsModal
          application={selectedApplication as JobApply}
          onClose={closePopup}
          statusMap={statusMap as Record<ApplicationStatus, string>}
        />
      )}
    </main>
  );
}
