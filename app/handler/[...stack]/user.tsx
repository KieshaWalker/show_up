import { stackServerApp } from "@/stack/server";
import { UserButton } from "@stackframe/stack";
import Link from "next/link";
import React from "react";


export default async function userPage() {
  const user = await stackServerApp.getUser();




  if (!user) {
    return <Link href="/handler/sign-in"><p>Sign In</p></Link>;
  }
  return (

    <div>
      <UserButton />
      <p>Welcome, {user.displayName}!</p>
     <Link href="/handler/sign-out"><p>Sign Out</p></Link>
    </div>
  );
}