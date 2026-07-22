"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Fade, Flex, Line, Row, ToggleButton } from "@once-ui-system/core";

import {
  routes,
  display,
  person,
  about,
  blog,
  work,
  gallery,
  videos,
} from "@/resources";
import { useProfile } from "@/lib/hooks/useProfile";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.scss";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string; // Optionally allow locale, defaulting to 'en-GB'
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  timeZone,
  locale = "en-GB",
}) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const timeString = new Intl.DateTimeFormat(locale, options).format(now);
      setCurrentTime(timeString);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, [timeZone, locale]);

  return <>{currentTime}</>;
};

export default TimeDisplay;

export const Header = () => {
  const pathname = usePathname() ?? "";
  const { data: profile } = useProfile();

  const isTabVisible = (route: string) => {
    if (!routes[route as keyof typeof routes]) return false;
    const userTabs = profile?.preferences?.visibleTabs;
    if (userTabs && userTabs[route] === false) return false;
    if (route === "/freelance" && profile?.freelance?.showPublicTab === false)
      return false;
    return true;
  };

  return (
    <>
      <Fade
        s={{ hide: true }}
        fillWidth
        position="fixed"
        top="0"
        left="0"
        zIndex={9}
        height="80"
        gradient={{
          display: true,
          opacity: 100,
          tilt: 180,
          height: 100,
          width: 100,
        }}
      />
      <Fade
        hide
        s={{ hide: false }}
        fillWidth
        position="fixed"
        bottom="0"
        left="0"
        zIndex={9}
        height="80"
        gradient={{
          display: true,
          opacity: 100,
          tilt: 0,
          height: 100,
          width: 100,
        }}
      />
      <HeaderPosition>
        <Row fillWidth vertical="center" horizontal="space-between">
          <Flex fillWidth horizontal="start" vertical="center" hide s={{ hide: false }}>
            {person.avatar && (
              <Row paddingLeft="12">
                <Avatar
                  size="m"
                  src={person.avatar}
                  value={person.name}
                />
              </Row>
            )}
          </Flex>
          <Row fillWidth horizontal="center">
            <Row
              background="surface"
              border="neutral-alpha-medium"
              radius="m border border-solid"
              shadow="s"
              padding="4"
              vertical="center"
            >
              {isTabVisible("/") && (
                <ToggleButton
                  prefixIcon="home"
                  href="/"
                  selected={pathname === "/"}
                />
              )}
              {isTabVisible("/about") && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="person"
                      href="/about"
                      label={about.label}
                      selected={pathname === "/about"}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="person"
                      href="/about"
                      selected={pathname === "/about"}
                    />
                  </Row>
                </>
              )}
              {isTabVisible("/work") && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="grid"
                      href="/work"
                      label={work.label}
                      selected={pathname.startsWith("/work")}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="grid"
                      href="/work"
                      selected={pathname.startsWith("/work")}
                    />
                  </Row>
                </>
              )}
              {isTabVisible("/blog") && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="book"
                      href="/blog"
                      label={blog.label}
                      selected={pathname.startsWith("/blog")}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="book"
                      href="/blog"
                      selected={pathname.startsWith("/blog")}
                    />
                  </Row>
                </>
              )}
              {isTabVisible("/gallery") && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="gallery"
                      href="/gallery"
                      label={gallery.label}
                      selected={pathname.startsWith("/gallery")}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="gallery"
                      href="/gallery"
                      selected={pathname.startsWith("/gallery")}
                    />
                  </Row>
                </>
              )}
              {isTabVisible("/videos") && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="video"
                      href="/videos"
                      label={videos.label}
                      selected={pathname.startsWith("/videos")}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="video"
                      href="/videos"
                      selected={pathname.startsWith("/videos")}
                    />
                  </Row>
                </>
              )}
              {isTabVisible("/freelance") && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="briefcase"
                      href="/freelance"
                      label="Freelance"
                      selected={pathname.startsWith("/freelance")}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="briefcase"
                      href="/freelance"
                      selected={pathname.startsWith("/freelance")}
                    />
                  </Row>
                </>
              )}
              {display.themeSwitcher && (
                <>
                  <Line background="neutral-alpha-medium" vert maxHeight="24" />
                  <ThemeToggle />
                </>
              )}
            </Row>
          </Row>
        </Row>
        <Flex fillWidth horizontal="end" vertical="center">
          <Flex
            paddingRight="12"
            horizontal="end"
            vertical="center"
            textVariant="body-default-s"
            gap="20"
          >
            <Flex s={{ hide: true }}>
              {/* {display.time && <TimeDisplay timeZone={person.location} />} */}
            </Flex>
          </Flex>
        </Flex>
      </Row>
    </>
  );
};
