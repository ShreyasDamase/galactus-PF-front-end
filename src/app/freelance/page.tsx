// src/app/freelance/page.tsx
"use client";

import React, { useState, TextareaHTMLAttributes } from "react";
import { motion } from "framer-motion";
import {
  Heading,
  Column,
  Row,
  Text,
  Input,
  Button,
  Background,
  Line,
} from "@once-ui-system/core";
import { opacity, SpacingToken } from "@once-ui-system/core";
import { useProfile } from "@/lib/hooks/useProfile";
import { freelanceApi } from "@/lib/api/freelance.api";

// Local TextArea wrapper matching Once UI
const TextArea: React.FC<
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: boolean;
    errorMessage?: React.ReactNode;
  }
> = ({ error, errorMessage, style, onBlur, ...props }) => (
  <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
    <motion.textarea
      {...(props as any)}
      whileHover={{ scale: 1.002 }}
      transition={{ duration: 0.2 }}
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: "12px",
        border: error
          ? "1px solid var(--danger)"
          : "1px solid var(--neutral-alpha-weak)",
        fontFamily: "inherit",
        fontSize: "16px",
        resize: "vertical",
        background: "var(--neutral-alpha-weak)",
        color: "var(--neutral-strong)",
        outline: "none",
        transition: "border-color 0.2s ease",
        ...style,
      }}
      onFocus={(e: any) => {
        if (!error) {
          e.target.style.borderColor = "var(--primary)";
        }
      }}
      onBlur={(e: any) => {
        if (!error) {
          e.target.style.borderColor = "var(--neutral-alpha-weak)";
        }
        if (onBlur) onBlur(e);
      }}
    />
    {error && errorMessage && (
      <Text
        variant="body-default-s"
        marginTop="4"
        style={{ fontSize: "0.85rem", color: "var(--danger)" }}
      >
        {errorMessage}
      </Text>
    )}
  </div>
);

