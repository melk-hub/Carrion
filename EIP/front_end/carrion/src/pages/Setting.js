import React, { useState } from "react";
import "./Settings.css"; // Importation du fichier CSS

function Settings() {
  const [username, setUsername] = useState("JohnDoe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [password, setPassword] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Settings updated:", { username, email, password });
    alert("Paramètres mis à jour avec succès !");
  };

  return (
    <div className="settings-container">
      <h2>Paramètres</h2>
      <form className="settings-form" onSubmit={handleSave}>
        <div>
          <label>Nom d'utilisateur:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mot de passe:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <small className="settings-info">
            Laissez vide si vous ne souhaitez pas changer le mot de passe.
          </small>
        </div>
        <button type="submit">Sauvegarder les modifications</button>
      </form>
    </div>
  );
}

export default Settings;
