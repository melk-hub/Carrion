import React, { useState } from "react";
import { Upload, Eye, Trash, Check } from "lucide-react";
import "../styles/Career.css";

export default function Career() {
  const [documents, setDocuments] = useState([]);
  const [newDocType, setNewDocType] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [hoveredDoc, setHoveredDoc] = useState(null);

  const documentTypes = ["CV", "Lettre de motivation", "Diplôme", "Contrat", "Autre"];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      const fileURL = URL.createObjectURL(selectedFile);
      setDocuments([...documents, { id: Date.now(), name: selectedFile.name, type: newDocType || "Autre", url: fileURL }]);
      setNewDocType("");
      setSelectedFile(null);
    }
  };

  const handleDelete = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleDocumentClick = (doc) => {
    if (doc.name.endsWith(".pdf")) {
      window.open(doc.url, "_blank");
    }
  };

  return (
    <div className="career-container">
      <h2>Gestion des Documents</h2>
      <div className="upload-section">
        <label className="upload-button">
          <Upload size={20} /> Ajouter un document
          <input type="file" onChange={handleFileSelect} hidden />
        </label>
        {selectedFile && (
          <div className="file-preview">
            <span>{selectedFile.name}</span>
          </div>
        )}
        <div className="dropdown-container">
          <input 
            type="text" 
            placeholder="Type du document (optionnel)" 
            value={newDocType} 
            onChange={(e) => setNewDocType(e.target.value)} 
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="doc-type-input"
          />
          {showDropdown && (
            <ul className="dropdown-menu">
              {documentTypes.map((type) => (
                <li key={type} onClick={() => setNewDocType(type)}>{type}</li>
              ))}
            </ul>
          )}
        </div>
        {selectedFile && (
          <button className="validate-button" onClick={handleUpload}>
            <Check size={20} /> Valider
          </button>
        )}
      </div>

      <div className="document-list">
        {documents.map((doc) => (
          <div key={doc.id} className="document-item">
            <Eye
              size={24} className={`preview-icon ${doc.name.endsWith(".pdf") ? "clickable" : ""}`} 
              onMouseEnter={() => setHoveredDoc(doc)}
              onMouseLeave={() => setHoveredDoc(null)}
              onClick={() => handleDocumentClick(doc)}
            />
            <span className="document-name">{doc.name}</span>
            <span className="document-type">{doc.type}</span>
            <button className="delete-button" onClick={() => handleDelete(doc.id)}>
              <Trash size={20} />
            </button>
          </div>
        ))}
      </div>

      {hoveredDoc && !hoveredDoc.name.endsWith(".pdf") && (
        <div className="document-preview">
          <img src={hoveredDoc.url} alt="Aperçu du document" className="preview-image" />
        </div>
      )}
    </div>
  );
}
