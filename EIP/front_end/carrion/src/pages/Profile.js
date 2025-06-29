import React, { useState, useRef, useEffect } from "react";
import { CircleUserRound } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import { fr } from "date-fns/locale/fr";
import toast from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Profile.css";
import Loading from "../components/Loading";

import ApiService from "../services/api";
import { jobSectors } from "../data/jobSectors";
import { contractOptions } from "../data/contractOptions";

registerLocale("fr", fr);

function Profile() {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    birthDate: null,
    school: "",
    city: null,
    phoneNumber: "",
    portfolioLink: "",
    linkedin: "",
    contractSought: [],
    sector: [],
    locationSought: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  const debouncedLoadCities = debounce((inputValue, callback) => {
    ApiService.fetchAndFormatCities(inputValue).then((options) =>
      callback(options)
    );
  }, 500);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.get("/user-profile");
        if (!response.ok) {
          if (response.status === 404) {
            setIsLoading(false);
            return;
          }
          throw new Error("Impossible de charger le profil");
        }
        const data = await response.json();
        setPersonalInfo({
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          city: data.city ? { label: data.city, value: data.city } : null,
          contractSought: data.contractSought || [],
          sector: data.sector || [],
          locationSought: data.locationSought || [],
        });
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedImage(URL.createObjectURL(file));
  };

  // === THE DEFINITIVE FIX IS HERE ===
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // The promise executor is now a standard, synchronous function.
    const savePromise = new Promise((resolve, reject) => {
      const submissionData = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        birthDate: personalInfo.birthDate
          ? personalInfo.birthDate.toISOString().split("T")[0]
          : null,
        school: personalInfo.school,
        city: personalInfo.city ? personalInfo.city.value : "",
        phoneNumber: personalInfo.phoneNumber,
        portfolioLink: personalInfo.portfolioLink,
        linkedin: personalInfo.linkedin,
        contractSought: personalInfo.contractSought,
        sector: personalInfo.sector,
        locationSought: personalInfo.locationSought,
      };

      // The async operation is handled with .then() and .catch() inside the executor.
      ApiService.post("/user-profile", submissionData)
        .then((response) => {
          if (!response.ok) {
            // We need to parse the JSON to get the error message
            return response.json().then((errData) => {
              // Reject the promise with a new Error to pass the message to toast
              reject(
                new Error(
                  errData.message || "Échec de l'enregistrement du profil"
                )
              );
            });
          }
          // Resolve the promise on success
          resolve(response);
        })
        .catch((err) => {
          // Reject on network error
          reject(err);
        });
    });

    toast.promise(savePromise, {
      loading: "Enregistrement en cours...",
      success: "Profil enregistré avec succès !",
      error: (err) => `Erreur: ${err.message}`,
    });
  };

  const selectStyles = {
    input: (provided) => ({ ...provided, boxShadow: "none" }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  const getSelectedObjects = (options, values) => {
    if (!Array.isArray(values)) return [];
    return values
      .map((v) => options.find((o) => o.value === v))
      .filter(Boolean);
  };

  const getLocationObjects = (values) => {
    if (!Array.isArray(values)) return [];
    return values.map((v) => ({ label: v, value: v }));
  };

  if (isLoading)
    return (
      <main className="profile-page">
        <Loading message="Chargement du profil..." />
      </main>
    );
  if (error && !personalInfo.firstName)
    return (
      <main className="profile-page">Impossible de charger le profil.</main>
    );

  return (
    <main className="profile-page">
      <header className="profile-header">
        <h2>Mon compte</h2>
      </header>
      <div className="profile-container">
        <form
          className="profile-left-column"
          id="profile-form"
          onSubmit={handleSubmit}
        >
          <article className="profile-card">
            <h2 id="profile-form-heading">Informations personnelles</h2>
            <div className="profile-info-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="lastName">Nom</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="firstName">Prénom</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Numéro de téléphone</label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    value={personalInfo.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="birthDate">Date de naissance</label>
                  <DatePicker
                    id="birthDate"
                    selected={personalInfo.birthDate}
                    onChange={(date) =>
                      setPersonalInfo((prev) => ({ ...prev, birthDate: date }))
                    }
                    className="form-group-input"
                    locale="fr"
                    dateFormat="dd/MM/yyyy"
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">Localisation</label>
                  <AsyncSelect
                    inputId="city"
                    cacheOptions
                    classNamePrefix="select"
                    placeholder="Recherchez votre ville..."
                    loadOptions={debouncedLoadCities}
                    value={personalInfo.city}
                    onChange={(selected) =>
                      setPersonalInfo((prev) => ({ ...prev, city: selected }))
                    }
                    isClearable
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="school">École / Université</label>
                  <input
                    id="school"
                    type="text"
                    name="school"
                    value={personalInfo.school}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="portfolioLink">Site web (Portfolio)</label>
                  <input
                    id="portfolioLink"
                    type="text"
                    name="portfolioLink"
                    value={personalInfo.portfolioLink}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="linkedin">LinkedIn</label>
                  <input
                    id="linkedin"
                    type="text"
                    name="linkedin"
                    value={personalInfo.linkedin}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </article>

          <article className="profile-card">
            <h2>Préférences de recherche</h2>
            <div className="profile-info-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="contractSought">Types de contrat</label>
                  <Select
                    inputId="contractSought"
                    isMulti
                    classNamePrefix="select"
                    placeholder="Sélectionnez..."
                    options={contractOptions}
                    value={getSelectedObjects(
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
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sector">Secteurs de recherche</label>
                  <Select
                    inputId="sector"
                    isMulti
                    classNamePrefix="select"
                    placeholder="Sélectionnez..."
                    options={jobSectors}
                    value={getSelectedObjects(jobSectors, personalInfo.sector)}
                    onChange={(selected) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        sector: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="locationSought">
                    Localisations souhaitées
                  </label>
                  <AsyncSelect
                    inputId="locationSought"
                    isMulti
                    isCreatable
                    cacheOptions
                    classNamePrefix="select"
                    placeholder="Recherchez ou créez..."
                    loadOptions={debouncedLoadCities}
                    value={getLocationObjects(personalInfo.locationSought)}
                    onChange={(selected) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        locationSought: selected
                          ? selected.map((s) => s.value)
                          : [],
                      }))
                    }
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                  />
                </div>
              </div>
            </div>
          </article>

          <div className="form-actions-global">
            <button type="submit" className="save-button">
              Enregistrer les modifications
            </button>
          </div>
        </form>
        <aside className="profile-right-column">
          <section
            className="profile-card profile-picture-card"
            aria-label="Photo de profil et informations principales"
          >
            <div
              className="image-wrapper"
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Photo de profil actuelle"
                  className="profile-img"
                />
              ) : (
                <CircleUserRound size={120} color="#9ca3af" />
              )}
            </div>
            <h3 className="profile-name">
              {personalInfo.firstName} {personalInfo.lastName}
            </h3>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default Profile;
