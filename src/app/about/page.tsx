// No "use client" — Server Component ✅
// Fetches profile server-side so Google can index your name, role, experience
import { Meta } from "@once-ui-system/core";
import { baseURL, about, person } from "@/resources";
import { fetchProfile } from "@/lib/server/serverFetch";
import AboutClient from "@/components/about/AboutClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbStructuredData,
  buildPersonStructuredData,
} from "@/lib/seo";

export async function generateMetadata() {
  const meta = Meta.generate({
    title: about.title,
    description: about.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
    path: about.path,
  });

  return {
    ...meta,
    alternates: {
      canonical: `${baseURL}${about.path}`,
    },
  };
}

export default async function AboutPage({
  showTableOfContents = true,
}: {
  showTableOfContents?: boolean;
}) {
  // Fetched on server — your name, role, experience visible to Google ✅
  const profile = await fetchProfile();

  // Fallback if profile fetch fails — show static content
  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}>
        <JsonLd
          data={[
            buildPersonStructuredData(),
            buildBreadcrumbStructuredData([
              { name: "Home", path: "/" },
              { name: "About", path: about.path },
            ]),
          ]}
        />
        <h1>{person.name}</h1>
        <p>Could not load profile. Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      <JsonLd
        data={[
          buildPersonStructuredData(profile),
          buildBreadcrumbStructuredData([
            { name: "Home", path: "/" },
            { name: "About", path: about.path },
          ]),
        ]}
      />
      <AboutClient
        profile={profile}
        showTableOfContents={showTableOfContents}
      />
    </>
  );
}
