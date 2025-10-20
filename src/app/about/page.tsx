'use client';
import {
  Avatar,
  Button,
  Column,
  Heading,
  Icon,
  IconButton,
  Media,
  Tag,
  Text,
  Meta,
  Schema,
  Row,
} from "@once-ui-system/core";
import { baseURL, about, person, social } from "@/resources";
import TableOfContents from "@/components/about/TableOfContents";
import styles from "@/components/about/about.module.scss";
import React from "react";
import { useProfileStore } from '@/lib/store/useProfileStore';
import { useProfile } from '@/lib/hooks/useProfile';

  async function generateMetadata() {
  return Meta.generate({
    title: about.title,
    description: about.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
    path: about.path,
  });
}

export default function About() {
  const { data, isLoading, error } = useProfile();
  const profile = useProfileStore((state) => state.profile);
  const isComplete = useProfileStore((state) => state.isProfileComplete());
console.log('Profile from store:', profile);
  console.log('Data from hook:', data);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);
  
  const structure = [
    {
            title: `About ${profile?.firstName}` || data?.firstName,
id: 'intro',
      // title: about.intro.title,
      display: about.intro.display,
      items: [],
    },
    {
      id: 'work',
      title: about.work.title,
      display: about.work.display,
      items: about.work.experiences.map((experience) => experience.company),
    },
    {
      id: 'studies',
      title: about.studies.title,
      display: about.studies.display,
      items: about.studies.institutions.map((institution) => institution.name),
    },
    {
      id: 'technical',
      title: about.technical.title,
      display: about.technical.display,
      items: about.technical.skills.map((skill) => skill.title),
    },
  ];
  return (
    <Column maxWidth="m">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={about.title}
        description={about.description}
        path={about.path}
        image={`/api/og/generate?title=${encodeURIComponent(about.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      {about.tableOfContent.display && (
        <Column
          left="0"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          position="fixed"
          paddingLeft="24"
          gap="32"
          s={{ hide: true }}
        >
          <TableOfContents structure={structure} about={about} />
        </Column>
      )}
      <Row fillWidth s={{ direction: "column"}} horizontal="center">
        {profile?.profileImage && (
          <Column
            className={styles.avatar}
            top="64"
            fitHeight
            position="sticky"
            s={{ position: "relative", style: { top: "auto" } }}
            xs={{ style: { top: "auto" } }}
            minWidth="160"
            paddingX="l"
            paddingBottom="xl"
            gap="m"
            flex={3}
            horizontal="center"
          >
            <Avatar src={profile.profileImage || person.avatar} size="xl" />
            <Row gap="8" vertical="center">
              <Icon onBackground="accent-weak" name="globe" />
              {person.location}
            </Row>
            {person.languages && person.languages.length > 0 && (
              <Row wrap gap="8">
                {person.languages.map((language, index) => (
                  <Tag key={index} size="l">
                    {language}
                  </Tag>
                ))}
              </Row>
            )}
          </Column>
        )}
        <Column className={styles.blockAlign} flex={9} maxWidth={40}>
          <Column
            id={"intro"}
            fillWidth
            minHeight="160"
            vertical="center"
            marginBottom="32"
          >
            {about.calendar.display && (
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
                }}
              >
                <Icon paddingLeft="12" name="calendar" onBackground="brand-weak" />
                <Row paddingX="8">Schedule a call</Row>
                <IconButton
                  href={about.calendar.link}
                  data-border="rounded"
                  variant="secondary"
                  icon="chevronRight"
                />
              </Row>
            )}
            <Heading className={styles.textAlign} variant="display-strong-xl">
              {profile?.firstName} {" "}{profile?.lastName}
            </Heading>
            <Text
              className={styles.textAlign}
              variant="display-default-xs"
              onBackground="neutral-weak"
            >
              {person.role}
            </Text>
            {social.length > 0 && (
              <Row
                className={styles.blockAlign}
                paddingTop="20"
                paddingBottom="8"
                gap="8"
                wrap
                horizontal="center"
                fitWidth
                data-border="rounded"
              >
                {social.map(
                  (item) =>
                    item.link && (
                      <React.Fragment key={item.name}>
                        <Row s={{ hide: true }}>
                          <Button
                            key={item.name}
                            href={item.link}
                            prefixIcon={item.icon}
                            label={item.name}
                            size="s"
                            weight="default"
                            variant="secondary"
                          />
                        </Row>
                        <Row hide s={{ hide: false }}>
                          <IconButton
                            size="l"
                            key={`${item.name}-icon`}
                            href={item.link}
                            icon={item.icon}
                            variant="secondary"
                          />
                        </Row>
                      </React.Fragment>
                    ),
                )}
              </Row>
            )}
          </Column>

          {profile?.bio && (
            <Column textVariant="body-default-l" fillWidth gap="m" marginBottom="xl">
              {profile.bio}
            </Column>
          )}

          {about.work.display && (
            <>
              <Heading as="h2" id={"work"} variant="display-strong-s" marginBottom="m">
                {about.work.title}
              </Heading>
              <Column fillWidth gap="l" marginBottom="40">
              {about.work.display && profile?.experience && profile.experience.length > 0 && (
  <>
    <Heading as="h2" id={"work"} variant="display-strong-s" marginBottom="m">
      {about.work.title}
    </Heading>
    <Column fillWidth gap="l" marginBottom="40">
      {profile.experience.map((experience, index) => {
        const formatDate = (dateString: string | null | undefined) => {
          if (!dateString) return 'Present';
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        };

        const descriptionPoints = experience.description
          ? experience.description
              .split('\n')
              .filter((line: string) => line.trim().startsWith('-'))
              .map((line: string) => line.trim().substring(1).trim())
          : [];

        return (
          <Column key={`${experience.company}-${experience.position}-${index}`} fillWidth>
            <Row fillWidth horizontal="between" vertical="start" marginBottom="4" gap="12" wrap>
              <Row gap="12" vertical="center" flex={1}>
                {experience.companyLogo && (
                 <img
                    src={experience.companyLogo}
                    alt={`${experience.company} logo`}
                    style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }}
                  />
                )}
                <Column gap="4">
                  <Text id={experience.company} variant="heading-strong-l">
                    {experience.company}
                  </Text>
                  <Text variant="body-default-s" onBackground="brand-weak">
                    {experience.position}
                  </Text>
                </Column>
              </Row>
              <Column gap="4" horizontal="end" style={{ minWidth: 'fit-content' }}>
                <Text variant="heading-default-xs" onBackground="neutral-weak" style={{ whiteSpace: 'nowrap' }}>
                  {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                </Text>
                {experience.isCurrentJob && (
                  <Tag size="s" variant="success">Current</Tag>
                )}
              </Column>
            </Row>
            
            {experience.location && (
              <Row gap="8" vertical="center" marginBottom="m">
                <Icon name="mapPin" size="xs" onBackground="neutral-weak" />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {experience.location}
                </Text>
              </Row>
            )}

            {descriptionPoints.length > 0 && (
              <Column as="ul" gap="16" marginBottom="m">
                {descriptionPoints.map((point: string, idx: number) => (
                  <Text
                    as="li"
                    variant="body-default-m"
                    key={`${experience.company}-desc-${idx}`}
                  >
                    {point}
                  </Text>
                ))}
              </Column>
            )}

            {experience.technologies && experience.technologies.length > 0 && (
              <Row wrap gap="8" paddingTop="8">
                {experience.technologies.map((tech: string, techIndex: number) => (
                  <Tag key={`${experience.company}-tech-${techIndex}`} size="l">
                    {tech}
                  </Tag>
                ))}
              </Row>
            )}
          </Column>
        );
      })}
    </Column>
  </>
)}
              </Column>
            </>
          )}

          {about.studies.display && (
            <>
              <Heading as="h2" id={"studies"} variant="display-strong-s" marginBottom="m">
                {about.studies.title}
              </Heading>
              <Column fillWidth gap="l" marginBottom="40">
                {about.studies.institutions.map((institution, index) => (
                  <Column key={`${institution.name}-${index}`} fillWidth gap="4">
                    <Text id={institution.name} variant="heading-strong-l">
                      {institution.name}
                    </Text>
                    <Text variant="heading-default-xs" onBackground="neutral-weak">
                      {institution.description}
                    </Text>
                  </Column>
                ))}
              </Column>
            </>
          )}

          {about.technical.display && (
            <>
              <Heading
                as="h2"
                id={"technical"}
                variant="display-strong-s"
                marginBottom="40"
              >
                {about.technical.title}
              </Heading>
              <Column fillWidth gap="l">
                {about.technical.skills.map((skill, index) => (
                  <Column key={`${skill}-${index}`} fillWidth gap="4">
                    <Text id={skill.title} variant="heading-strong-l">
                      {skill.title}
                    </Text>
                    <Text variant="body-default-m" onBackground="neutral-weak">
                      {skill.description}
                    </Text>
                    {skill.tags && skill.tags.length > 0 && (
                      <Row wrap gap="8" paddingTop="8">
                        {skill.tags.map((tag, tagIndex) => (
                          <Tag key={`${skill.title}-${tagIndex}`} size="l" prefixIcon={tag.icon}>
                            {tag.name}
                          </Tag>
                        ))}
                      </Row>
                    )}
                    {skill.images && skill.images.length > 0 && (
                      <Row fillWidth paddingTop="m" gap="12" wrap>
                        {skill.images.map((image, index) => (
                          <Row
                            key={index}
                            border="neutral-medium"
                            radius="m"
                            minWidth={image.width}
                            height={image.height}
                          >
                            <Media
                              enlarge
                              radius="m"
                              sizes={image.width.toString()}
                              alt={image.alt}
                              src={image.src}
                            />
                          </Row>
                        ))}
                      </Row>
                    )}
                  </Column>
                ))}
              </Column>
            </>
          )}
        </Column>
      </Row>
    </Column>
  );
}