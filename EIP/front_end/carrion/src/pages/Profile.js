import React, { useState, useRef, useEffect, useCallback } from "react";
import { CircleUserRound } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import debounce from "lodash/debounce";
import { fr } from "date-fns/locale/fr";
import toast from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Profile.css";
import Loading from "../components/Loading";
import apiService from "../services/api";
import { jobSectors } from "../data/jobSectors";
import { contractOptions } from "../data/contractOptions";
import ServicesCard from "../components/ServicesCard";
import AddServiceModal from "../components/AddServiceModal";
import CustomDateInput from "../components/CustomDateInput";
import CvCard from "../components/CvCard";
import { useLanguage } from '../contexts/LanguageContext';

registerLocale("fr", fr);

function Profile() {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    birthDate: null,
    school: "",
    city: null,
    phoneNumber: "",
    imageUrl: "",
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
  const [uploading, setUploading] = useState(false);
  const [cvUrl, setCvUrl] = useState(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const fileInputRef = useRef(null);
  const { t } = useLanguage();

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

  const fetchCvUrl = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        filename: "cv",
      });
      const res = await apiService.get(`/s3/download?${params.toString()}`);
      if (res.ok) {
        const { signedUrl } = await res.json();
        if (signedUrl) {
          setCvUrl(signedUrl);
        }
      }
    } catch (error) {
      console.error("Failed to load CV", error);
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
            imageUrl: data.imageUrl,
          });
        }

        await fetchConnectedServices();
        await fetchCvUrl();
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [fetchConnectedServices, fetchCvUrl]);

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

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const params = new URLSearchParams({
          filename: "profile",
        });
        const res = await apiService.get(`/s3/download?${params.toString()}`);
        const { signedUrl } = await res.json();
        setUploadedImage(signedUrl);
      } catch (error) {
        console.error("Failed to load profile picture", error);
      }
    };
    fetchProfilePicture();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedImage(URL.createObjectURL(file));
    try {
      setUploading(true);

      const params = new URLSearchParams({
        filename: "profile",
        contentType: file.type,
      });
      const res = await apiService.post(`/s3/upload?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to get signed upload URL");
      }
      const { signedUrl } = await res.json();
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image to S3");
      }

      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error(error.message);
      setUploadedImage(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProfilePicture = async (e) => {
    e.stopPropagation();
    if (!window.confirm(t("profile.removePictureConfirmation"))) {
      return;
    }

    try {
      const params = new URLSearchParams({
        filename: "profile",
      });
      const res = await apiService.delete(`/s3/delete?${params.toString()}`);
      if (res.ok) {
        setUploadedImage(null);
        toast.success(t("profile.removePictureSuccess"));
      } else {
        throw new Error(t("profile.removePictureError"));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingCv(true);

      const params = new URLSearchParams({
        filename: "cv",
        contentType: file.type,
      });
      const res = await apiService.post(`/s3/upload?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Échec de la génération de l'URL signée");
      }

      const { signedUrl } = await res.json();

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Échec de l'envoi du CV sur S3");
      }

      await fetchCvUrl();
      toast.success("CV téléchargé avec succès !");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadingCv(false);
    }
  };

  const handleCvDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre CV ?")) {
      return;
    }

    try {
      const params = new URLSearchParams({
        filename: "cv",
      });
      const res = await apiService.delete(`/s3/delete?${params.toString()}`);
      if (res.ok) {
        setCvUrl(null);
        toast.success("CV supprimé avec succès !");
      } else {
        throw new Error("Échec de la suppression du CV");
      }
    } catch (error) {
      toast.error(error.message);
    }
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
        <Loading message={t("profile.loading")} />
      </main>
    );
  }

  if (error) {
    return <main className="profile-page">Erreur: {error}</main>;
  }

  return (
    <>
      <main className="profile-page">
        <div className="profile-container">
          <aside className="profile-right-column">
            <section className="profile-card profile-picture-card">
              <div className="image-wrapper" onClick={() => fileInputRef.current.click()}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                {uploadedImage ? (
                  <>
                    <img
                      src={uploadedImage}
                      alt={t("profile.picture")}
                      className="profile-img"
                    />
                    <button
                      onClick={handleDeleteProfilePicture}
                      className="delete-button"
                      title={t("profile.removePicture")}
                      type="button"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <CircleUserRound size={120} color="#9ca3af" />
                )}
                {uploading && <div>Uploading...</div>}
              </div>
              <h3 className="profile-name">
                {personalInfo.firstName || ""} {personalInfo.lastName || ""}
              </h3>
            </section>

            <ServicesCard
              connectedServices={connectedServices}
              onAddService={() => setIsModalOpen(true)}
              onDisconnectService={handleDisconnectService}
            />
          </aside>

          <form
            className="profile-left-column"
            id="profile-form"
            onSubmit={handleSubmit}
          >
            <article className="profile-card">
              <h2>{t("profile.personalInfo")} </h2>
              <div className="profile-info-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="lastName">{t("auth.lastName")}</label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={personalInfo.lastName || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="firstName">{t("auth.firstName")}</label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={personalInfo.firstName || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phoneNumber">{t("profile.phone")}</label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      value={personalInfo.phoneNumber || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="birthDate">{t("auth.birthDate")}</label>
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
                    <label htmlFor="city">{t("dashboard.applicationForm.location")}</label>
                    <AsyncSelect
                      inputId="city"
                      cacheOptions
                      classNamePrefix="select"
                      placeholder={t("profile.search")}
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
                    <label htmlFor="school">{t("profile.school")}</label>
                    <input
                      id="school"
                      type="text"
                      name="school"
                      value={personalInfo.school || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="portfolioLink">{t("modal.add.website")}</label>
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
            <CvCard
              cvUrl={cvUrl}
              uploadingCv={uploadingCv}
              onUpload={handleCvUpload}
              onDelete={handleCvDelete}
            />
            <article className="profile-card">
              <h2>{t("profile.preferences")}</h2>
              <div className="profile-info-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="contractSought">{t("profile.contractType")}</label>
                    <Select
                      inputId="contractSought"
                      isMulti
                      classNamePrefix="select"
                      placeholder={t("profile.selectContract")}
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
                    <label htmlFor="sector">{t("profile.sector")}</label>
                    <Select
                      inputId="sector"
                      isMulti
                      classNamePrefix="select"
                      placeholder={t("profile.selectSector")}
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
                      {t("profile.location")}
                    </label>
                    <AsyncSelect
                      inputId="locationSought"
                      isMulti
                      isCreatable
                      cacheOptions
                      classNamePrefix="select"
                      placeholder={t("profile.searchOrCreate")}
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
                {t("profile.saveChanges")}
              </button>
            </div>
          </form>
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
