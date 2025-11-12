"use client";
import React, { useState } from "react";
import {
  Button,
  Column,
  Heading,
  IconButton,
  IconName,
  Row,
  Text,
} from "@once-ui-system/core";

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

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="primary"
        size="m"
        label="View Resume"
        suffixIcon={"arrowUpRight" as IconName}
        onClick={() => {
          setShow(true);
          setLoading(true);
          setError(false);
        }}
      />

      {/* Modal */}
      {show && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
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
                  src={`${resumeUrl}#view=FitH`}
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
      )}
    </>
  );
};
