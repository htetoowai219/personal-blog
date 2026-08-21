import type { Metadata } from "next";
import AuthPage from "./auth-client";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function Auth() {
  return <AuthPage />;
}
