  "use client";

  import React from "react";
  import { useRouter } from "next/navigation";
  import Image from "next/image";
  import axios from "axios";
  import logo from "@/assets/carrion_logo.png";
  import "@/styles/Header.css";

  interface HeaderProps {
    setIsAuthenticated: (isAuthenticated: boolean) => void;
  }

  function Header({ setIsAuthenticated }: HeaderProps) {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const handleLogout = async () => {
      try {
        await axios.get(`${API_URL}/auth/logout`, { withCredentials: true });
        setIsAuthenticated(false);
        router.push("/");
      } catch (error) {
        console.error("Error while logging out", error);
      }
    };

    return (
      <header className="header">
        <div
          onClick={() => router.push("/dashboard")}
          className="logo-button"
          style={{ cursor: "pointer" }}
        >
          <Image src={logo} alt="Carrion" width={100} height={100} priority />
        </div>

        <div className="navigation-container">
          <nav className="navigation-buttons">
            <button
              onClick={() => router.push("/dashboard")}
              className="applications-button"
            >
              Candidatures
            </button>
            {/* <button onClick={() => router.push('/archives')} className='archives-button'>Archives</button> */}
            {/* <button onClick={() => router.push('/objectives')} className='objectives-button'>Objectifs</button> */}
            {/* <button onClick={() => router.push('/parameters')} className='parameters-button'>Profil</button> */}
          </nav>
        </div>

        <button onClick={handleLogout} className="logout-button">
          Déconnexion
        </button>
      </header>
    );
  }

  export default Header;
