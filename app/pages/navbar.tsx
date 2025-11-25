import React from "react";
import userPage from "../handler/[...stack]/user";
import { StackServerApp } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

const Navbar: React.FC = async () => {
    const user = await userPage();
  const userOne = await stackServerApp.getUser();

  if (!userOne) {
    return null; // Don't render the navbar if there's no user
  }

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-brand">
          ShowUp
        </a>
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
  );
};

export default Navbar;