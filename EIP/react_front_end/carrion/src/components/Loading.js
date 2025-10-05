import React from 'react';
import '../styles/Loading.css';

const Loading = ({ message = "Chargement..." }) => {
  return (
    <div className="carrion-loading">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2>{message}</h2>
      </div>
    </div>
  );
};

export default Loading;

 
 