export default function Freelance() {
  const { data: profile, isLoading, error: profileError } = useProfile();

  // Inquiry Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "Web App",
    budget: "",
    currency: "USD",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const freelance = profile?.freelance;

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "name":
        return value.trim() ? "" : "Name is required.";
      case "email":
        if (!value.trim()) return "Email is required.";
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(value)
          ? ""
          : "Please enter a valid email address.";
      case "budget":
        if (!value.trim()) return "Estimated budget is required.";
        const parsed = Number(value);
        if (isNaN(parsed) || parsed < 0) {
          return "Budget must be a valid positive number.";
        }
        return "";
      case "description":
        return value.trim() ? "" : "Please describe your project details.";
      default:
        return "";
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field as keyof typeof form]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const isFormValid = () => {
    const newErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      budget: validateField("budget", form.budget),
      description: validateField("description", form.description),
    };
    setErrors(newErrors);
    setTouched({ name: true, email: true, budget: true, description: true });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || !profile?.username) return;

    try {
      setSubmitting(true);
      setSubmitStatus(null);
      setStatusMessage("");

      await freelanceApi.submitInquiry(profile.username, {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        projectType: form.projectType,
        budget: Number(form.budget),
        currency: form.currency,
        description: form.description.trim(),
      });

      setSubmitStatus("success");
      setStatusMessage("🎉 Inquiry submitted successfully! I will review your proposal and get in touch shortly.");
      setForm({
        name: "",
        email: "",
        company: "",
        projectType: "Web App",
        budget: "",
        currency: "USD",
        description: "",
      });
      setErrors({});
      setTouched({});
    } catch (err: any) {
      console.error(err);
      setSubmitStatus("error");
      setStatusMessage(err.message || "Failed to submit inquiry. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Column maxWidth="m" fillWidth gap="xl" paddingY="12" horizontal="center" align="center">
        <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" style={{
            border: "3px solid transparent",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            width: "40px",
            height: "40px"
          }}></div>
        </div>
      </Column>
    );
  }

  if (profileError || !profile || !freelance) {
    return (
      <Column maxWidth="m" fillWidth gap="xl" paddingY="12" horizontal="center" align="center">
        <Column background="surface" border="neutral-alpha-weak" radius="xl" padding="xl" horizontal="center" gap="16">
          <Heading variant="display-strong-xs">Freelance Info Unavailable</Heading>
          <Text align="center" onBackground="neutral-weak">
            Freelance services are currently disabled or have not been configured yet.
          </Text>
        </Column>
      </Column>
    );
  }

  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center" fillWidth style={{ position: "relative", paddingBottom: "128px" }}>
      <Background
        top="0"
        position="absolute"
        gradient={{
          display: true,
          opacity: 30 as opacity,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          tilt: 0,
          colorStart: "primary-weak",
          colorEnd: "surface",
        }}
        dots={{
          display: true,
          opacity: 10 as opacity,
          size: "4" as SpacingToken,
          color: "neutral-alpha-weak",
        }}
      />

      <Column fillWidth gap="24" style={{ zIndex: 1 }}>
        {/* Availability Header Card */}
        <Column
          overflow="hidden"
          fillWidth
          padding="xl"
          radius="xl"
          background="surface"
          border="neutral-alpha-weak"
          gap="24"
        >
          <Row fillWidth vertical="center" horizontal="between" s={{ direction: "column", gap: "16" }}>
            <Column gap="8">
              <Row gap="8" vertical="center">
                <span style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: freelance.isAvailable ? "var(--success)" : "var(--neutral-alpha-medium)",
                  boxShadow: freelance.isAvailable ? "0 0 10px var(--success)" : "none"
                }}></span>
                <Text variant="body-strong-s" onBackground="neutral-weak">
                  {freelance.isAvailable ? "Available for Hire" : "Fully Booked / Not Available"}
                </Text>
              </Row>
              <Heading variant="display-strong-s">{freelance.title || "Freelance Consultant"}</Heading>
            </Column>
            {freelance.rate > 0 && (
              <Column align="end" s={{ align: "start" }}>
                <Text variant="body-default-xs" onBackground="neutral-weak" className="uppercase tracking-wider">
                  Starting Rate
                </Text>
                <Heading variant="display-strong-xs" style={{ color: "var(--primary)" }}>
                  {freelance.currency === "USD" ? "$" : freelance.currency === "INR" ? "₹" : freelance.currency}
                  {freelance.rate}/hr
                </Heading>
              </Column>
            )}
          </Row>

          <Line background="neutral-alpha-weak" />

          <Text variant="body-default-l" onBackground="neutral-medium" style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {freelance.description?.trim() || "Looking to build a custom application? Send a proposal using the form below."}
          </Text>

          {freelance.services && freelance.services.length > 0 && (
            <Column gap="12">
              <Text variant="body-strong-s" onBackground="neutral-weak">
                Services Provided:
              </Text>
              <Row gap="8" wrap fillWidth>
                {freelance.services.map((service, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      background: "var(--neutral-alpha-weak)",
                      border: "1px solid var(--neutral-alpha-weak)",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--neutral-strong)"
                    }}
                  >
                    {service}
                  </span>
                ))}
              </Row>
            </Column>
          )}

          {freelance.calendarLink && (
            <Row marginTop="12">
              <Button
                size="l"
                href={freelance.calendarLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                📅 Schedule a Quick Discovery Call
              </Button>
            </Row>
          )}
        </Column>

        {/* Hire Form Section */}
        <Column
          fillWidth
          padding="xl"
          radius="xl"
          background="surface"
          border="neutral-alpha-weak"
          gap="24"
        >
          <Column fillWidth horizontal="center">
            <Heading marginBottom="s" variant="display-strong-xs">
              Project Proposals & Hiring
            </Heading>
            <Text wrap="balance" variant="body-default-m" onBackground="neutral-weak" align="center">
              Fill out the details of your project below. I'll analyze the details, budget, and scope, and reply as soon as possible.
            </Text>
          </Column>

          {submitStatus && (
            <Column
              padding="m"
              radius="m"
              fillWidth
              background={submitStatus === "success" ? "success-alpha-weak" : "danger-alpha-weak"}
              style={{
                border: `1px solid ${submitStatus === "success" ? "var(--success)" : "var(--danger)"}`,
                color: submitStatus === "success" ? "var(--success)" : "var(--danger)"
              }}
            >
              <Text variant="body-strong-m">
                {statusMessage}
              </Text>
            </Column>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
            <Row gap="16" fillWidth s={{ direction: "column" }}>
              {/* Name */}
              <Input
                id="hire-name"
                name="name"
                type="text"
                placeholder="Your Name *"
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                error={!!(touched.name && errors.name)}
                errorMessage={touched.name ? errors.name : ""}
              />

              {/* Email */}
              <Input
                id="hire-email"
                name="email"
                type="email"
                placeholder="Your Email *"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                error={!!(touched.email && errors.email)}
                errorMessage={touched.email ? errors.email : ""}
              />
            </Row>

            <Row gap="16" fillWidth s={{ direction: "column" }}>
              {/* Company */}
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <Input
                  id="hire-company"
                  name="company"
                  type="text"
                  placeholder="Company Name (Optional)"
                  value={form.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                />
              </div>

              {/* Project Type */}
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <select
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "0 16px",
                    borderRadius: "12px",
                    border: "1px solid var(--neutral-alpha-weak)",
                    fontFamily: "inherit",
                    fontSize: "16px",
                    background: "var(--neutral-alpha-weak)",
                    color: "var(--neutral-strong)",
                    outline: "none",
                  }}
                  value={form.projectType}
                  onChange={(e) => handleChange("projectType", e.target.value)}
                >
                  <option value="Web App">Web Application Dev</option>
                  <option value="Mobile App">Mobile Application Dev (iOS/Android)</option>
                  <option value="UI/UX Design">UI/UX Design UI Specs</option>
                  <option value="Consulting">Technical Consulting</option>
                  <option value="Other">Other Custom Development</option>
                </select>
              </div>
            </Row>

            <Row gap="16" fillWidth vertical="center" s={{ direction: "column", align: "stretch" }}>
              {/* Currency Dropdown */}
              <div style={{ width: "100%", flexShrink: 0 }} className="md:max-w-[100px]">
                <select
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "0 12px",
                    borderRadius: "12px",
                    border: "1px solid var(--neutral-alpha-weak)",
                    fontFamily: "inherit",
                    fontSize: "16px",
                    background: "var(--neutral-alpha-weak)",
                    color: "var(--neutral-strong)",
                    outline: "none",
                  }}
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              {/* Estimated Budget */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Input
                  id="hire-budget"
                  name="budget"
                  type="number"
                  placeholder="Estimated Project Budget (Numbers Only) *"
                  required
                  min={0}
                  value={form.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  onBlur={() => handleBlur("budget")}
                  error={!!(touched.budget && errors.budget)}
                  errorMessage={touched.budget ? errors.budget : ""}
                />
              </div>
            </Row>

            {/* Description */}
            <TextArea
              id="hire-description"
              name="description"
              placeholder="Tell me about your project scope, requirements, timeline, etc. *"
              required
              rows={6}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              onBlur={() => handleBlur("description")}
              error={!!(touched.description && errors.description)}
              errorMessage={touched.description ? errors.description : ""}
            />

            <Row height="48" vertical="center" marginTop="8">
              <Button
                size="l"
                fillWidth
                type="submit"
                disabled={submitting || !freelance.isAvailable}
              >
                {submitting ? "Submitting Proposal..." : "Submit Hire Request"}
              </Button>
            </Row>
          </form>
        </Column>
      </Column>
    </Column>
  );
}
