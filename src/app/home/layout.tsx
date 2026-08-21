import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entries",
};

export default function HomeLayout({ children }: LayoutProps<"/home">) {
  return children;
}
