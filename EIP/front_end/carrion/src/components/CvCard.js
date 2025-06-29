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

  return (
    <article className="profile-card cv-card">
      {/* Input masqué pour l'upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onUpload}
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
      />

      <h2>Mon CV</h2>

      {/* ÉTAT : téléchargement en cours */}
      {uploadingCv ? (
        <div className="cv-loading-state">
          <LoaderCircle className="spinner" size={24} />
          <p>Téléchargement en cours...</p>
        </div>
      ) : /* ÉTAT : un CV est présent */ cvUrl ? (
        <div className="cv-uploaded-state">
          <div className="cv-display">
            <FileText size={20} className="cv-icon" />
            <span>CV téléchargé</span>
          </div>
          <div className="cv-actions">
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cv-btn cv-btn-primary"
            >
              <Eye size={16} />
              <span>Visualiser</span>
            </a>
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
        /* ÉTAT : aucun CV présent */
        <div className="cv-empty-state">
          <button
            type="button"
            onClick={handleModifyClick}
            className="cv-btn cv-btn-primary"
          >
            <PlusCircle size={16} />
            <span>Ajouter</span>
          </button>
        </div>
      )}
    </article>
  );
}

export default CvCard;
