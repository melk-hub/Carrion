import React, { useState, useRef } from "react";
import "../styles/InfosModal.css";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "./InputField";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import debounce from "lodash/debounce";

function InfosModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState("step2");
  const [countryInput, setCountryInput] = useState("");
  const [personalInfo, setPersonalInfo] = useState({
    lastName: "",
    firstName: "",
    birthDate: "",
    city: "",
    school: "",
    phoneNumber: "",
    jobSought: "",
    contractType: [],
    goal: "",
    sector: [],
    location: [],
    resume: null,
    linkedinLink: "",
    portfolioLink: "",
    personalDescription: "",
  });
  const [direction, setDirection] = useState(1);
  const resumeInputRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchedCityOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const response = await fetch(`${API_URL}/utils/countryList`, {
        body: JSON.stringify({
          inputValue,
        }),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        console.error("Failed to fetch city suggestions");
        return [];
      }
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
      return [];
    }
  };

  const debouncedLoadCities = debounce((inputValue, callback) => {
    return fetchedCityOptions(inputValue)
      .then((options) => callback(null, options))
      .catch((error) => callback(error, null));
  }, 500);

  /**
   * @typedef {Object} ContractOption
   * @property {string} value
   * @property {string} label
   * This is an array of objects to fill out the contract type field
   */
  const contractOptions = [
    { value: "permanent", label: "CDI" },
    { value: "fixedTerm", label: "CDD" },
    { value: "fullTime", label: "Temps plein" },
    { value: "partTime", label: "Temps partiel" },
    { value: "internship", label: "Stage" },
    { value: "apprenticeship", label: "Alternance / Apprenti" },
    { value: "freeLance", label: "Freelance" },
    { value: "seasonal", label: "Saisonnier" },
    { value: "volunteer", label: "Bénévole" },
    { value: "other", label: "Autres" },
  ];

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handleResumeUpload = (e) => {
    setPersonalInfo({ ...personalInfo, resume: e.target.files[0] });
  };

  const handleDeleteResume = () => {
    setPersonalInfo({ ...personalInfo, resume: null });
  };

  const variants = {
    enter: (direction) => ({ x: direction * 300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction * -300, opacity: 0 }),
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setDirection(1);
    if (activeStep === "step1") {
      setActiveStep("step2");
    } else if (activeStep === "step2") {
      setActiveStep("step3");
    }
  };

  const handlePrevStep = () => {
    if (activeStep === "step2") {
      setActiveStep("step1");
    } else if (activeStep === "step3") {
      setActiveStep("step2");
    }
  };

  const getSelectedOptionObjects = () => {
    if (!Array.isArray(personalInfo.contractType)) {
      return [];
    }
    return personalInfo.contractType
      .map((valueString) =>
        contractOptions.find((option) => option.value === valueString)
      )
      .filter((option) => option !== undefined);
  };

  const handleCityChange = (selectedCity) => {
    if (selectedCity) {
      setPersonalInfo((prevPersonalInfo) => ({
        ...prevPersonalInfo,
        city: selectedCity.label,
      }));
    } else {
      setPersonalInfo((prevPersonalInfo) => ({
        ...prevPersonalInfo,
        city: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("personalInfo:", personalInfo);
      const response = await fetch(`${API_URL}/user-profile/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personalInfo),
        credentials: "include",
      });
      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error("Error during submit:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="infos-modal">
        <h1>
          Compléter votre profil{" "}
          {activeStep === "step1"
            ? "1/3"
            : activeStep === "step2"
            ? "2/3"
            : "3/3"}
        </h1>

        <hr />

        <AnimatePresence mode="wait">
          {activeStep === "step1" && (
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
                  <InputField
                    label="Nom"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Prénom"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="row-inputs">
                  <InputField
                    label="Date de naissance"
                    type="date"
                    name="birthDate"
                    value={personalInfo.birthDate}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Ville"
                    name="city"
                    value={personalInfo.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="row-inputs">
                  <InputField
                    label="École / Université"
                    name="school"
                    value={personalInfo.school}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Numéro de téléphone"
                    name="phoneNumber"
                    value={personalInfo.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="button-group">
                  <button type="submit" className="primary-btn">
                    Suivant
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeStep === "step2" && (
            <motion.div
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <form className="info-form" onSubmit={handleNextStep}>
                <div>
                  <label htmlFor="contractTypeSelect">Type de contrat</label>
                  <Select
                    inputId="contractTypeSelect"
                    className="options-select"
                    classNamePrefix="custom-select"
                    closeMenuOnSelect={false}
                    isMulti
                    options={contractOptions}
                    value={getSelectedOptionObjects()}
                    onChange={(selectedOptionObjects) => {
                      let newSelectedValues = [];
                      if (selectedOptionObjects)
                        newSelectedValues = selectedOptionObjects.map(
                          (option) => option.value
                        );
                      setPersonalInfo((prevPersonalInfo) => ({
                        ...prevPersonalInfo,
                        contractType: newSelectedValues,
                      }));
                    }}
                    placeholder="Sélectionnez..."
                  />
                </div>

                <p>Quel est ton objectif principal ?</p>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="goal"
                      value="centralisation"
                      checked={personalInfo.goal === "centralisation"}
                      onChange={handleChange}
                    />
                    La centralisation des candidatures
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="goal"
                      value="automatisation"
                      checked={personalInfo.goal === "automatisation"}
                      onChange={handleChange}
                    />
                    Le suivi automatisé
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="goal"
                      value="documents"
                      checked={personalInfo.goal === "documents"}
                      onChange={handleChange}
                    />
                    L’espace documents
                  </label>
                </div>

                <div className="row-inputs">
                  <InputField
                    label="Secteur"
                    name="sector"
                    value={personalInfo.sector}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label>Localisations souhaitées</label>
                  <AsyncSelect
                    cacheOptions
                    className="options-select"
                    classNamePrefix="custom-select"
                    loadOptions={debouncedLoadCities}
                    defaultOptions
                    isClearable
                    isMulti
                    placeholder="Recherchez une ville..."
                    value={countryInput}
                    onChange={() => {
                      setCountryInput((prevCountryInput, selectedCity) => {
                        handleCityChange(selectedCity);
                      });
                    }}
                    loadingMessage={() => "Recherche..."}
                    noOptionsMessage={({ inputValue }) =>
                      !inputValue || inputValue.length < 2
                        ? "Tapez au moins 2 caractères"
                        : "Aucune ville trouvée"
                    }
                  />
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handlePrevStep}
                  >
                    Précédent
                  </button>
                  <button type="submit" className="primary-btn">
                    Suivant
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeStep === "step3" && (
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
                  <div className="resume-upload">
                    <label>Ajoute ton CV ici:</label>
                    <div
                      className="upload-box"
                      onClick={() => resumeInputRef.current.click()}
                    >
                      {personalInfo.resume ? (
                        <span>{personalInfo.resume.name}</span>
                      ) : (
                        <span>+</span>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        ref={resumeInputRef}
                        onChange={handleResumeUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                    {personalInfo.resume && (
                      <button
                        type="button"
                        className="delete-btn"
                        style={{
                          visibility: personalInfo.resume
                            ? "visible"
                            : "hidden",
                        }}
                        onClick={handleDeleteResume}
                      >
                        Supprimer mon CV
                      </button>
                    )}
                  </div>

                  <div className="links-section">
                    <InputField
                      label="LinkedIn"
                      name="linkedinLink"
                      value={personalInfo.linkedinLink}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Portfolio"
                      name="portfolioLink"
                      value={personalInfo.portfolioLink}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Petite Description de toi"
                      name="personalDescription"
                      value={personalInfo.personalDescription}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handlePrevStep}
                  >
                    Précédent
                  </button>
                  <button
                    type="submit"
                    className="primary-btn"
                    onClick={handleSubmit}
                  >
                    Valider les informations
                  </button>
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
