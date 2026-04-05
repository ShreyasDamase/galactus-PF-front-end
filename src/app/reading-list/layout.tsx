import type { Metadata } from "next";
import { baseURL } from "@/resources";

export const metadata: Metadata = {
  title: "Reading List",
  description: "Private reading list saved on this device.",
  alternates: {
    canonical: `${baseURL}/reading-list`,
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ReadingListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
