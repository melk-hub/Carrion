import React, { useState, useRef, forwardRef } from "react";
import "../styles/InfosModal.css";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "./InputField";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale/fr";

import ApiService from "../services/api";
import { jobSectors } from "../data/jobSectors";
import { contractOptions } from "../data/contractOptions";

registerLocale("fr", fr);

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button
    type="button"
    className="date-picker-custom-input"
    onClick={onClick}
    ref={ref}
  >
    {value || "jj/mm/aaaa"}
  </button>
));
CustomDateInput.displayName = "CustomDateInput";

function InfosModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState("step1");
  const [personalInfo, setPersonalInfo] = useState({
    lastName: "",
    firstName: "",
    birthDate: null,
    city: null,
    school: "",
    phoneNumber: "",
    contractSought: [],
    goal: "",
    sector: [],
    locationSought: [],
    resume: null,
    linkedin: "",
    portfolioLink: "",
    personalDescription: "",
  });

  const [direction, setDirection] = useState(1);
  const resumeInputRef = useRef(null);
  const citySelectRef = useRef(null);

  const debouncedLoadCities = debounce((inputValue, callback) => {
    ApiService.fetchAndFormatCities(inputValue).then((options) =>
      callback(options)
    );
  }, 500);

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
    enter: (direction) => ({ x: direction > 0 ? 500 : -500, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 500 : -500, opacity: 0 }),
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setDirection(1);
    if (activeStep === "step1") setActiveStep("step2");
    else if (activeStep === "step2") setActiveStep("step3");
  };

  const handlePrevStep = () => {
    setDirection(-1);
    if (activeStep === "step2") setActiveStep("step1");
    else if (activeStep === "step3") setActiveStep("step2");
  };

  const getSelectedOptionObjects = (options, selectedValues) => {
    if (!Array.isArray(selectedValues)) return [];
    return selectedValues
      .map((value) => options.find((option) => option.value === value))
      .filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...personalInfo,
        city: personalInfo.city ? personalInfo.city.value : "",
        birthDate: personalInfo.birthDate
          ? personalInfo.birthDate.toISOString().split("T")[0]
          : null,
        locationSought: personalInfo.locationSought.map(
          (option) => option.value
        ),
        resume: null,
      };

      const response = await ApiService.post("/user-profile", submissionData);

      if (response.ok) {
        onClose();
      } else {
        const errorData = await response.json();
        console.error("Erreur de sauvegarde du profil:", errorData.message);
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 10002 }),

    input: (provided) => ({ ...provided, boxShadow: "none" }),
  };

  return (
    <div className="modal-overlay">
      <div className="infos-modal">
        <h1>Compléter votre profil {activeStep.replace("step", "")}/3</h1>
        <hr />
        <div className="form-content-wrapper">
          <AnimatePresence mode="wait" custom={direction}>
            {activeStep === "step1" && (
              <motion.div
                key="step1"
                className="motion-form"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <form className="info-form" onSubmit={handleNextStep}>
                  <div className="form-grid">
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
                    <div className="form-group">
                      <label htmlFor="birthDate">Date de naissance</label>
                      <DatePicker
                        id="birthDate"
                        selected={personalInfo.birthDate}
                        onChange={(date) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            birthDate: date,
                          }))
                        }
                        locale="fr"
                        dateFormat="dd/MM/yyyy"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        maxDate={new Date()}
                        customInput={<CustomDateInput />}
                        portalId="datepicker-portal"
                        popperClassName="datepicker-force-top"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="city-select">Ville</label>
                      <AsyncSelect
                        id="city-select"
                        ref={citySelectRef}
                        cacheOptions
                        classNamePrefix="select"
                        loadOptions={debouncedLoadCities}
                        isClearable
                        placeholder="Recherchez une ville..."
                        value={personalInfo.city}
                        onChange={(selected) => {
                          setPersonalInfo((prev) => ({
                            ...prev,
                            city: selected,
                          }));
                          if (citySelectRef.current)
                            citySelectRef.current.blur();
                        }}
                        loadingMessage={() => "Recherche..."}
                        noOptionsMessage={() => "Aucune ville trouvée"}
                        menuPortalTarget={document.body}
                        styles={selectStyles}
                      />
                    </div>
                    <InputField
                      label="École / Université"
                      name="school"
                      value={personalInfo.school}
                      onChange={handleChange}
                      required
                    />
                    <InputField
                      label="Numéro de téléphone"
                      type="tel"
                      name="phoneNumber"
                      value={personalInfo.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="button-group button-group-step1">
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
                className="motion-form"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <form className="info-form" onSubmit={handleNextStep}>
                  <div className="form-group">
                    <label htmlFor="contractSoughtSelect">
                      Type de contrat
                    </label>
                    <Select
                      inputId="contractSoughtSelect"
                      classNamePrefix="select"
                      closeMenuOnSelect={false}
                      isMulti
                      options={contractOptions}
                      value={getSelectedOptionObjects(
                        contractOptions,
                        personalInfo.contractSought
                      )}
                      onChange={(selected) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          contractSought: selected
                            ? selected.map((s) => s.value)
                            : [],
                        }))
                      }
                      placeholder="Sélectionnez..."
                      menuPortalTarget={document.body}
                      styles={selectStyles}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sectorSelect">Secteur</label>
                    <Select
                      inputId="sectorSelect"
                      classNamePrefix="select"
                      closeMenuOnSelect={false}
                      isMulti
                      options={jobSectors}
                      value={getSelectedOptionObjects(
                        jobSectors,
                        personalInfo.sector
                      )}
                      onChange={(selected) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          sector: selected ? selected.map((s) => s.value) : [],
                        }))
                      }
                      placeholder="Sélectionnez un ou plusieurs secteurs..."
                      menuPortalTarget={document.body}
                      styles={selectStyles}
                    />
                  </div>
                  <div className="form-group">
                    <label>Localisations souhaitées</label>
                    <AsyncSelect
                      cacheOptions
                      classNamePrefix="select"
                      loadOptions={debouncedLoadCities}
                      isClearable
                      isMulti
                      placeholder="Recherchez une ville..."
                      value={personalInfo.locationSought}
                      onChange={(selectedOptions) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          locationSought: (selectedOptions || []).filter(
                            Boolean
                          ),
                        }))
                      }
                      loadingMessage={() => "Recherche..."}
                      noOptionsMessage={() => "Aucune ville trouvée"}
                      menuPortalTarget={document.body}
                      styles={selectStyles}
                    />
                  </div>
                  <div className="form-group">
                    <label>Quel est ton objectif principal ?</label>
                    <div className="radio-group">
                      <label>
                        <input
                          type="radio"
                          name="goal"
                          value="centralisation"
                          checked={personalInfo.goal === "centralisation"}
                          onChange={handleChange}
                        />{" "}
                        La centralisation des candidatures
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="goal"
                          value="automatisation"
                          checked={personalInfo.goal === "automatisation"}
                          onChange={handleChange}
                        />{" "}
                        Le suivi automatisé
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="goal"
                          value="documents"
                          checked={personalInfo.goal === "documents"}
                          onChange={handleChange}
                        />{" "}
                        L’espace documents
                      </label>
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
                className="motion-form"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <form className="info-form" onSubmit={handleSubmit}>
                  <div className="step3-container">
                    <div className="resume-upload">
                      <div className="form-group">
                        <label>Ajoute ton CV ici:</label>
                        <div
                          className="upload-box"
                          onClick={() => resumeInputRef.current.click()}
                        >
                          {personalInfo.resume ? (
                            <span>
                              {personalInfo.resume.name.substring(0, 15)}...
                            </span>
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
                            onClick={handleDeleteResume}
                          >
                            Supprimer mon CV
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="links-section">
                      <InputField
                        label="LinkedIn"
                        name="linkedin"
                        value={personalInfo.linkedin}
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
                    <button type="submit" className="primary-btn">
                      Valider les informations
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default InfosModal;
