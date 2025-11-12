"use client";
import React, { useState } from "react";
import {
  Button,
  Column,
  Heading,
  Icon,
  IconButton,
  Row,
  Text,
} from "@once-ui-system/core";
import { createPortal } from "react-dom";
import type { IconName } from "@once-ui-system/core";
import styles from "@/components/about/about.module.scss";

export const ResumeViewer = ({
  resumeUrl,
  resumeName,
}: {
  resumeUrl: string;
  resumeName: string;
}) => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleIframeLoad = () => setLoading(false);
  const handleIframeError = () => {
    setError(true);
    setLoading(false);
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "1200px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <Row
          fillWidth
          horizontal="between"
          vertical="center"
          borderBottom="neutral-medium"
          padding="m"
        >
          <Heading variant="heading-strong-l">{resumeName}</Heading>

          <Row gap="8">
            <IconButton
              icon={"arrowUpRightFromSquare" as IconName}
              variant="secondary"
              href={resumeUrl}
              target="_blank"
              tooltip="Open in new tab"
            />
            <IconButton
              icon={"document" as IconName}
              variant="secondary"
              href={resumeUrl}
              download={resumeName}
              tooltip="Download PDF"
            />
            <IconButton
              icon={"x" as IconName}
              variant="secondary"
              onClick={() => setShow(false)}
              tooltip="Close"
            />
          </Row>
        </Row>

        {/* PDF Viewer */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "var(--neutral-weak)",
            overflow: "hidden",
          }}
        >
          {loading && !error && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "8px",
                color: "var(--neutral-weak)",
              }}
            >
              <Text variant="body-default-s">Loading PDF...</Text>
            </div>
          )}

          {error ? (
            <Column
              fillWidth
              fillHeight
              vertical="center"
              horizontal="center"
              gap="m"
              padding="l"
              style={{ textAlign: "center" }}
            >
              <Heading variant="heading-strong-s">
                Unable to preview PDF
              </Heading>
              <Text onBackground="neutral-weak">
                This PDF cannot be displayed in the browser.
              </Text>
              <Row gap="m" paddingTop="m">
                <Button
                  href={resumeUrl}
                  target="_blank"
                  prefixIcon={"arrowUpRightFromSquare" as IconName}
                  label="Open in New Tab"
                  variant="primary"
                />
                <Button
                  href={resumeUrl}
                  download={resumeName}
                  prefixIcon={"document" as IconName}
                  label="Download"
                  variant="secondary"
                />
              </Row>
            </Column>
          ) : (
            <iframe
              src={`${resumeUrl}#zoom=50&view=FitH&toolbar=1`}
              title={resumeName}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Resume Button (styled for Once UI theme) */}
      <Row
        fitWidth
        border="brand-alpha-medium"
        background="brand-alpha-weak"
        radius="full"
        padding="4"
        gap="8"
        marginBottom="m"
        vertical="center"
        className={styles.blockAlign}
        style={{
          backdropFilter: "blur(var(--static-space-1))",
          cursor: "pointer",
        }}
        onClick={() => {
          setShow(true);
          setLoading(true);
          setError(false);
        }}
      >
        <Row paddingX="8" vertical="center" gap="4">
          <Icon paddingLeft="12" name="document" onBackground="brand-weak" />
          <Row paddingX="8">View Resume</Row>
        </Row>
      </Row>

      {/* Render modal at document.body using portal */}
      {show && typeof window !== "undefined"
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
};
