import React, { useState, useRef, useEffect, useCallback } from "react";
import { CircleUserRound } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import { fr } from "date-fns/locale/fr";
import toast from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Profile.css";

import apiService from "../services/api";
import { jobSectors } from "../data/jobSectors";
import { contractOptions } from "../data/contractOptions";

import ServicesCard from "../components/ServicesCard";
import AddServiceModal from "../components/AddServiceModal";

registerLocale("fr", fr);

const Loader = () => <div className="loader"></div>;

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

  const [connectedServices, setConnectedServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  const debouncedLoadCities = debounce((inputValue, callback) => {
    apiService
      .fetchAndFormatCities(inputValue)
      .then((options) => callback(options));
  }, 500);

  const fetchConnectedServices = useCallback(async () => {
    try {
      const response = await apiService.get("/user-profile/services");
      if (response.ok) {
        const data = await response.json();
        setConnectedServices(data.services || []);
      } else {
        throw new Error("Impossible de charger les services connectés");
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorType = urlParams.get("error");
    const successType = urlParams.get("link_success");

    if (errorType) {
      const errorMessage = urlParams.get("message");
      let messageToDisplay =
        "Une erreur est survenue lors de la liaison du service.";

      if (errorType === "conflict") {
        messageToDisplay = errorMessage
          ? `Liaison impossible : ${decodeURIComponent(errorMessage)}`
          : "Liaison impossible : L'e-mail est déjà utilisé par un autre compte.";
      } else if (errorType === "permission_denied") {
        messageToDisplay =
          "Vous avez refusé les permissions nécessaires pour lier le service.";
      }

      toast.error(messageToDisplay, { duration: 8000 });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (successType) {
      toast.success(
        `Le service ${
          successType.charAt(0).toUpperCase() + successType.slice(1)
        } a été lié avec succès !`
      );
      fetchConnectedServices();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get("/user-profile");

        if (response.ok) {
          const data = await response.json();
          setPersonalInfo({
            ...data,
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            city: data.city ? { label: data.city, value: data.city } : null,
            contractSought: data.contractSought || [],
            sector: data.sector || [],
            locationSought: data.locationSought || [],
          });
        }

        await fetchConnectedServices();
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [fetchConnectedServices]);

  const handleDisconnectService = async (serviceName) => {
    const serviceDisplayName = serviceName.includes("Google")
      ? "Google"
      : "Microsoft";
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir déconnecter votre compte ${serviceDisplayName} ?`
      )
    ) {
      return;
    }

    const disconnectPromise = apiService.delete(
      `/user-profile/services/${serviceName}`
    );

    toast.promise(disconnectPromise, {
      loading: `Déconnexion du service ${serviceDisplayName}...`,
      success: () => {
        setConnectedServices((prevServices) =>
          prevServices.filter((s) => s.name !== serviceName)
        );
        return `Service ${serviceDisplayName} déconnecté avec succès !`;
      },
      error: `Échec de la déconnexion du service ${serviceDisplayName}.`,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedImage(URL.createObjectURL(file));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
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
    const savePromise = apiService.post("/user-profile", submissionData);
    toast.promise(savePromise, {
      loading: "Enregistrement en cours...",
      success: "Profil enregistré avec succès !",
      error: "Échec de l'enregistrement du profil",
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
  if (isLoading) {
    return (
      <main className="profile-page">
        <Loader />
      </main>
    );
  }
  if (error) {
    return <main className="profile-page">Erreur: {error}</main>;
  }
  return (
    <>
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
              <h2>Informations personnelles</h2>
              <div className="profile-info-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="lastName">Nom</label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={personalInfo.lastName || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="firstName">Prénom</label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={personalInfo.firstName || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Numéro de téléphone</label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      value={personalInfo.phoneNumber || ""}
                      onChange={handleChange}
                    />
                  </div>
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
                      value={personalInfo.school || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="portfolioLink">Site web (Portfolio)</label>
                    <input
                      id="portfolioLink"
                      type="text"
                      name="portfolioLink"
                      value={personalInfo.portfolioLink || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="linkedin">LinkedIn</label>
                    <input
                      id="linkedin"
                      type="text"
                      name="linkedin"
                      value={personalInfo.linkedin || ""}
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
                      value={getSelectedObjects(
                        jobSectors,
                        personalInfo.sector
                      )}
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
            <section className="profile-card profile-picture-card">
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
                    alt="Photo de profil"
                    className="profile-img"
                  />
                ) : (
                  <CircleUserRound size={120} color="#9ca3af" />
                )}
              </div>
              <h3 className="profile-name">
                {personalInfo.firstName || "Votre"}{" "}
                {personalInfo.lastName || "Nom"}
              </h3>
            </section>
            <ServicesCard
              connectedServices={connectedServices}
              onAddService={() => setIsModalOpen(true)}
              onDisconnectService={handleDisconnectService}
            />
          </aside>
        </div>
      </main>
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        connectedServices={connectedServices}
      />
    </>
  );
}

export default Profile;
