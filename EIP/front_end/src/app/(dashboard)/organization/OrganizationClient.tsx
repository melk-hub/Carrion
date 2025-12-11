"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ApiService from "@/services/api";
import styles from "./Organization.module.css";
import Loading from "@/components/Loading/Loading";
import { useAuth } from "@/contexts/AuthContext";
import toast, { Toaster } from 'react-hot-toast';
import { OrganizationRole } from "@/enum/organization.enum";
import { orgRolesWithRights } from "@/services/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserProfile {
  firstName: string | null;
  lastName: string | null;
}

interface UserCounts {
  jobApplies: number;
  archivedJobApplies: number;
}

interface User {
  id: string;
  email: string;
  userProfile: UserProfile | null;
  _count: UserCounts;
  jobApplies?: { id: string }[];
  archivedJobApplies?: { id: string }[];
}

interface OrganizationMember {
  id: string;
  userRole: OrganizationRole;
  user: User;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  inviter: { email: string };
}

interface OrganizationData {
  organization: {
    id: string;
    name: string;
    organizationInvitations: Invitation[];
  };
  members: OrganizationMember[];
  totalJobApply: number;
}

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case "OWNER": return styles.roleOwner;
    case "TEACHER": return styles.roleTeacher;
    case "STUDENT": return styles.roleStudent;
    default: return styles.roleMember;
  }
};

const getDisplayName = (user: User) => {
  if (user.userProfile && user.userProfile.firstName) {
    return `${user.userProfile.firstName} ${user.userProfile.lastName || ""}`;
  }
  return user.email.split("@")[0];
};

