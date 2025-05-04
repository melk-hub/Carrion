import React, { useState, useRef } from 'react';
import '../styles/InfosModal.css';
import { motion, AnimatePresence } from 'framer-motion';

function InfosModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState('step1');
  const [personalInfo, setPersonalInfo] = useState({
    nom: '', prenom: '', dateNaissance: '', email: '', ecole: '', ville: '',
    job: '', availability: '', goal: '', domain: '', location: '',
    cv: null, linkedin: '', portfolio: '', description: '',
  });
  const [direction, setDirection] = useState(1);
  const cvInputRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handleCVUpload = (e) => {
    setPersonalInfo({ ...personalInfo, cv: e.target.files[0] });
  };

  const handleDeleteCV = () => {
    setPersonalInfo({ ...personalInfo, cv: null });
  };

  const variants = {
    enter: (direction) => ({ x: direction * 300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction * -300, opacity: 0 }),
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setDirection(1);
    if (activeStep === 'step1') {
      setActiveStep('step2');
    } else if (activeStep === 'step2') {
      setActiveStep('step3');
    }
  };
  
  const handlePrevStep = () => {
    setDirection(-1);
    if (activeStep === 'step2') {
      setActiveStep('step1');
    } else if (activeStep === 'step3') {
      setActiveStep('step2');
    }
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
      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error('Error during submit:', error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="infos-modal">
        <button className="close-button" onClick={handleClose}>×</button>
        <h1>Compléter votre profil {activeStep === 'step1' ? '1/3' : activeStep === 'step2' ? '2/3' : '3/3'}</h1>
        
        <hr />

        <AnimatePresence mode="wait">
          {activeStep === 'step1' && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleNextStep}>
                <div className="row-inputs">
                  <div>
                    <label>Nom*</label>
                    <input type="text" name="nom" value={personalInfo.nom} onChange={handleChange} required />
                  </div>
                  <div>
                    <label>Prénom*</label>
                    <input type="text" name="prenom" value={personalInfo.prenom} onChange={handleChange} required />
                  </div>
                </div>
                <div className="row-inputs">
                  <div>
                    <label>Date de naissance*</label>
                    <input type="date" name="dateNaissance" value={personalInfo.dateNaissance} onChange={handleChange} required />
                  </div>
                  <div>
                    <label>Email*</label>
                    <input type="email" name="email" value={personalInfo.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="row-inputs">
                  <div>
                    <label>Ecole / Université*</label>
                    <input type="text" name="ecole" value={personalInfo.ecole} onChange={handleChange} required />
                  </div>
                  <div>
                    <label>Ville*</label>
                    <input type="text" name="ville" value={personalInfo.ville} onChange={handleChange} required />
                  </div>
                </div>
                <div className="button-group">
                  <button type="submit" className="primary-btn">Suivant</button>
                </div>
              </form>
            </motion.div>
          )}

          {activeStep === 'step2' && (
            <motion.div
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleNextStep}>
                <div className="row-inputs">
                  <div>
                    <label>Emploi recherché</label>
                    <input type="text" name="job" value={personalInfo.job} onChange={handleChange} required />
                  </div>
                  <div>
                    <label>Disponibilités</label>
                    <input type="date" name="availability" value={personalInfo.availability} onChange={handleChange} required />
                  </div>
                </div>

                <p>Quel est ton objectif principal ?</p>
                <div className="radio-group">
                  <label>
                    <input type="radio" name="goal" value="centralisation" checked={personalInfo.goal === "centralisation"} onChange={handleChange} />
                    La centralisation des candidatures
                  </label>
                  <label>
                    <input type="radio" name="goal" value="automatisation" checked={personalInfo.goal === "automatisation"} onChange={handleChange} />
                    Le suivi automatisé
                  </label>
                  <label>
                    <input type="radio" name="goal" value="documents" checked={personalInfo.goal === "documents"} onChange={handleChange} />
                    L’espace documents
                  </label>
                </div>

                <div className="row-inputs">
                  <div>
                    <label>Domaine d’intérêt</label>
                    <input type="text" name="domain" value={personalInfo.domain} onChange={handleChange} required />
                  </div>
                  <div>
                    <label>Localisation souhaitée</label>
                    <input type="text" name="location" value={personalInfo.location} onChange={handleChange} required />
                  </div>
                </div>

                <div className="button-group">
                  <button type="button" className="secondary-btn" onClick={handlePrevStep}>Précédent</button>
                  <button type="submit" className="primary-btn">Suivant</button>
                </div>
              </form>
            </motion.div>
          )}

          {activeStep === 'step3' && (
            <motion.div
              key="step3"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit}>
                <div className="step3-container">
                  <div className="cv-upload">
                    <label>Ajoute ton CV ici:</label>
                    <div className="upload-box" onClick={() => cvInputRef.current.click()}>
                      {personalInfo.cv ? <span>{personalInfo.cv.name}</span> : <span>+</span>}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        ref={cvInputRef}
                        onChange={handleCVUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                    {personalInfo.cv && (
                      <button type="button" className="delete-btn" style={{ visibility: personalInfo.cv ? 'visible' : 'hidden' }} onClick={handleDeleteCV}>
                        Supprimer mon CV
                      </button>
                    )}
                  </div>

                  <div className="links-section">
                    <div>
                      <label>LinkedIn</label>
                      <input type="url" name="linkedin" value={personalInfo.linkedin} onChange={handleChange} />
                    </div>
                    <div>
                      <label>Portfolio</label>
                      <input type="url" name="portfolio" value={personalInfo.portfolio} onChange={handleChange} />
                    </div>
                    <div>
                      <label>Petite Description de toi</label>
                      <textarea name="description" value={personalInfo.description} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="button-group">
                  <button type="button" className="secondary-btn" onClick={handlePrevStep}>Précédent</button>
                  <button type="submit" className="primary-btn">Valider les informations</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default InfosModal;
