/**
 * Navigation Bar Component
 *
 * Responsive navigation component that provides access to all main sections of the app.
 * Features a modern design with mobile hamburger menu and conditional rendering based on authentication status.
 */

'use client';

import React, { useState, useEffect } from "react";
import { stackClientApp } from "@/stack/client";

/**
 * Navbar Component
 *
 * Main navigation component for the ShowUp application. Provides links to all major sections
 * and includes responsive mobile menu functionality. Only renders when user is authenticated.
 *
 * Features:
 * - Responsive hamburger menu for mobile devices
 * - Conditional navigation links based on authentication status
 * - Modern glassmorphism design with smooth animations
 * - Mobile overlay menu with backdrop blur
 *
 * @returns {JSX.Element | null} Navigation bar or null if user not authenticated
 */
const Navbar: React.FC = () => {
  // State for user authentication data
  const [user, setUser] = useState<any>(null);

  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch user data on component mount
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

  /**
   * Toggle mobile menu visibility
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Close mobile menu
   */
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Don't render navbar if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="modern-navbar">
        <div className="navbar-container">
          {/* Brand/Logo Link */}
          <a href="/" className="navbar-brand">
            <img
              src="/show_up.svg"
              alt="ShowUp"
              className="navbar-logo"
            />
          </a>

          {/* Hamburger Menu Button - Mobile Only */}
          <button className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="navbar-nav">
            <a href="/about" className="nav-link">
              About
            </a>
            <a href="/contact" className="nav-link">
              Contact
            </a>

            {/* Authenticated User Links */}
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
                  <a href="/api/calendar/dashboard" className="nav-link">
                  Dashboard
                </a>
                <a href="/featuring" className="nav-link">
                  Yesterday's Summary
                </a>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}>
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          {/* Mobile Menu Header */}
          <div className="mobile-menu-header">
            <a href="/" className="mobile-menu-brand" onClick={closeMenu}>
              ShowUp
            </a>
            <button className="mobile-menu-close" onClick={closeMenu}>
              ×
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="mobile-nav-links">
            <a href="/about" className="mobile-nav-link" onClick={closeMenu}>
              About
            </a>
            <a href="/contact" className="mobile-nav-link" onClick={closeMenu}>
              Contact
            </a>

            {/* Authenticated User Mobile Links */}
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
                <a href="/api/calendar/dashboard" className="mobile-nav-link" onClick={closeMenu}>
                  Dashboard
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