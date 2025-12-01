import { stackServerApp } from "@/stack/server";
import { NextResponse } from "next/server";

export async function authenticateUser() {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}