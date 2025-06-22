import React, { useState, useRef, useEffect } from "react";
import { CircleUserRound } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Profile.css";

registerLocale("fr", fr);

const Loader = () => <div className="loader"></div>;

function Profile() {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    birthDate: null,
    school: "",
    city: "",
    phoneNumber: "",
    personalDescription: "",
    portfolioLink: "",
    linkedin: "",
    goal: "",
    jobSought: "",
    contractSought: [],
    locationSought: [],
    sector: [],
    resume: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/user-profile`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.log(
              "No existing profile found. Starting with a blank form."
            );
            setIsLoading(false);
            return;
          }
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();

        setPersonalInfo({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          school: data.school || "",
          city: data.city || "",
          phoneNumber: data.phoneNumber || "",
          personalDescription: data.personalDescription || "",
          portfolioLink: data.portfolioLink || "",
          linkedin: data.linkedin || "",
          goal: data.goal || "",
          jobSought: data.jobSought || "",
          contractSought: data.contractSought || [],
          locationSought: data.locationSought || [],
          sector: data.sector || [],
          resume: data.resume || "",
        });
      } catch (err) {
        setError(err.message);
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const submissionData = {
        ...personalInfo,
        birthDate: personalInfo.birthDate
          ? personalInfo.birthDate.toISOString().split("T")[0]
          : null,
        sector: Array.isArray(personalInfo.sector)
          ? personalInfo.sector
          : personalInfo.sector.split(",").map((s) => s.trim()),
      };

      const response = await fetch(`${API_URL}/user-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      alert("Profile saved successfully!");
    } catch (err) {
      setError(err.message);
      console.error("Error saving profile:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="profile-page">Error: {error}</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>Mon compte</h2>
      </div>
      <div className="profile-container">
        <div className="profile-left-column">
          <div className="profile-card">
            <h2>Informations personnelles</h2>
            <form className="profile-info-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Numéro de téléphone</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={personalInfo.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Date de naissance</label>
                  <DatePicker
                    selected={personalInfo.birthDate}
                    onChange={(date) =>
                      setPersonalInfo((prev) => ({ ...prev, birthDate: date }))
                    }
                    className="form-group-input"
                    locale="fr"
                    dateFormat="dd/MM/yyyy"
                    showYearDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                  />
                </div>
                <div className="form-group">
                  <label>Secteur de recherche</label>
                  <input
                    type="text"
                    name="sector"
                    value={personalInfo.sector.join(", ")}
                    onChange={(e) =>
                      setPersonalInfo((prev) => ({
                        ...prev,
                        sector: e.target.value.split(",").map((s) => s.trim()),
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Localisation</label>
                  <input
                    type="text"
                    name="city"
                    value={personalInfo.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Site web (Portfolio)</label>
                  <input
                    type="text"
                    name="portfolioLink"
                    value={personalInfo.portfolioLink}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label>LinkedIn</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={personalInfo.linkedin}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Enregistrer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="profile-right-column">
          <div className="profile-card profile-picture-card">
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
                  alt="Profile"
                  className="profile-img"
                />
              ) : (
                <CircleUserRound size={120} color="#9ca3af" />
              )}
            </div>
            <h3 className="profile-name">
              {personalInfo.firstName} {personalInfo.lastName}
            </h3>
            <p className="profile-job">{personalInfo.jobSought}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
