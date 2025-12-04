"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import apiService from "@/services/api";
import ApplicationCard from "@/components/Card/Dashboardcard";
import ApplicationList from "@/components/List/DashboardList";
import EditApplicationModal from "@/components/EditApplicationModal";
import DetailsModal from "@/components/DetailsModal";
import { Application } from "@/interface/application.interface";
import { ApplicationStatus } from "@/enum/application-status.enum";
import { JobApply } from "@/interface/job-apply.interface";

import styles from "./Archives.module.css";

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
    console.log(selectedApplication);
    try {
      const updatedApp = await apiService.put<Application>(
        `/job_applies/${selectedApplication.id}/archived-status`,
        selectedApplication
      );
      console.log(updatedApp);
      setApplications((prev) =>
        prev.map((app) => (app.id === updatedApp!.id ? updatedApp! : app))
      );
      closePopup();
    } catch (err: unknown) {
      console.error(t("dashboard.errors.updateError"), err);
    }
  };

  const handleUnarchiveApplication = async (id: string) => {
    try {
      await apiService.post(`/job_applies/${id}/unarchive`, {});
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err: unknown) {
      console.error(t("dashboard.errors.archiveError"), err);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      await apiService.delete(`/job_applies/${id}/archived`, {});
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
      <main className={styles.archivesErrorState}>
        <p>{initialError}</p>
      </main>
    );
  }

  return (
    <main className={styles.archives}>
      <div className={styles.container}>
        <header className={styles.banner}>
          <div className={styles.bannerContent}>
            <h1 className={styles.bannerTitle}>{t("archives.title") as string}</h1>
            <p className={styles.bannerText}>{t("archives.description") as string}</p>
          </div>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t("archives.search.placeholder") as string}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
        </header>

        <section aria-labelledby="stats-title" className={styles.statsContainer}>
          <h2 id="stats-title" className={styles.visuallyHidden}>
            Statistiques des archives
          </h2>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>{t("shared.stats.total") as string}</h3>
            <p className={styles.statValue}>{stats.total}</p>
          </div>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <h3 className={styles.statTitle}>
              {t("shared.stats.pending") as string}
            </h3>
            <p className={styles.statValue}>{stats.pending}</p>
          </div>
          <div className={`${styles.statCard} ${styles.accepted}`}>
            <h3 className={styles.statTitle}>
              {t("shared.stats.accepted") as string}
            </h3>
            <p className={styles.statValue}>{stats.applied}</p>
          </div>
          <div className={`${styles.statCard} ${styles.refused}`}>
            <h3 className={styles.statTitle}>
              {t("shared.stats.refused") as string}
            </h3>
            <p className={styles.statValue}>{stats.refused}</p>
          </div>
        </section>

        <section aria-labelledby="controls-title" className={styles.archivesControls}>
          <h2 id="controls-title" className={styles.visuallyHidden}>
            Contrôles de filtrage et de tri
          </h2>
          <div className={styles.filterContainer}>
            {Object.keys(statusMap)
              .filter((key) =>
                ["APPLIED", "PENDING", "REJECTED_BY_COMPANY"].includes(key)
              )
              .map((statusKey) => (
                <label key={statusKey} className={styles.filterCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedStatuses.has(statusKey)}
                    onChange={() => handleStatusChange(statusKey)}
                  />
                  <span className={styles.checkboxLabel}>
                    {statusMap[statusKey as keyof typeof statusMap]}
                  </span>
                </label>
              ))}
          </div>
          <div className={styles.controlsRight}>
            <div className={styles.sortContainer}>
              <label htmlFor="sort-select" className={styles.sortLabel}>
                {t("shared.sorting.label") as string} :
              </label>
              <select
                id="sort-select"
                className={styles.sortSelect}
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
            <div className={styles.viewToggle}>
              <button
                className={`${styles.toggleButton} ${
                  viewMode === "grid" ? styles.active : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                {t("shared.viewModes.grid") as string}
              </button>
              <button
                className={`${styles.toggleButton} ${
                  viewMode === "list" ? styles.active : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                {t("shared.viewModes.list") as string}
              </button>
            </div>
          </div>
        </section>

        <section aria-labelledby="applications-list-title">
          <h2 id="applications-list-title" className={styles.visuallyHidden}>
            Liste des candidatures archivées
          </h2>
          {viewMode === "grid" ? (
            <div className={styles.applicationsGrid}>
              {sortedAndFilteredApplications.length > 0 ? (
                sortedAndFilteredApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app as JobApply}
                    statusMap={statusMap as Record<ApplicationStatus, string>}
                    onEdit={openEditPopup as (application: JobApply) => void}
                    onArchive={handleUnarchiveApplication}
                    onDelete={handleDeleteApplication}
                    onDetails={
                      openDetailsPopup as (application: JobApply) => void
                    }
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📄</div>
                  <h3 className={styles.emptyTitle}>
                    {t("archives.empty.title") as string}
                  </h3>
                  <p className={styles.emptyText}>
                    {t("archives.empty.text") as string}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.applicationsList}>
              {sortedAndFilteredApplications.length > 0 ? (
                sortedAndFilteredApplications.map((app) => (
                  <ApplicationList
                    key={app.id}
                    application={app as JobApply}
                    statusMap={statusMap as Record<ApplicationStatus, string>}
                    onEdit={openEditPopup as (application: JobApply) => void}
                    onArchive={handleUnarchiveApplication}
                    onDelete={handleDeleteApplication}
                    onDetails={openDetailsPopup as (application: JobApply) => void}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📄</div>
                  <h3 className={styles.emptyTitle}>
                    {t("archives.empty.title") as string}
                  </h3>
                  <p className={styles.emptyText}>
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