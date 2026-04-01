// No "use client" — Server Component ✅
// Fetches profile server-side so Google can index your name, role, experience
import { Meta } from "@once-ui-system/core";
import { baseURL, about, person } from "@/resources";
import { fetchProfile } from "@/lib/server/serverFetch";
import AboutClient from "@/components/about/AboutClient";

export async function generateMetadata() {
  return Meta.generate({
    title: about.title,
    description: about.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
    path: about.path,
  });
}

export default async function AboutPage() {
  // Fetched on server — your name, role, experience visible to Google ✅
  const profile = await fetchProfile();

  // Fallback if profile fetch fails — show static content
  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}>
        <h1>{person.name}</h1>
        <p>Could not load profile. Please try again later.</p>
      </div>
    );
  }

  return <AboutClient profile={profile} />;
}
