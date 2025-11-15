"use client";

import React, { useState, TextareaHTMLAttributes } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Heading,
  Input,
  Text,
  Background,
  Column,
  Row,
} from "@once-ui-system/core";
import { opacity, SpacingToken } from "@once-ui-system/core";
import { useSendMail } from "@/lib/hooks/useSendMail";

// Local TextArea wrapper matching Once-UI design
const TextArea: React.FC<
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: boolean;
    errorMessage?: React.ReactNode;
  }
> = ({ error, errorMessage, style, onBlur, ...props }) => (
  <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
    <motion.textarea
      {...(props as any)}
      whileHover={{ scale: 1.005 }}
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
        background: "var(--surface)",
        color: "var(--on-surface)",
        outline: "none",
        transition: "border-color 0.2s ease",
        ...style,
      }}
      className="custom-scrollbar"
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
    <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 10px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.3) 0%,
          rgba(255, 255, 255, 0.15) 100%
        );
        border-radius: 10px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.4) 0%,
          rgba(255, 255, 255, 0.25) 100%
        );
      }

      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
      }
    `}</style>
    {error && errorMessage && (
      <Text
        variant="body-default-s"
        onBackground="danger-weak"
        marginTop="4"
        style={{ fontSize: "0.85rem", color: "var(--danger)" }}
      >
        {errorMessage}
      </Text>
    )}
  </div>
);

export const ContactForm: React.FC<React.ComponentProps<typeof Column>> = ({
  ...flex
}) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: sendMail, isPending } = useSendMail();

  // Validation logic
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
      case "message":
        return value.trim() ? "" : "Message cannot be empty.";
      default:
        return "";
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing (if field was touched)
    if (touched[field as keyof typeof touched]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field as keyof typeof form]);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const isFormValid = () => {
    const newErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      message: validateField("message", form.message),
    };
    setErrors(newErrors);
    setTouched({ name: true, email: true, message: true });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    setIsSubmitting(true);

    try {
      await sendMail(form); // Send form data to backend
      console.log("✅ Mail sent successfully");

      // Reset form
      setForm({ name: "", email: "", message: "" });
      setErrors({ name: "", email: "", message: "" });
      setTouched({ name: false, email: false, message: false });
    } catch (error: any) {
      console.error("❌ Failed to send mail:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Column
      overflow="hidden"
      fillWidth
      padding="m"
      radius="l"
      marginBottom="xl"
      horizontal="center"
      align="center"
      background="surface"
      border="neutral-alpha-weak"
      {...flex}
    >
      {/* Background styling */}
      <Background
        top="0"
        position="absolute"
        gradient={{
          display: true,
          opacity: 40 as opacity,
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

      {/* Header Section */}
      <Column maxWidth="xs" horizontal="center">
        <Heading marginBottom="s" variant="display-strong-xs">
          Contact Us
        </Heading>
        <Text
          wrap="balance"
          marginBottom="l"
          variant="body-default-l"
          onBackground="neutral-weak"
        >
          Have questions or feedback? Fill out the form below — we'll get back
          to you soon.
        </Text>
      </Column>

      {/* Form Section */}
      <Column id="contact_form" fillWidth maxWidth={24} gap="12">
        {/* Name */}
        <Input
          id="contact-name"
          name="name"
          type="text"
          placeholder="Your Name"
          required
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          error={!!(touched.name && errors.name)}
          errorMessage={touched.name ? errors.name : ""}
        />

        {/* Email */}
        <Input
          id="contact-email"
          name="email"
          type="email"
          placeholder="Your Email"
          required
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          error={!!(touched.email && errors.email)}
          errorMessage={touched.email ? errors.email : ""}
        />

        {/* Message */}
        <TextArea
          id="contact-message"
          name="message"
          placeholder="Your Message"
          required
          rows={6}
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          onBlur={() => handleBlur("message")}
          error={!!(touched.message && errors.message)}
          errorMessage={touched.message ? errors.message : ""}
        />

        {/* Submit Button */}
        <Row height="48" vertical="center" marginTop="m">
          <Button
            size="m"
            fillWidth
            onClick={handleSubmit}
            disabled={isSubmitting || isPending}
          >
            {isPending ? "Sending..." : "Send Message"}
          </Button>
        </Row>
      </Column>
    </Column>
  );
};
