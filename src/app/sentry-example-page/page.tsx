"use client";

import * as Sentry from "@sentry/nextjs";

export default function Page() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <h1>Sentry Test Page</h1>
      <p style={{ marginBottom: '2rem' }}>Click the button below to manually throw an error so we can test the Sentry configuration!</p>
      <button
        onClick={() => {
          throw new Error("Client Test Error -> Sentry Works!");
        }}
        style={{ padding: '12px 24px', backgroundColor: '#e11d48', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Throw Client Error
      </button>

      <button
        onClick={() => {
          Sentry.captureMessage("Sentry Message -> Test from manual trigger");
        }}
        style={{ marginTop: '1rem', padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Send Sentry Message
      </button>
    </div>
  );
}
