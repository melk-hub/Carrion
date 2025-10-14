import React, { useRef } from "react";
import {
  FileText,
  Eye,
  UploadCloud,
  Trash2,
  PlusCircle,
  LoaderCircle,
} from "lucide-react";
import styles from "./CvCard.module.css";
import profileStyles from "../../app/(dashboard)/profile/Profile.module.css";
import { useLanguage } from "@/contexts/LanguageContext";

function CvCard({
  cvUrl,
  uploadingCv,
  onUpload,
  onDelete,
}: {
  cvUrl: string;
  uploadingCv: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
}) {
  const fileInputRef = useRef(null);
  const { t } = useLanguage();
  const handleModifyClick = () => {
    if (fileInputRef.current) {
      (fileInputRef.current as HTMLInputElement).click();
    }
  };

  const handleViewClick = () => {
    if (cvUrl) {
      window.open(cvUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article className={profileStyles.profileCard + " " + styles.cvCard}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onUpload}
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
      />

      <h2>{t("profile.CV")}</h2>

      {uploadingCv ? (
        <div className={styles.cvLoadingState}>
          <LoaderCircle className={styles.spinner} size={24} />
          <p>{t("common.loading")}</p>
        </div>
      ) : cvUrl ? (
        <div className={styles.cvUploadedState}>
          <div className={styles.cvDisplay}>
            <FileText size={20} className={styles.cvIcon} />
            <span>{t("profile.upload")}</span>
          </div>
          <div className={styles.cvActions}>
            <button
              type="button"
              onClick={handleViewClick}
              disabled={!cvUrl}
              className={styles.cvBtnPrimary}
            >
              <Eye size={16} />
              <span>{t("profile.visualize")}</span>
            </button>
            <button
              type="button"
              onClick={handleModifyClick}
              className={styles.cvBtnSecondary}
            >
              <UploadCloud size={16} />
              <span>{t("profile.modify")}</span>
            </button>
            <button
              type="button"
              onClick={onDelete}
              className={styles.cvBtnDanger + " " + styles.cvBtnPrimary}
            >
              <Trash2 size={16} />
              <span>{t("profile.delete")}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.cvEmptyState}>
          <p className={styles.cvEmptyText}>{t("profile.noCV")}</p>
          <button
            type="button"
            onClick={handleModifyClick}
            className={styles.cvBtn + " " + styles.cvBtnPrimary}
          >
            <PlusCircle size={16} />
            <span>{t("profile.add")}</span>
          </button>
        </div>
      )}
    </article>
  );
}

export default CvCard;
