"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { CircleUserRound } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import Select, { MultiValue, SingleValue, StylesConfig } from "react-select";
import AsyncSelect from "react-select/async";
import debounce from "lodash/debounce";
import { fr } from "date-fns/locale/fr";
import toast from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import apiService from "@/services/api";
import { jobSectors } from "@/data/jobSectors";
import { contractOptions } from "@/data/contractOptions";
import ServicesCard from "@/components/ServicesCard/ServicesCard";
import AddServiceModal from "@/components/AddServiceModal/AddServiceModal";
import CustomDateInput from "@/components/CustomDateInput";
import CvCard from "@/components/CvCard/CvCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConnectedService, UserProfile } from "@/interface/user.interface";
import { SelectOption } from "@/interface/misc.interface";
import styles from "./Profile.module.css";

registerLocale("fr", fr);

interface ProfileClientProps {
  initialProfile: UserProfile | null;
  initialServices: ConnectedService[];
  initialCvUrl: string | null;
  initialProfilePictureUrl: string | null;
  error: string | null;
}
const defaultProfile: UserProfile = {
  id: "",
  email: "",
  username: "",
  isEmailVerified: false,
  tokens: [],
  userProfile: {
    firstName: "",
    lastName: "",
    birthDate: null,
    school: "",
    city: "",
    phoneNumber: "",
    imageUrl: "",
    personalDescription: "",
    portfolioLink: "",
    linkedin: "",
    goal: "",
    contractSought: [],
    locationSought: [],
    sector: [],
    resume: "",
  },
};

