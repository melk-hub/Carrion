import React from "react";
import "../styles/Footer.css";
import logo from "../assets/carrion_logo.png";

const Footer = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="logo-footer">
          <p>
            <img src={logo} alt="Carrion logo" />
            CARRION
          </p>
        </div>
        <hr />
        <div></div>
      </div>
    </footer>
  );
};

export default Footer;
