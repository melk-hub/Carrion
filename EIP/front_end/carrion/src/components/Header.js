import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/home">Accueil</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
