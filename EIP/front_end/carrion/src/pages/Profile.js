import React, { useState, useRef, useEffect } from "react";
import { Upload, Eye, Trash, CircleUserRound, Pencil } from "lucide-react";
import "../styles/Profile.css";

// --- FIX: Moved DocumentList outside of the Profile component for correctness and performance ---
const DocumentList = ({ documents, onDelete, onPreview, type, editingDoc, setEditingDoc, editedName, setEditedName, handleRename }) => (
    <div className="document-list">
        {documents.map((doc) => (
            <div key={doc.id} className="document-item">
                <Eye
                    size={24}
                    className="preview-icon clickable"
                    onClick={() => onPreview(doc)}
                />
                
                {editingDoc?.id === doc.id && editingDoc?.type === type ? (
                    <input
                        type="text"
                        className="document-name-input"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename();
                        }}
                        autoFocus
                    />
                ) : (
                    <span
                        className="document-name"
                        onClick={() => {
                            setEditingDoc({ type, id: doc.id });
                            setEditedName(doc.name);
                        }}
                    >
                        {doc.name}
                    </span>
                )}

                <button className="delete-button" onClick={() => onDelete(doc.id)}>
                    <Trash size={20} />
                </button>
            </div>
        ))}
    </div>
);


function Profile() {
    const [personalInfo, setPersonalInfo] = useState({
        nom: '', prenom: '', phoneNumber: '', dateNaissance: '', email: '', ecole: '', ville: '',
        job: '', availability: '', goal: '', domain: '', location: '',
        cv: null, linkedin: '', portfolio: '', description: '',
    });
    const [cvDocuments, setCvDocuments] = useState([]);
    const [motivationDocuments, setMotivationDocuments] = useState([]);
    const [editingDoc, setEditingDoc] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [services, setServices] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [hover, setHover] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    
    // --- FIX: Defined the missing refs ---
    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null); // Ref for the service dropdown

    const AVAILABLE_SERVICES = [
        { name: "LinkedIn", icon: "/icons/linkedin.png" },
        { name: "Outlook", icon: "/icons/outlook.png" },
        { name: "Gmail", icon: "/icons/gmail.png" },
    ];
    const API_URL = process.env.REACT_APP_API_URL;

    const handleAddService = (service) => {
        setServices([...services, service]);
        setShowMenu(false);
    };

    const remainingServices = AVAILABLE_SERVICES.filter(
        (s) => !services.some((added) => added.name === s.name)
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCvSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/pdf") {
            const fileURL = URL.createObjectURL(file);
            setCvDocuments(prevDocs => [...prevDocs, { id: Date.now(), name: file.name, url: fileURL }]);
        }
    };

    const handleMotivationSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/pdf") {
            const fileURL = URL.createObjectURL(file);
            setMotivationDocuments(prevDocs => [...prevDocs, { id: Date.now(), name: file.name, url: fileURL }]);
        }
    };
        
    const handleDeleteCv = (id) => {
        setCvDocuments(cvDocuments.filter(doc => doc.id !== id));
    };

    const handleDeleteMotivation = (id) => {
        setMotivationDocuments(motivationDocuments.filter(doc => doc.id !== id));
    };

    const handleDocumentClick = (doc) => {
        if (doc.name.endsWith(".pdf")) {
            window.open(doc.url, "_blank");
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
            setUploadedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRename = () => {
        if (!editingDoc) return;
        const { type, id } = editingDoc;
        if (type === 'cv') {
            const updated = cvDocuments.map(doc =>
            doc.id === id ? { ...doc, name: editedName } : doc
            );
            setCvDocuments(updated);
        } else if (type === 'motivation') {
            const updated = motivationDocuments.map(doc =>
            doc.id === id ? { ...doc, name: editedName } : doc
            );
            setMotivationDocuments(updated);
        }
        setEditingDoc(null);
        setEditedName('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo({ ...personalInfo, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const response = await fetch(`${API_URL}/AFAIRE`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(personalInfo),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }} catch (error) {
        console.error('Error during submit:', error);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h2>Mon compte</h2>
            </div>
            <div className="profile-container">
                <div className="profile-left-column">
                    <div className="profile-personal-info">
                        <h2>Informations personnelles</h2>
                        <div className="profile-info">
                            <form onSubmit={handleSubmit}>
                                <div className="row-inputs-personal">
                                    <div>
                                        <label>Prénom</label>
                                        <input type="text" name="prenom" placeholder="Prénom" value={personalInfo.prenom} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label>Nom</label>
                                        <input type="text" name="nom" placeholder="Nom" value={personalInfo.nom} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="row-inputs-personal">
                                    <div>
                                        <label>Numéro de téléphone</label>
                                        <input type="text" name="phoneNumber" placeholder="Numéro de téléphone" value={personalInfo.phoneNumber} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label>Email</label>
                                        <input type="email" name="email" placeholder="Email" value={personalInfo.email} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="row-inputs-personal">
                                    <div>
                                        <label>Date de Naissance</label>
                                        <input type="date" name="dateNaissance" value={personalInfo.dateNaissance} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label>Localisation</label>
                                        <input type="text" name="ville" placeholder="Localisation" value={personalInfo.ville} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="row-inputs-personal">
                                    <div>
                                        <label>Site web</label>
                                        <input type="text" name="portfolio" placeholder="Lien du site web" value={personalInfo.portfolio} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label>Secteur de recherche</label>
                                        <input type="text" name="domain" placeholder="Secteur de recherche" value={personalInfo.domain} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="button-wrapper">
                                    <button type="submit" className="primary-btn">Enregistrer les modifications</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="profile-professional-info">
                        <h2>Documents professionnels</h2>
                        <div className="row-inputs-professional">
                            <div className="career-container">
                                <div className="upload-section">
                                    <label className="upload-button">
                                    <Upload size={20} /> Ajouter un CV
                                    <input type="file" accept="application/pdf" onChange={handleCvSelect} hidden />
                                    </label>
                                </div>
                                {/* --- FIX: Passed all required props to DocumentList --- */}
                                <DocumentList
                                    documents={cvDocuments}
                                    onDelete={handleDeleteCv}
                                    onPreview={handleDocumentClick}
                                    type="cv"
                                    editingDoc={editingDoc}
                                    setEditingDoc={setEditingDoc}
                                    editedName={editedName}
                                    setEditedName={setEditedName}
                                    handleRename={handleRename}
                                />
                            </div>

                            <hr />

                            <div className="career-container">
                                <div className="upload-section">
                                    <label className="upload-button">
                                    <Upload size={20} /> Ajouter une lettre de motivation
                                    <input type="file" accept="application/pdf" onChange={handleMotivationSelect} hidden />
                                    </label>
                                </div>
                                {/* --- FIX: Passed all required props to DocumentList --- */}
                                <DocumentList
                                    documents={motivationDocuments}
                                    onDelete={handleDeleteMotivation}
                                    onPreview={handleDocumentClick}
                                    type="motivation"
                                    editingDoc={editingDoc}
                                    setEditingDoc={setEditingDoc}
                                    editedName={editedName}
                                    setEditedName={setEditedName}
                                    handleRename={handleRename}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="profile-right-column">
                    <div className="profile-picture">
                        {/* --- FIX: Corrected the duplicated/broken JSX --- */}
                        <div className="image-wrapper"
                            onMouseEnter={() => setHover(true)} 
                            onMouseLeave={() => setHover(false)}
                        >
                            {uploadedImage ? (
                                <img src={uploadedImage} alt="Profile" className="profile-img" />
                            ) : (
                                <CircleUserRound size={200} strokeWidth="0.5px" />
                            )}
                            
                            {hover && (
                                <div className="edit-actions">
                                    <div className="edit-icon" onClick={() => fileInputRef.current.click()}>
                                        <Pencil size={24} />
                                    </div>
                                    {uploadedImage && (
                                        <div className="delete-icon" onClick={() => setUploadedImage(null)}>
                                            <Trash size={24} />
                                        </div>
                                    )}
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleImageUpload}
                            />
                        </div>
                        <h2>{personalInfo.prenom || 'Prénom'} {personalInfo.nom || 'Nom'}</h2>
                    </div>
                    <div className="profile-services">
                        <h2>Mes Services Liés</h2>
                        <div className="linked-services">
                            {services.map((service, index) => (
                            <div key={index} className="service-item">
                                <img src={service.icon} alt={service.name} />
                                <span>{service.name}</span>
                            </div>
                            ))}

                            {remainingServices.length > 0 && (
                                // --- FIX: Attached the ref to the dropdown's container ---
                                <div ref={dropdownRef} className="service-item add-service" style={{ position: "relative" }}>
                                    <button onClick={() => setShowMenu(!showMenu)}>+</button>

                                    {showMenu && (
                                        <ul className="service-dropdown">
                                            {remainingServices.map((service) => (
                                                <li key={service.name} onClick={() => handleAddService(service)}>
                                                    <img src={service.icon} alt={service.name} />
                                                    {service.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;