export default function ProfileClient({
  initialProfile,
  initialServices,
  initialCvUrl,
  initialProfilePictureUrl,
  error: initialError,
}: ProfileClientProps) {
  const { t } = useLanguage();
  const [personalInfo, setPersonalInfo] = useState<UserProfile>(() => {
    const baseProfile = initialProfile || defaultProfile;
    return {
      ...baseProfile,
      userProfile: {
        ...baseProfile.userProfile,
        birthDate: baseProfile.userProfile.birthDate
          ? new Date(baseProfile.userProfile.birthDate)
          : null,
      },
    };
  });

  const [selectedCity, setSelectedCity] = useState<SelectOption | null>(
    initialProfile?.userProfile.city
      ? {
        label: initialProfile.userProfile.city,
        value: initialProfile.userProfile.city,
      }
      : null
  );

  useEffect(() => {
    setPersonalInfo((prev) => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        city: selectedCity?.value || "",
      },
    }));
  }, [selectedCity]);

  const [connectedServices, setConnectedServices] =
    useState<ConnectedService[]>(initialServices);
  const [cvUrl, setCvUrl] = useState<string | null>(initialCvUrl);
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    initialProfilePictureUrl
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedLoadCities = useMemo(
    () =>
      debounce(
        (inputValue: string, callback: (options: SelectOption[]) => void) => {
          if (inputValue.length < 2) return callback([]);
          apiService
            .fetchAndFormatCities(inputValue)
            .then((options) => callback(options));
        },
        500
      ),
    []
  );

  const handleDisconnectService = async (serviceName: string) => {
    const serviceDisplayName = serviceName.includes("Google")
      ? "Google"
      : "Microsoft";
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir déconnecter votre compte ${serviceDisplayName} ?`
      )
    )
      return;
    const disconnectPromise = apiService.delete(
      `/user-profile/services/${serviceName}`,
      {}
    );
    toast.promise(disconnectPromise, {
      loading: `Déconnexion du service ${serviceDisplayName}...`,
      success: () => {
        setConnectedServices((prev) =>
          prev.filter((s) => s.name !== serviceName)
        );
        return `Service ${serviceDisplayName} déconnecté avec succès !`;
      },
      error: `Échec de la déconnexion du service ${serviceDisplayName}.`,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPersonalInfo((prev) => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        [name]: value,
      },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tempUrl = URL.createObjectURL(file);
    setUploadedImage(tempUrl);
    setUploading(true);
    try {
      const response = await apiService.post<{ signedUrl: string } | null>(
        `/s3/upload?filename=profile&contentType=${file.type}`,
        {}
      );

      if (!response?.signedUrl) {
        toast.error("Erreur lors de la génération de l'URL de téléchargement.");
        setUploadedImage(initialProfilePictureUrl);
        return;
      }

      await fetch(response.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      toast.success("Image de profil mise à jour !");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de l'image"
      );
      setUploadedImage(initialProfilePictureUrl);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(tempUrl);
    }
  };

  const handleDeleteProfilePicture = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t("profile.removePictureConfirmation") as string))
      return;
    try {
      await apiService.delete(`/s3/delete?filename=profile`, {});
      setUploadedImage(null);
      toast.success(t("profile.removePictureSuccess") as string);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : (t("profile.removePictureError") as string)
      );
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    try {
      const response = await apiService.post<{ signedUrl: string } | null>(
        `/s3/upload?filename=cv&contentType=${file.type}`,
        {}
      );
      if (!response?.signedUrl) {
        toast.error("Erreur lors de la génération de l'URL de téléchargement.");
        return;
      }
      await fetch(response.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const newCvData = await apiService.get<{ signedUrl: string }>(
        `/s3/download?filename=cv`
      );
      if (newCvData?.signedUrl) setCvUrl(newCvData.signedUrl);
      toast.success("CV téléchargé avec succès !");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'envoi du CV"
      );
    } finally {
      setUploadingCv(false);
    }
  };

  const handleCvDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre CV ?"))
      return;
    try {
      await apiService.delete(`/s3/delete?filename=cv`, {});
      setCvUrl(null);
      toast.success("CV supprimé avec succès !");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Échec de la suppression du CV"
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savePromise = apiService.post("/user-profile", {
      ...personalInfo,
      userProfile: {
        ...personalInfo.userProfile,
        birthDate: personalInfo.userProfile.birthDate
          ? (personalInfo.userProfile.birthDate as Date)
            .toISOString()
            .split("T")[0]
          : null,
      },
    });
    toast.promise(savePromise, {
      loading: "Enregistrement en cours...",
      success: "Profil enregistré avec succès !",
      error: "Échec de l'enregistrement du profil",
    });
  };

  const multiSelectStyles: StylesConfig<SelectOption, true> = {
    menuPortal: (base) => ({ ...base, zIndex: 10011 }),
  };
  const singleSelectStyles: StylesConfig<SelectOption, false> = {
    menuPortal: (base) => ({ ...base, zIndex: 10011 }),
  };

  const getSelectedObjects = (
    options: readonly SelectOption[],
    values: string[]
  ): SelectOption[] => {
    return (
      values
        ?.map((v) => options.find((o) => o.value === v))
        .filter((item): item is SelectOption => !!item) || []
    );
  };
  const getLocationObjects = (values: string[]) =>
    values?.map((v) => ({ label: v, value: v })) || [];

  if (initialError)
    return <main className={styles.profilePage}>Erreur: {initialError}</main>;

  return (
    <>
      <main className={styles.profilePage}>
        <div className={styles.profileContainer}>
          <aside className={styles.profileRightColumn}>
            <section
              className={styles.profileCard + " " + styles.profilePictureCard}
            >
              <div
                className={styles.imageWrapper}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                {uploading ? (
                  <div>Uploading...</div>
                ) : uploadedImage ? (
                  <>
                    <Image
                      src={uploadedImage}
                      alt={t("profile.picture") as string}
                      width={120}
                      height={120}
                      className={styles.profileImg}
                      unoptimized
                    />
                    <button
                      onClick={handleDeleteProfilePicture}
                      className={styles.deleteButton}
                      title={t("profile.removePicture") as string}
                      type="button"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <CircleUserRound size={120} color="#9ca3af" />
                )}
              </div>
              <h3 className={styles.profileName}>
                {personalInfo.userProfile.firstName || ""}{" "}
                {personalInfo.userProfile.lastName || ""}
              </h3>
            </section>
            <ServicesCard
              connectedServices={connectedServices}
              onAddService={() => setIsModalOpen(true)}
              onDisconnectService={handleDisconnectService}
            />
          </aside>
          <form
            className={styles.profileLeftColumn}
            id="profile-form"
            onSubmit={handleSubmit}
          >
            <article className={styles.profileCard}>
              <h2>{t("profile.personalInfo") as string}</h2>
              <div className={styles.profileInfoForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="lastName">
                      {t("auth.lastName") as string}
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={personalInfo.userProfile.lastName || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="firstName">
                      {t("auth.firstName") as string}
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={personalInfo.userProfile.firstName || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phoneNumber">
                      {t("profile.phone") as string}
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      value={personalInfo.userProfile.phoneNumber || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="birthDate">
                      {t("auth.birthDate") as string}
                    </label>
                    <DatePicker
                      id="birthDate"
                      selected={
                        personalInfo.userProfile.birthDate
                          ? new Date(personalInfo.userProfile.birthDate)
                          : null
                      }
                      onChange={(date: Date | null) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          userProfile: {
                            ...prev.userProfile,
                            birthDate: date,
                          },
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
                  <div className={styles.formGroup}>
                    <label htmlFor="city">
                      {t("dashboard.applicationForm.location") as string}
                    </label>
                    <AsyncSelect
                      inputId="city"
                      cacheOptions
                      classNamePrefix="select"
                      placeholder={t("profile.search") as string}
                      loadOptions={debouncedLoadCities}
                      value={selectedCity}
                      onChange={(selected: SingleValue<SelectOption>) =>
                        setSelectedCity(selected)
                      }
                      isClearable
                      styles={singleSelectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="school">
                      {t("profile.school") as string}
                    </label>
                    <input
                      id="school"
                      type="text"
                      name="school"
                      value={personalInfo.userProfile.school || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup + " fullWidth"}>
                    <label htmlFor="portfolioLink">
                      {t("modal.add.website") as string}
                    </label>
                    <input
                      id="portfolioLink"
                      type="text"
                      name="portfolioLink"
                      value={personalInfo.userProfile.portfolioLink || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup + " fullWidth"}>
                    <label htmlFor="linkedin">LinkedIn</label>
                    <input
                      id="linkedin"
                      type="text"
                      name="linkedin"
                      value={personalInfo.userProfile.linkedin || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </article>
            <CvCard
              cvUrl={cvUrl as string}
              uploadingCv={uploadingCv}
              onUpload={handleCvUpload}
              onDelete={handleCvDelete}
            />
            <article className={styles.profileCard}>
              <h2>{t("profile.preferences") as string}</h2>
              <div className={styles.profileInfoForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="contractSought">
                      {t("profile.contractType") as string}
                    </label>
                    <Select
                      inputId="contractSought"
                      isMulti
                      classNamePrefix="select"
                      placeholder={t("profile.selectContract") as string}
                      options={contractOptions}
                      value={getSelectedObjects(
                        contractOptions,
                        personalInfo.userProfile.contractSought || []
                      )}
                      onChange={(selected: MultiValue<SelectOption>) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          userProfile: {
                            ...prev.userProfile,
                            contractSought: selected
                              ? selected.map((s) => s.value)
                              : [],
                          },
                        }))
                      }
                      styles={multiSelectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="sector">
                      {t("profile.sector") as string}
                    </label>
                    <Select
                      inputId="sector"
                      isMulti
                      classNamePrefix="select"
                      placeholder={t("profile.selectSector") as string}
                      options={jobSectors}
                      value={getSelectedObjects(
                        jobSectors,
                        personalInfo.userProfile.sector || []
                      )}
                      onChange={(selected: MultiValue<SelectOption>) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          userProfile: {
                            ...prev.userProfile,
                            sector: selected
                              ? selected.map((s) => s.value)
                              : [],
                          },
                        }))
                      }
                      styles={multiSelectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>
                  <div className={styles.formGroup + " fullWidth"}>
                    <label htmlFor="locationSought">
                      {t("profile.location") as string}
                    </label>
                    <AsyncSelect
                      inputId="locationSought"
                      isMulti
                      classNamePrefix="select"
                      placeholder={t("profile.searchOrCreate") as string}
                      loadOptions={debouncedLoadCities}
                      value={getLocationObjects(
                        personalInfo.userProfile.locationSought || []
                      )}
                      onChange={(selected: MultiValue<SelectOption>) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          userProfile: {
                            ...prev.userProfile,
                            locationSought: selected
                              ? selected.map((s) => s.value)
                              : [],
                          },
                        }))
                      }
                      styles={multiSelectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>
                </div>
              </div>
            </article>
            <div className={styles.formActionsGlobal}>
              <button type="submit" className={styles.saveButton}>
                {t("profile.saveChanges") as string}
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