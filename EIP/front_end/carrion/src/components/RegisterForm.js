import React, { useState } from 'react';

function RegisterForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    street: '',
    number: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegisterSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div>
      <h2>S'enregistrer</h2>
      <div>
        <label>Prénom:</label>
        <input type="text" name="firstName" value={formData.firstName} onChange={handleRegisterChange} />
      </div>
      <div>
        <label>Nom:</label>
        <input type="text" name="lastName" value={formData.lastName} onChange={handleRegisterChange} />
      </div>
      <div>
        <label>Date de naissance:</label>
        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleRegisterChange} />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleRegisterChange} />
      </div>
      <div>
        <label>Nom d'utilisateur:</label>
        <input type="text" name="username" value={formData.username} onChange={handleRegisterChange} />
      </div>
      <div>
        <label>Mot de passe:</label>
        <input type="password" name="password" value={formData.password} onChange={handleRegisterChange} />
      </div>
      <div>
        <label>Confirmer le mot de passe:</label>
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleRegisterChange} />
      </div>
      <h3>Addresse</h3>
      <div>
        <label>Rue:</label>
        <input type="text" name="street" value={formData.street} onChange={handleRegisterChange} />
      </div>
      <div>
        <label>Numéro:</label>
        <input type="text" name="number" value={formData.number} onChange={handleRegisterChange} />
      </div>
      <div>
        <label>Ville:</label>
        <input type="text" name="city" value={formData.city} onChange={handleRegisterChange} />
      </div>
      <div>
        <label>Code postal:</label>
        <input type="text" name="postalCode" value={formData.postalCode} onChange={handleRegisterChange} />
      </div>
      <div>
        <label>Pays:</label>
        <input type="text" name="country" value={formData.country} onChange={handleRegisterChange} />
      </div>
      <button onClick={handleRegisterSubmit}>Valider l'inscription</button>
    </div>
  );
}

export default RegisterForm;
