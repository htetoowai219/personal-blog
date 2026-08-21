import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit entry",
};

export default function EditEntryLayout({
  children,
}: LayoutProps<"/home/[id]/edit">) {
  return children;
}
