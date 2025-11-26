"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "@/components/InputField";
import Select, {
  StylesConfig,
  GroupBase,
  MultiValue,
  SingleValue,
  SelectInstance,
} from "react-select";
import AsyncSelect from "react-select/async";
import { debounce } from "lodash";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale/fr";
import toast from "react-hot-toast";
import ApiService from "@/services/api";
import { jobSectors } from "@/data/jobSectors";
import { contractOptions } from "@/data/contractOptions";
import CustomDateInput from "@/components/CustomDateInput";
import styles from "./InfosModal.module.css";

// --- Définition des Types ---

interface SelectOption {
  value: string;
  label: string;
}

interface PersonalInfoState {
  lastName: string;
  firstName: string;
  birthDate: Date | null;
  city: SelectOption | null;
  school: string;
  phoneNumber: string;
  contractSought: string[];
  goal: string;
  sector: string[];
  locationSought: SelectOption[];
  linkedin: string;
  portfolioLink: string;
  personalDescription: string;
}

registerLocale("fr", fr);

function InfosModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeStep, setActiveStep] = useState("step1");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoState>({
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
    linkedin: "",
    portfolioLink: "",
    personalDescription: "",
  });

  const [direction, setDirection] = useState(1);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const citySelectRef = useRef<SelectInstance<SelectOption> | null>(null);
  const uploadBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const debouncedLoadCities = debounce(
    (inputValue: string, callback: (options: SelectOption[]) => void) => {
      ApiService.fetchAndFormatCities(inputValue).then(callback);
    },
    500
  );

  useEffect(() => {
    if (resumeFile) {
      const url = URL.createObjectURL(resumeFile);
      setResumePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setResumePreviewUrl(null);
    }
  }, [resumeFile]);

  if (!isOpen) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const handleDeleteResume = () => {
    setResumeFile(null);
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
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

  const getSelectedOptionObjects = (
    options: SelectOption[],
    selectedValues: string[]
  ) => {
    return selectedValues
      .map((value) => options.find((option) => option.value === value))
      .filter((option): option is SelectOption => Boolean(option));
  };

  const handleViewResume = () => {
    if (resumePreviewUrl) window.open(resumePreviewUrl, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...personalInfo,
        city: personalInfo.city
          ? (personalInfo.city as { value: string }).value
          : "",
        birthDate: personalInfo.birthDate
          ? (personalInfo.birthDate as Date).toISOString().split("T")[0]
          : null,
        locationSought: personalInfo.locationSought.map(
          (option) => (option as { value: string }).value
        ),
      };

      const response = await ApiService.post("/user-profile", submissionData);

      if (response) {
        const file = resumeFile;
        if (file) {
          try {
            const params = new URLSearchParams({
              filename: "cv",
              contentType: file.type,
            });

            const res = await ApiService.post(
              `/s3/upload?${params.toString()}`
            );

            if (!(res instanceof Response)) {
              throw new Error(
                "Error occured while trying to receive signed url"
              );
            }

            if (!res.ok)
              throw new Error("Échec de la génération de l'URL signée");
            const { signedUrl } = await res.json();

            const uploadRes = await fetch(signedUrl, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            });
            if (!uploadRes.ok) throw new Error("Échec de l'envoi du CV sur S3");
            toast.success("Profil et CV sauvegardés avec succès !");
          } catch (err: unknown) {
            if (err instanceof Error) {
              toast.error(err.message);
            } else {
              toast.error("Une erreur inconnue est survenue.");
            }
          }
        } else {
          toast.success("Profil sauvegardé avec succès !");
        }
        onClose();
      } else {
        toast.error(
          `Erreur de sauvegarde: lors de la création du profil`
        );
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la soumission.");
      console.error("Erreur lors de la soumission:", error);
    }
  };

  const multiSelectStyles: StylesConfig<
    SelectOption,
    true,
    GroupBase<SelectOption>
  > = {
    input: (provided) => ({ ...provided, boxShadow: "none" }),
  };

  const singleSelectStyles: StylesConfig<
    SelectOption,
    false,
    GroupBase<SelectOption>
  > = {
    input: (provided) => ({ ...provided, boxShadow: "none" }),
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.infosModal}>
        <h1>Compléter votre profil {activeStep.replace("step", "")}/3</h1>
        <hr />
        <div className={styles.formContentWrapper}>
          <AnimatePresence mode="wait" custom={direction}>
            {activeStep === "step1" && (
              <motion.div
                key="step1"
                className={styles.motionForm}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <form className={styles.infoForm} onSubmit={handleNextStep}>
                  <div className={styles.formGrid}>
                    <InputField
                      name="lastName"
                      label="Nom"
                      value={personalInfo.lastName}
                      onChange={handleChange}
                      required
                    />
                    <InputField
                      name="firstName"
                      label="Prénom"
                      value={personalInfo.firstName}
                      onChange={handleChange}
                      required
                      as="input"
                    />
                    <div className={styles.formGroup}>
                      <label htmlFor="birthDate">
                        Date de naissance
                        <span className={styles.requiredStar}>*</span>
                      </label>
                      <DatePicker
                        id="birthDate"
                        selected={personalInfo.birthDate}
                        onChange={(date: Date | null) =>
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
                        popperClassName={styles.datepickerForceTop}
                        popperProps={{
                          strategy: "fixed",
                        }}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="city-select">
                        Ville<span className={styles.requiredStar}>*</span>
                      </label>
                      {isClient && (
                        <AsyncSelect
                          id="city-select"
                          ref={citySelectRef}
                          cacheOptions
                          classNamePrefix="select"
                          loadOptions={debouncedLoadCities}
                          isClearable
                          placeholder="Recherchez une ville..."
                          value={personalInfo.city}
                          onChange={(selected: SingleValue<SelectOption>) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              city: selected,
                            }))
                          }
                          loadingMessage={() => "Recherche..."}
                          noOptionsMessage={() => "Aucune ville trouvée"}
                          menuPortalTarget={document.body}
                          styles={singleSelectStyles}
                        />
                      )}
                    </div>
                    <InputField
                      name="school"
                      label="Université"
                      value={personalInfo.school}
                      onChange={handleChange}
                      required
                    />
                    <InputField
                      type="tel"
                      name="phoneNumber"
                      label="Numéro de téléphone"
                      value={personalInfo.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div
                    className={`${styles.buttonGroup} ${styles.buttonGroupStep1}`}
                  >
                    <button type="submit" className={styles.primaryBtn}>
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
                <form className={styles.infoForm} onSubmit={handleNextStep}>
                  {isClient && (
                    <>
                      <div className={styles.formGroup}>
                        <label htmlFor="contractSoughtSelect">
                          Type de contrat
                        </label>
                        <Select
                          inputId="contractSoughtSelect"
                          classNamePrefix="select"
                          isMulti
                          options={contractOptions}
                          value={getSelectedOptionObjects(
                            contractOptions,
                            personalInfo.contractSought
                          )}
                          onChange={(selected: MultiValue<SelectOption>) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              contractSought: selected.map((s) => s.value),
                            }))
                          }
                          placeholder="Sélectionnez..."
                          menuPortalTarget={document.body}
                          styles={multiSelectStyles}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="sectorSelect">Secteur</label>
                        <Select
                          inputId="sectorSelect"
                          classNamePrefix="select"
                          isMulti
                          options={jobSectors}
                          value={getSelectedOptionObjects(
                            jobSectors,
                            personalInfo.sector
                          )}
                          onChange={(selected: MultiValue<SelectOption>) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              sector: selected.map((s) => s.value),
                            }))
                          }
                          placeholder="Sélectionnez un ou plusieurs secteurs..."
                          menuPortalTarget={document.body}
                          styles={multiSelectStyles}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Localisations souhaitées</label>
                        <AsyncSelect
                          cacheOptions
                          classNamePrefix="select"
                          isMulti
                          loadOptions={debouncedLoadCities}
                          placeholder="Recherchez une ville..."
                          value={personalInfo.locationSought}
                          onChange={(selected: MultiValue<SelectOption>) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              locationSought: [...selected],
                            }))
                          }
                          menuPortalTarget={document.body}
                          styles={multiSelectStyles}
                        />
                      </div>
                    </>
                  )}
                  <div className={styles.formGroup}>
                    <label>Quel est ton objectif principal ?</label>
                    <div className={styles.radioGroup}>
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
                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={handlePrevStep}
                    >
                      Précédent
                    </button>
                    <button type="submit" className={styles.primaryBtn}>
                      Suivant
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeStep === "step3" && (
              <motion.div
                key="step3"
                className={styles.motionForm}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <form className={styles.infoForm} onSubmit={handleSubmit}>
                  <div className={styles.step3Container}>
                    <div className={styles.resumeUpload}>
                      <div className={styles.formGroup}>
                        <label>Ajoute ton CV ici:</label>
                        <div
                          ref={uploadBoxRef}
                          className={styles.uploadBox}
                          onClick={
                            resumeFile
                              ? handleViewResume
                              : () => resumeInputRef.current?.click()
                          }
                          title={
                            resumeFile
                              ? "Cliquer pour visualiser le CV"
                              : "Cliquer pour ajouter un CV"
                          }
                        >
                          {resumePreviewUrl && (
                            <iframe
                              src={resumePreviewUrl}
                              style={{ width: "100%", height: "100%", border: "none" }}
                              title="Aperçu du CV"
                            />
                          )}
                          {!resumeFile && (
                            <span className={styles.plusSign}>+</span>
                          )}
                          <input
                            type="file"
                            accept=".pdf"
                            ref={resumeInputRef}
                            onChange={handleResumeUpload}
                            style={{ display: "none" }}
                          />
                        </div>
                        {resumeFile && (
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={handleDeleteResume}
                          >
                            Supprimer mon CV
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={styles.linksSection}>
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
                        as="textarea"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={handlePrevStep}
                    >
                      Précédent
                    </button>
                    <button type="submit" className={styles.primaryBtn}>
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
