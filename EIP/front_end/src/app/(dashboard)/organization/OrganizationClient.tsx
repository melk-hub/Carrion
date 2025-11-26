"use client";

import React, { useEffect, useState } from "react";
import ApiService from "@/services/api";
import styles from "./Organization.module.css";
import Loading from "@/components/Loading/Loading";
import { useAuth } from "@/contexts/AuthContext";
import toast, { Toaster } from 'react-hot-toast';
import { OrganizationRole } from "@/enum/organization.enum";

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
  const [data, setData] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const { organizationMemberInfo } = useAuth();

  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("STUDENT");
  const [isSaving, setIsSaving] = useState(false);
  const [viewingMember, setViewingMember] = useState<OrganizationMember | null>(null);

  const fetchOrganizationData = async () => {
    try {
      if (organizationMemberInfo?.userRole && organizationMemberInfo?.organizationId) {
        const response = await ApiService.get<OrganizationData>(
          `/organization/get-info?role=${organizationMemberInfo?.userRole}&organizationId=${organizationMemberInfo?.organizationId}`
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

  const canManage = (organizationMemberInfo?.userRole as unknown as string) === "OWNER";

  const canEditMember = (targetMember: OrganizationMember) => {
    if (!canManage) return false;
    if ((targetMember.userRole as unknown as string) === "OWNER") return false;
    return true;
  };

  const handleEditClick = async (member: OrganizationMember) => {
    setEditingMember(member);
    const currentRole = ["TEACHER", "STUDENT"].includes(member.userRole as unknown as string)
      ? member.userRole
      : "STUDENT";
    setSelectedRole(currentRole as unknown as string);
  };

  const handleCloseModal = () => {
    setEditingMember(null);
  };

  const handleSaveRole = async () => {
    if (!editingMember) return;
    setIsSaving(true);

    try {
      const response = await ApiService.put('/organization/edit-role', {
        organizationId: organizationMemberInfo?.organizationId,
        role: selectedRole,
        memberId: editingMember.user.id,
      })

      console.log(response);

      if (data) {
        const updatedMembers = data.members.map(m =>
            m.id === editingMember.id ? { ...m, userRole: selectedRole as OrganizationRole } : m
        );
        setData({ ...data, members: updatedMembers });
      }

      toast.success("Rôle mis à jour avec succès !");
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error("Impossible de mettre à jour le rôle.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKickMember = async (member: OrganizationMember) => {
     if(confirm(`Êtes-vous sûr de vouloir retirer ${getDisplayName(member.user)} de l'organisation ?`)) {
        const response = await ApiService.delete('/organization/kick-member', {
          memberId: member.user.id,
          organizationId: organizationMemberInfo?.organizationId
        })
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
        <h1 style={{margin: 0, fontSize: '1.5rem'}}>Aucune organisation trouvée.</h1>
      </div>
    </main>
  );

  if (viewingMember) {
    return (
      <main className={styles.container}>
        <header className={styles.viewAsHeader}>
          <div className={styles.headerTitle}>
            <h1>Aperçu : {getDisplayName(viewingMember.user)}</h1>
          </div>
          <button
            onClick={handleBack}
            className={styles.backButton}
            aria-label="Retour au tableau de bord"
          >
            ← Retour
          </button>
        </header>
        <section className={styles.viewAsContainer}>
          <div style={{color: '#64748b', textAlign: 'center', padding: '2rem'}}>
            Ici s'afficheront les candidatures de {getDisplayName(viewingMember.user)}
          </div>
        </section>
      </main>
    );
  }

  const { organization, members, totalJobApply } = data;
  const activeMembersCount = members.filter(m => (m.user._count.jobApplies + m.user._count.archivedJobApplies) > 0).length;
  const activityRate = members.length > 0 ? Math.round((activeMembersCount / members.length) * 100) : 0;

  return (
    <main className={styles.container}>
      <Toaster position="top-right" />

      <header className={styles.organizationHeader}>
        <div className={styles.headerTitle}>
          <h1>Organisation : {organization.name}</h1>
        </div>
        <div className={styles.headerActions}>
          {canManage && (
            <button
              className={styles.actionButton}
              onClick={() => alert("Paramètres globaux")}
              title="Gérer les paramètres de l'organisation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Gérer
            </button>
          )}
        </div>
      </header>

      <section className={styles.statsGrid} aria-label="Statistiques de l'organisation">
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Membres</span>
          <span className={styles.statValue}>{members.length}</span>
          <span className={styles.statTrend}>Personnes actives</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Candidatures</span>
          <span className={styles.statValue}>{totalJobApply}</span>
          <span className={styles.statTrend}>Cumul de l'équipe</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Activité</span>
          <span className={styles.statValue} style={{ color: activityRate >= 50 ? '#10b981' : '#f59e0b' }}>
            {activityRate}%
          </span>
          <span className={styles.statTrend}>{activeMembersCount} élèves actifs</span>
        </div>
      </section>

      <section className={styles.membersContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Liste des membres</h2>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Utilisateur</th>
                <th scope="col">Email</th>
                <th scope="col">Rôle</th>
                <th scope="col">Performance</th>
                {canManage && <th scope="col" style={{ textAlign: "right" }}>Actions</th>}
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
                        <span className={styles.statsPrimary}>{member.user._count.jobApplies} en cours</span>
                        <span className={styles.statsSecondary}>{totalApps} au total</span>
                      </div>
                    </td>

                    {canManage && (
                      <td style={{ textAlign: "right" }}>
                        <div className={styles.actionsCell}>
                          <button
                            className={styles.iconButton}
                            onClick={() => handleViewMember(member)}
                            title="Voir les candidatures"
                            aria-label={`Voir les candidatures de ${getDisplayName(member.user)}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>

                          {isEditable && (
                            <>
                              <button
                                className={styles.iconButton}
                                title="Modifier le rôle"
                                onClick={() => handleEditClick(member)}
                                aria-label={`Modifier le rôle de ${getDisplayName(member.user)}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              </button>
                              <button
                                className={`${styles.iconButton} ${styles.deleteBtn}`}
                                title="Exclure de l'organisation"
                                onClick={() => handleKickMember(member)}
                                aria-label={`Exclure ${getDisplayName(member.user)}`}
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
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <h3 id="modal-title" className={styles.modalTitle}>Modifier le rôle</h3>
            <p className={styles.modalDescription}>
              Changer le niveau d'accès pour <strong>{getDisplayName(editingMember.user)}</strong>.
            </p>

            <div className={styles.formGroup}>
              <label htmlFor="role-select" className={styles.label}>Nouveau rôle</label>
              <select
                id="role-select"
                className={styles.selectInput}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="STUDENT">STUDENT (Élève)</option>
                <option value="TEACHER">TEACHER (Professeur)</option>
              </select>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={handleCloseModal}
                disabled={isSaving}
              >
                Annuler
              </button>
              <button
                className={styles.saveButton}
                onClick={handleSaveRole}
                disabled={isSaving}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}