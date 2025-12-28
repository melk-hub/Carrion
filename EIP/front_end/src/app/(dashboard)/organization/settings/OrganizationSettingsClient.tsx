"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ApiService from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./OrganizationSettings.module.css";
import Loading from "@/components/Loading/Loading";
import toast, { Toaster } from 'react-hot-toast';
import { orgRolesWithRights } from "@/services/utils";
import { OrganizationRole } from "@/enum/organization.enum";
import Select from 'react-select';
import PrimaryButton from "@/components/Button/PrimaryButton";
import { InvitationListInterface, SettingsDataInterface } from "@/interface/organization.interface";
import { useLanguage } from "@/contexts/LanguageContext";

interface SelectOption {
  label: string;
  value: string;
}

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case "OWNER": return styles.roleOwner;
    case "TEACHER": return styles.roleTeacher;
    case "STUDENT": return styles.roleStudent;
    default: return styles.roleStudent;
  }
};

export default function OrganizationSettingsClient() {
  const router = useRouter();
  const { t } = useLanguage();
  const { organizationMemberInfo, checkAuthStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [memberOptions, setMemberOptions] = useState<SelectOption[]>([]);
  const [invitations, setInvitations] = useState<InvitationListInterface[]>([]);
  const [selectedNewOwner, setSelectedNewOwner] = useState<SelectOption | null>(null);
  const [revokingInvite, setRevokingInvite] = useState<InvitationListInterface | null>(null);
  const [editingInvite, setEditingInvite] = useState<InvitationListInterface | null>(null);
  const [selectedInviteRole, setSelectedInviteRole] = useState<string>("STUDENT");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState<string>("STUDENT");
  const userRole = organizationMemberInfo?.userRole as unknown as string;
  const isOwner = userRole === 'OWNER';
  const canManageInvites = orgRolesWithRights.includes(userRole);

  useEffect(() => {
    const init = async () => {
      try {
        if (canManageInvites) {
          const response = await ApiService.get<SettingsDataInterface>(
            `/organization/settings-data?organizationId=${organizationMemberInfo?.organizationId}`
          );
          if (response) {
            const formattedOptions = response.memberList.map((member) => ({
              label: member.user.email,
              value: member.user.id,
            }));
            setMemberOptions(formattedOptions);
            setInvitations(response.invitationList);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (organizationMemberInfo) {
      init();
    }
  }, [organizationMemberInfo, canManageInvites]);

  const handleSaveOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewOwner) {
      toast.error(t("organization.error.owner.select") as string);
      return;
    }
    setIsSaving(true);
    try {
      await ApiService.put("/organization/change-owner", {
        organizationId: organizationMemberInfo?.organizationId,
        newOwnerId: selectedNewOwner.value
      });
      toast.success(t("organization.success.owner") as string);
      router.push('/organization');
    } catch (error) {
      console.error(error);
      toast.error(t("organization.error.owner.change") as string);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeaveOrganization = async () => {
    setIsSaving(true);
    try {
      await ApiService.delete("/organization/leave", {
        organizationId: organizationMemberInfo?.organizationId
      });
      toast.success(t("organization.success.leave") as string);
      await checkAuthStatus();
      router.refresh();
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(t("organization.error.leave") as string);
    } finally {
      setIsSaving(false);
      setIsLeaveModalOpen(false);
    }
  };

  const handleRevokeClick = (invite: InvitationListInterface) => setRevokingInvite(invite);

  const handleConfirmRevoke = async () => {
    if (!revokingInvite) return;
    setIsSaving(true);
    try {
      await ApiService.delete('/organization/revoke-invitation', {
        invitationId: revokingInvite.id,
        organizationId: organizationMemberInfo?.organizationId
      });
      setInvitations(prev => prev.filter(i => i.id !== revokingInvite.id));
      toast.success(t("organization.success.invitationRevoked") as string);
      setRevokingInvite(null);
    } catch (error) {
      console.error(error);
      toast.error(t("organization.error.delete") as string);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditInviteClick = (invite: InvitationListInterface) => {
    setEditingInvite(invite);
    const currentRole = ["TEACHER", "STUDENT"].includes(invite.role as string)
      ? invite.role
      : "STUDENT";
    setSelectedInviteRole(currentRole as string);
  };

  const handleSaveInviteRole = async () => {
    if (!editingInvite) return;
    setIsSaving(true);
    try {
      await ApiService.put('/organization/edit-invitation-role', {
        invitationId: editingInvite.id,
        organizationId: organizationMemberInfo?.organizationId,
        role: selectedInviteRole
      });
      setInvitations(prev => prev.map(i =>
        i.id === editingInvite.id ? { ...i, role: selectedInviteRole as OrganizationRole } : i
      ));
      toast.success(t("organization.success.roleUpdated") as string);
      setEditingInvite(null);
    } catch (error) {
      console.error(error);
      toast.error(t("organization.error.update") as string);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!newInviteEmail) {
      toast.error(t("organization.error.emailRequired") as string);
      return;
    }
    setIsSaving(true);
    try {
      await ApiService.post("/organization/invite", {
        organizationId: organizationMemberInfo?.organizationId,
        email: newInviteEmail,
        role: newInviteRole
      });

      toast.success(t("organization.success.invitationSent") as string);
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error(t("organization.error.invite") as string);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      <header className={styles.settingsHeader}>
        <div className={styles.headerTitle}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>{t("organization.settings.title")}</h1>
        </div>
        <button
          className={styles.backButton}
          onClick={() => router.push("/organization")}
        >
          {t("common.back")}
        </button>
      </header>

      <div className={styles.contentGrid}>

        {canManageInvites && (
          <section className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>{t("organization.invitations.title")}</h2>
              <button
                className={styles.saveButton}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                onClick={() => setIsInviteModalOpen(true)}
              >
                {t("organization.invitations.add")}
              </button>
            </div>

            {invitations.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("organization.table.email")}</th>
                      <th>{t("organization.table.role")}</th>
                      <th>{t("organization.table.invitedBy")}</th>
                      <th>{t("organization.table.expires")}</th>
                      <th style={{ textAlign: 'right' }}>{t("organization.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((invite) => (
                      <tr key={invite.id}>
                        <td style={{ fontWeight: 600 }}>{invite.email}</td>
                        <td>
                          <span className={`${styles.roleBadge} ${getRoleBadgeClass(invite.role)}`}>
                            {invite.role}
                          </span>
                        </td>
                        <td style={{ color: '#6b7280', fontSize: '0.85rem' }}>{invite.inviter.email}</td>
                        <td style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionsCell}>
                            <button
                              className={styles.editButton}
                              onClick={() => handleEditInviteClick(invite)}
                              title={t("common.edit") as string}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              {t("common.edit")}
                            </button>
                            <button
                              className={styles.revokeButton}
                              onClick={() => handleRevokeClick(invite)}
                              title={t("organization.actions.revoke") as string}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              {t("organization.actions.revoke")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#6b7280', marginTop: '1rem' }}>{t("organization.invitations.empty")}</p>
            )}
          </section>
        )}

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t("organization.dangerZone.title")}</h2>
          {isOwner ? (
            <form onSubmit={handleSaveOwner} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("organization.dangerZone.transferTitle")}</label>
                <p style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: '1rem' }}>
                  {t("organization.dangerZone.transferWarning")}
                </p>
                <Select
                  inputId="newOwner"
                  classNamePrefix="select"
                  placeholder={t("organization.dangerZone.selectPlaceholder") as string}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  options={memberOptions}
                  value={selectedNewOwner}
                  onChange={(selected) => setSelectedNewOwner(selected as SelectOption)}
                  styles={{
                    control: (base) => ({ ...base, borderColor: '#d1d5db', borderRadius: '8px', padding: '2px' }),
                  }}
                />
              </div>
              <div className={styles.formActions}>
                <PrimaryButton
                  disabled={isSaving || !selectedNewOwner}
                  text={isSaving ? t("common.processing") as string : t("organization.dangerZone.transferButton") as string}
                  onClick={handleSaveOwner}
                />
              </div>
            </form>
          ) : (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("organization.dangerZone.leaveTitle")}</label>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                  {t("organization.dangerZone.leaveWarning")}
                </p>
              </div>
              <div className={styles.formActions}>
                <button
                  className={styles.dangerButton}
                  onClick={() => setIsLeaveModalOpen(true)}
                  disabled={isSaving}
                >
                  {t("organization.dangerZone.leaveButton")}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {isInviteModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsInviteModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{t("organization.modals.invite.title")}</h3>
            <p className={styles.modalDescription}>{t("organization.modals.invite.description")}</p>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("common.email")}</label>
              <input
                type="email"
                className={styles.input}
                placeholder="exemple@email.com"
                value={newInviteEmail}
                onChange={(e) => setNewInviteEmail(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("organization.table.role")}</label>
              <select className={styles.selectInput} value={newInviteRole} onChange={(e) => setNewInviteRole(e.target.value)}>
                <option value="STUDENT">STUDENT</option>
                <option value="TEACHER">TEACHER</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setIsInviteModalOpen(false)} disabled={isSaving}>
                {t("common.cancel")}
              </button>
              <button className={styles.saveButton} onClick={handleSendInvitation} disabled={isSaving}>
                {isSaving ? t("common.sending") : t("common.send")}
              </button>
            </div>
          </div>
        </div>
      )}

      {revokingInvite && (
        <div className={styles.modalOverlay} onClick={() => setRevokingInvite(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle} style={{ color: '#dc2626' }}>{t("organization.modals.revoke.title")}</h3>
            <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
              {t("organization.modals.revoke.confirm", { email: revokingInvite.email })}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setRevokingInvite(null)} disabled={isSaving}>
                {t("common.cancel")}
              </button>
              <button className={styles.dangerButton} onClick={handleConfirmRevoke} disabled={isSaving}>
                {isSaving ? t("common.processing") : t("organization.actions.revoke")}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLeaveModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLeaveModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle} style={{ color: '#dc2626' }}>{t("organization.modals.leave.title")}</h3>
            <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
              {t("organization.modals.leave.confirm")}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setIsLeaveModalOpen(false)} disabled={isSaving}>
                {t("common.cancel")}
              </button>
              <button className={styles.dangerButton} onClick={handleLeaveOrganization} disabled={isSaving}>
                {isSaving ? t("common.processing") : t("organization.dangerZone.leaveButton")}
              </button>
            </div>
          </div>
        </div>
      )}


      {editingInvite && (
        <div className={styles.modalOverlay} onClick={() => setEditingInvite(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{t("organization.modals.editRole.title")}</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("organization.modals.editRole.newRole")}</label>
              <select className={styles.selectInput} value={selectedInviteRole} onChange={(e) => setSelectedInviteRole(e.target.value)}>
                <option value="STUDENT">STUDENT</option>
                <option value="TEACHER">TEACHER</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setEditingInvite(null)} disabled={isSaving}>
                {t("common.cancel")}
              </button>
              <button className={styles.saveButton} onClick={handleSaveInviteRole} disabled={isSaving}>
                {isSaving ? t("common.saving") : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}