export default function OrganizationClient() {
  const router = useRouter();
  const { t } = useLanguage();
  const [data, setData] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const { organizationMemberInfo } = useAuth();

  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [kickingMember, setKickingMember] = useState<OrganizationMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("STUDENT");
  const [isSaving, setIsSaving] = useState(false);
  const [viewingMember, setViewingMember] = useState<OrganizationMember | null>(null);

  const fetchOrganizationData = async () => {
    try {
      if (organizationMemberInfo?.userRole && organizationMemberInfo?.organizationId) {
        const response = await ApiService.get<OrganizationData>(
          `/organization/get-info?organizationId=${organizationMemberInfo?.organizationId}`
        );
        setData(response);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizationData();
  }, [organizationMemberInfo]);

  const canManage = orgRolesWithRights.includes(organizationMemberInfo?.userRole as unknown as string);

  const canEditMember = (targetMember: OrganizationMember) => {
    if (!canManage) return false;
    if ((organizationMemberInfo?.userRole as unknown as string) !== 'OWNER') return false;
    if ((targetMember.userRole as unknown as string) === 'OWNER') return false;
    return true;
  };

  const handleManageClick = () => {
    router.push("/organization/settings");
  };

  const handleEditClick = (member: OrganizationMember) => {
    setEditingMember(member);
    const currentRole = ["TEACHER", "STUDENT"].includes(member.userRole as unknown as string)
      ? member.userRole
      : "STUDENT";
    setSelectedRole(currentRole as unknown as string);
  };

  const handleCloseModal = () => {
    setEditingMember(null);
    setKickingMember(null);
  };

  const handleSaveRole = async () => {
    if (!editingMember) return;
    setIsSaving(true);

    try {
      await ApiService.put('/organization/edit-role', {
        organizationId: organizationMemberInfo?.organizationId,
        role: selectedRole,
        memberId: editingMember.user.id,
      });

      if (data) {
        const updatedMembers = data.members.map(m =>
          m.id === editingMember.id ? { ...m, userRole: selectedRole as OrganizationRole } : m
        );
        setData({ ...data, members: updatedMembers });
      }

      toast.success(t("organization.success.roleUpdated") as string);
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error(t("organization.error.update") as string);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKickClick = (member: OrganizationMember) => {
    setKickingMember(member);
  };

  const handleConfirmKick = async () => {
    if (!kickingMember) return;
    setIsSaving(true);

    try {
      await ApiService.delete('/organization/kick-member', {
        memberId: kickingMember.user.id,
        organizationId: organizationMemberInfo?.organizationId
      });

      if (data) {
        const filteredMembers = data.members.filter(m => m.id !== kickingMember.id);
        setData({ ...data, members: filteredMembers });
      }

      toast.success(t("organization.success.memberKicked", { name: getDisplayName(kickingMember.user) }) as string);
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error(t("organization.error.delete") as string);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewMember = (member: OrganizationMember) => {
    setViewingMember(member);
  };

  const handleBack = () => {
    setViewingMember(null);
  };

  if (loading) return <Loading />;
  if (!data) return (
    <main className={styles.container}>
      <div className={styles.organizationHeader}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: "white" }}>{t("organization.empty.title")}</h1>
      </div>
    </main>
  );

  if (viewingMember) {
    return (
      <main className={styles.container}>
        <header className={styles.viewAsHeader}>
          <div className={styles.headerTitle}>
            <h1>{t("organization.viewAs.title", { name: getDisplayName(viewingMember.user) })}</h1>
          </div>
          <button
            onClick={handleBack}
            className={styles.backButton}
            aria-label={t("common.back") as string}
          >
            {t("common.back")}
          </button>
        </header>
        <section className={styles.viewAsContainer}>
          <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
            {t("organization.viewAs.placeholder", { name: getDisplayName(viewingMember.user) })}
          </div>
        </section>
      </main>
    );
  }

  const { organization, members, totalJobApply } = data;

  const activeMembersCount = members.filter(m => {
    const weeklyActivity = (m.user.jobApplies?.length || 0) + (m.user.archivedJobApplies?.length || 0);
    return weeklyActivity > 0;
  }).length;

  const activityRate = members.length > 0 ? Math.round((activeMembersCount / members.length) * 100) : 0;

  return (
    <main className={styles.container}>
      <Toaster position="top-right" />

      <header className={styles.organizationHeader}>
        <div className={styles.headerTitle}>
          <h1>{t("organization.header.title", { name: organization.name })}</h1>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.actionButton}
            onClick={handleManageClick}
            title={t("organization.settings.title") as string}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            {canManage ? t("organization.header.manage") : t("organization.settings.title")}
          </button>
        </div>
      </header>

      <section className={styles.statsGrid} aria-label={t("organization.stats.label") as string}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t("organization.stats.members.label")}</span>
          <span className={styles.statValue}>{members.length}</span>
          <span className={styles.statTrend}>{t("organization.stats.members.trend")}</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>{t("organization.stats.applications.label")}</span>
            <div className={styles.infoIcon}>
              i
              <span className={styles.tooltipText}>
                {t("organization.stats.applications.tooltip")}
              </span>
            </div>
          </div>
          <span className={styles.statValue}>{totalJobApply}</span>
          <span className={styles.statTrend}>{t("organization.stats.applications.trend")}</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>{t("organization.stats.activity.label")}</span>
            <div className={styles.infoIcon}>
              i
              <span className={styles.tooltipText}>
                {t("organization.stats.activity.tooltip")}
              </span>
            </div>
          </div>
          <span className={styles.statValue} style={{ color: activityRate >= 50 ? '#10b981' : '#f59e0b' }}>
            {activityRate}%
          </span>
          <span className={styles.statTrend}>{t("organization.stats.activity.trend", { count: activeMembersCount })}</span>
        </div>
      </section>

      <section className={styles.membersContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("organization.table.title")}</h2>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">{t("organization.table.user")}</th>
                <th scope="col">{t("organization.table.email")}</th>
                <th scope="col">{t("organization.table.role")}</th>
                <th scope="col">{t("organization.table.performance")}</th>
                {canManage && <th scope="col" style={{ textAlign: "right" }}>{t("organization.table.actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const totalApps = member.user._count.jobApplies + member.user._count.archivedJobApplies;
                const isEditable = canEditMember(member);

                return (
                  <tr key={member.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatarPlaceholder} aria-hidden="true">
                          {getDisplayName(member.user).charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.userName}>
                          {getDisplayName(member.user)}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: "#64748b" }}>{member.user.email}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${getRoleBadgeClass(member.userRole as unknown as string)}`}>
                        {member.userRole}
                      </span>
                    </td>
                    <td>
                      <div className={styles.statsCell}>
                        <span className={styles.statsPrimary}>{t("organization.table.stats.active", { count: member.user._count.jobApplies })}</span>
                        <span className={styles.statsSecondary}>{t("organization.table.stats.total", { count: totalApps })}</span>
                      </div>
                    </td>

                    {canManage && (
                      <td style={{ textAlign: "right" }}>
                        <div className={styles.actionsCell}>
                          <button
                            className={styles.iconButton}
                            onClick={() => handleViewMember(member)}
                            title={t("common.view") as string}
                            aria-label={t("organization.actions.viewUser", { name: getDisplayName(member.user) }) as string}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>

                          {isEditable && (
                            <>
                              <button
                                className={styles.iconButton}
                                title={t("common.edit") as string}
                                onClick={() => handleEditClick(member)}
                                aria-label={t("organization.actions.editRole", { name: getDisplayName(member.user) }) as string}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              </button>
                              <button
                                className={`${styles.iconButton} ${styles.deleteBtn}`}
                                title={t("common.delete") as string}
                                onClick={() => handleKickClick(member)}
                                aria-label={t("organization.actions.kickUser", { name: getDisplayName(member.user) }) as string}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {editingMember && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 id="edit-modal-title" className={styles.modalTitle}>{t("organization.modals.editRole.title")}</h3>
            <p className={styles.modalDescription}>
              {t("organization.modals.editRole.description", { name: getDisplayName(editingMember.user) })}
            </p>
            <div className={styles.formGroup}>
              <label htmlFor="role-select" className={styles.label}>{t("organization.modals.editRole.newRole")}</label>
              <select
                id="role-select"
                className={styles.selectInput}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="STUDENT">STUDENT</option>
                <option value="TEACHER">TEACHER</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={handleCloseModal} disabled={isSaving}>
                {t("common.cancel")}
              </button>
              <button className={styles.saveButton} onClick={handleSaveRole} disabled={isSaving}>
                {isSaving ? t("common.saving") : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {kickingMember && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 id="delete-modal-title" className={styles.modalTitle} style={{ color: '#dc2626' }}>{t("organization.modals.kick.title")}</h3>
            <p className={styles.modalDescription}>
              {t("organization.modals.kick.description", { name: getDisplayName(kickingMember.user) })}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={handleCloseModal} disabled={isSaving}>
                {t("common.cancel")}
              </button>
              <button className={styles.dangerButton} onClick={handleConfirmKick} disabled={isSaving}>
                {isSaving ? t("common.processing") : t("organization.modals.kick.confirmButton")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}