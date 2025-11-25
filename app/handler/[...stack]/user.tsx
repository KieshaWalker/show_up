import { stackServerApp } from "@/stack/server";
import { UserButton } from "@stackframe/stack";
import Link from "next/link";
import React from "react";


export default async function userPage() {
  const user = await stackServerApp.getUser();




  if (!user) {
    return (
      <a href="/handler/sign-in" className="glass-button">
        Sign In
      </a>
    );
  }

  return (
    <div className="user-info">
      <div className="user-avatar">
        {user.displayName?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div>
        <h3>Welcome, {user.displayName}!</h3>
        <a href="/handler/sign-out" className="nav-link">
          Sign Out
        </a>
      </div>
    </div>
  );
}