import React, { useState } from "react";

function Settings() {
  const [username, setUsername] = useState("JohnDoe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [password, setPassword] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Settings updated:", { username, email, password });
    // ici logique pour sauvegarder les données - API
    alert("Paramètres mis à jour avec succès !");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h2>Paramètres</h2>
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: "15px" }}>
          <label>Nom d'utilisateur:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              marginBottom: "10px",
            }}
            required
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              marginBottom: "10px",
            }}
            required
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Mot de passe:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              marginBottom: "10px",
            }}
          />
          <small>
            <em>Laissez vide si vous ne souhaitez pas changer le mot de passe.</em>
          </small>
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: "#007BFF",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "5px",
            width: "100%",
            cursor: "pointer",
          }}
        >
          Sauvegarder les modifications
        </button>
      </form>
    </div>
  );
}

export default Settings;
