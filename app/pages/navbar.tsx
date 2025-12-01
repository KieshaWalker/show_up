'use client';

import React, { useState, useEffect } from "react";
import { stackClientApp } from "@/stack/client";

const Navbar: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await stackClientApp.getUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUser();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  if (!user) {
    return null; // Don't render the navbar if there's no user
  }

  return (
    <>
      <nav className="modern-navbar">
        <div className="navbar-container">
          <a href="/" className="navbar-brand">
            <img 
              src="/show_up.svg" 
              alt="ShowUp" 
              className="navbar-logo"
            />
          </a>

          {/* Hamburger Menu Button */}
          <button className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <div className="navbar-nav">
            <a href="/about" className="nav-link">
              About
            </a>
            <a href="/contact" className="nav-link">
              Contact
            </a>

            {user ? (
              <>
                <a href="/habits" className="nav-link">
                  Your Habits
                </a>
                <a href="/calendar" className="nav-link">
                  Calendar
                </a>
                <a href="/handler/sign-out" className="nav-link">
                  Sign Out
                </a>
                <a href="/nutrition" className="nav-link">
                  Nutrition
                </a>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}>
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <a href="/" className="mobile-menu-brand" onClick={closeMenu}>
              ShowUp
            </a>
            <button className="mobile-menu-close" onClick={closeMenu}>
              ×
            </button>
          </div>

          <div className="mobile-nav-links">
            <a href="/about" className="mobile-nav-link" onClick={closeMenu}>
              About
            </a>
            <a href="/contact" className="mobile-nav-link" onClick={closeMenu}>
              Contact
            </a>

            {user ? (
              <>
                <a href="/habits" className="mobile-nav-link" onClick={closeMenu}>
                  Your Habits
                </a>
                <a href="/calendar" className="mobile-nav-link" onClick={closeMenu}>
                  Calendar
                </a>
                <a href="/handler/sign-out" className="mobile-nav-link" onClick={closeMenu}>
                  Sign Out
                </a>
                <a href="/nutrition" className="mobile-nav-link" onClick={closeMenu}>
                  Nutrition
                </a>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;