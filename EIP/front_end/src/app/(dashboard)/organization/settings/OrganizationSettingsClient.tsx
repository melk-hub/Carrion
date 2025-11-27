"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ApiService from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./OrganizationSettings.module.css";
import Loading from "@/components/Loading/Loading";
import toast, { Toaster } from 'react-hot-toast';

export default function OrganizationSettingsClient() {
  const router = useRouter();
  const { organizationMemberInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (organizationMemberInfo?.userRole !== "OWNER") {
        toast.error("Accès refusé");
        router.push("/organization");
        return;
      }
      try {
        const response = await ApiService.get<any>(
          `/organization/details?id=${organizationMemberInfo.organizationId}`
        );
        if (response && response.organization) {
          setOrgName(response.organization.name);
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
  }, [organizationMemberInfo, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await ApiService.put("/organization/update", {
        organizationId: organizationMemberInfo?.organizationId,
        name: orgName
      });
      toast.success("Organisation mise à jour !");
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  // Supprimer l'orga à voir si on le garde
  // const handleDeleteOrganization = async () => {
  //   const confirmName = prompt(`Pour supprimer l'organisation, tapez son nom : "${orgName}"`);
  //   if (confirmName === orgName) {
  //     try {
  //       await ApiService.delete(`/organization/${organizationMemberInfo?.organizationId}`);
  //       toast.success("Organisation supprimée");
  //       window.location.href = "/dashboard";
  //     } catch (error) {
  //       toast.error("Erreur lors de la suppression");
  //     }
  //   } else if (confirmName !== null) {
  //     toast.error("Nom incorrect");
  //   }
  // };

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      <header className={styles.settingsHeader}>
        <div className={styles.headerTitle}>
          <h1>Paramètres de l'organisation</h1>
        </div>
        <button 
          className={styles.backButton}
          onClick={() => router.push("/organization")}
        >
          ← Retour
        </button>
      </header>

      <div className={styles.contentGrid}>
        
        { organizationMemberInfo?.userRole as unknown as string  === 'OWNER' ?
        (<section className={styles.card}>
          <h2 className={styles.cardTitle}>Informations</h2>
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nom de l'organisation</label>
              <input 
                type="text" 
                className={styles.input} 
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
            <div className={styles.formActions}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={isSaving}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </section>): null}

        {/* À voir si on garde la suppression d'orga */}
        {/* <section className={`${styles.card} ${styles.dangerZone}`}>
          <h2 className={styles.dangerTitle}>Zone de danger</h2>
          <p className={styles.dangerText}>
            La suppression d'une organisation est irréversible. Toutes les données associées (membres, statistiques) seront perdues.
          </p>
          <button 
            className={styles.deleteButton}
            onClick={handleDeleteOrganization}
          >
            Supprimer l'organisation
          </button>
        </section> */}

      </div>
    </div>
  );
}