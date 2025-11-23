"use client";

import React from 'react';
import styles from './Organization.module.css';

export default function OrganizationClient() {

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'OWNER': return styles.roleOwner;
      case 'ADMIN': return styles.roleAdmin;
      default: return styles.roleMember;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Organisation</h1>


      <div className={styles.statsGrid}>
      </div>


      <div className={styles.membersContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Membres de l'organisation</h2> {/* TODO à changer pour du texte modulable */}

        </div>

        <div className={styles.tableWrapper}>
        </div>
      </div>
    </div>
  );
}