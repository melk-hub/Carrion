import React, { useRef } from "react";
import {
  FileText,
  Eye,
  UploadCloud,
  Trash2,
  PlusCircle,
  LoaderCircle,
} from "lucide-react";
import "../styles/CvCard.css";

function CvCard({ cvUrl, uploadingCv, onUpload, onDelete }) {
  const fileInputRef = useRef(null);

  const handleModifyClick = () => {
    fileInputRef.current?.click();
  };

  const handleViewClick = () => {
    if (cvUrl) {
      window.open(cvUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article className="profile-card cv-card">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onUpload}
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
      />

      <h2>Mon CV</h2>

      {uploadingCv ? (
        <div className="cv-loading-state">
          <LoaderCircle className="spinner" size={24} />
          <p>Téléchargement en cours...</p>
        </div>
      ) : cvUrl ? (
        <div className="cv-uploaded-state">
          <div className="cv-display">
            <FileText size={20} className="cv-icon" />
            <span>CV présent</span>{" "}
          </div>
          <div className="cv-actions">
            <button
              type="button"
              onClick={handleViewClick}
              disabled={!cvUrl}
              className="cv-btn cv-btn-primary"
            >
              <Eye size={16} />
              <span>Visualiser</span>
            </button>
            <button
              type="button"
              onClick={handleModifyClick}
              className="cv-btn cv-btn-secondary"
            >
              <UploadCloud size={16} />
              <span>Modifier</span>
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="cv-btn cv-btn-danger"
            >
              <Trash2 size={16} />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="cv-empty-state">
          <p className="cv-empty-text">Aucun CV n'a été ajouté.</p>
          <button
            type="button"
            onClick={handleModifyClick}
            className="cv-btn cv-btn-primary"
          >
            <PlusCircle size={16} />
            <span>Ajouter un CV</span>
          </button>
        </div>
      )}
    </article>
  );
}

export default CvCard;
