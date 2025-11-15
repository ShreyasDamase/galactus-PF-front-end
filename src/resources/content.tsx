import {
  About,
  Blog,
  Gallery,
  Home,
  Newsletter,
  Person,
  Social,
  Work,
} from "@/types";
import { Line, Logo, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Shreyas",
  lastName: "Damase",
  name: `Shreyas Damase`,
  role: "Software Developer",
  avatar: "/images/avatar.png",
  email: "shreyasdamase@gmail.com",
  location: "Asia/Kolkata",
  languages: ["English", "Hindi", "Marathi"],
};

const newsletter: Newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>Weekly insights about mobile development and engineering</>,
};

const social: Social = [
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/shreyasdamase",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/shreyasdamase",
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
  {
    name: "WhatsApp",
    icon: "phone",
    link: "https://wa.me/8600283155",
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a Software Developer`,
  headline: <>Building cross-platform mobile experiences</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Eulerian Square</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: "/work/eulerian-square-sudoku-game",
  },
  subline: (
    <>
      I'm Shreyas, a React Native developer at Boomm, where I craft intuitive
      <br /> mobile experiences. After hours, I build my own projects.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from Navi Mumbai, India`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: false,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        Shreyas is a Navi Mumbai-based React Native developer with a passion for
        building cross-platform mobile applications. His work focuses on
        creating intuitive, user-friendly experiences with clean, maintainable
        code and modern frontend best practices.
      </>
    ),
  },
  work: {
    display: true,
    title: "Work Experience",
    experiences: [
      {
        company: "Boomm",
        timeframe: "Sep 2025 - Present",
        role: "SDE-1 (Frontend Developer – React Native)",
        achievements: [
          <>
            Building and shipping new features for the Boomm mobile app (Android
            & iOS) using React Native, Expo, and TypeScript
          </>,
          <>
            Maintaining and optimizing app performance, improving
            responsiveness, and fixing production bugs
          </>,
          <>
            Writing clean, modular, strongly-typed code following modern
            frontend best practices
          </>,
          <>
            Integrating APIs, enhancing state management, and improving overall
            UX flows
          </>,
          <>
            Collaborating with the engineering team through PR reviews, pair
            programming, and daily Agile standups
          </>,
        ],
        images: [],
      },
      {
        company: "Boomm",
        timeframe: "Jul 2025 - Sep 2025",
        role: "Frontend Developer Intern",
        achievements: [
          <>
            Assisted in developing app features using React Native, Expo, and
            TypeScript
          </>,
          <>
            Supported UI fixes, minor bug resolutions, and small performance
            improvements
          </>,
          <>
            Helped with basic API integrations and introductory state-management
            tasks
          </>,
          <>Collaborated with senior developers in code reviews and standups</>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true,
    title: "Education",
    institutions: [
      {
        name: "Centre for Development of Advanced Computing ACTS (C-DAC)",
        description: (
          <>
            PG Diploma in Advanced Computing - Secured 71.63% (Jan 2024 - Apr
            2024)
          </>
        ),
      },
      {
        name: "DY Patil College of Engineering, Akurdi",
        description: (
          <>
            Bachelor of Engineering in Civil (Honours) - Secured 81.4% (Jan 2021
            - Jun 2023)
          </>
        ),
      },
    ],
  },
  technical: {
    display: true,
    title: "Technical Skills",
    skills: [
      {
        title: "React Native Development",
        description: (
          <>
            Building cross-platform mobile apps with React Native, Expo, and
            TypeScript.
          </>
        ),
        tags: [
          {
            name: "React Native",
            icon: "react",
          },
          {
            name: "TypeScript",
            icon: "typescript",
          },
          {
            name: "Expo",
            icon: "mobile",
          },
        ],
        images: [],
      },
      {
        title: "Frontend Technologies",
        description: (
          <>
            Proficient in React, Redux, Zustand, and modern state management
            solutions.
          </>
        ),
        tags: [
          {
            name: "React",
            icon: "react",
          },
          {
            name: "JavaScript",
            icon: "javascript",
          },
          {
            name: "Redux",
            icon: "code",
          },
        ],
        images: [],
      },
      {
        title: "Backend & Databases",
        description: (
          <>
            Building RESTful APIs with Node.js, Express, MongoDB, MySQL, and
            Firebase.
          </>
        ),
        tags: [
          {
            name: "Node.js",
            icon: "nodejs",
          },
          {
            name: "MongoDB",
            icon: "database",
          },
          {
            name: "Firebase",
            icon: "firebase",
          },
        ],
        images: [],
      },
      {
        title: "Android Development",
        description: (
          <>
            Learning Kotlin and Jetpack Compose for native Android development.
          </>
        ),
        tags: [
          {
            name: "Kotlin",
            icon: "android",
          },
          {
            name: "Android Studio",
            icon: "code",
          },
        ],
        images: [],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about mobile development and tech...",
  description: `Read what ${person.name} has been up to recently`,
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Mobile and web projects by ${person.name}`,
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  images: [
    {
      src: "/images/gallery/horizontal-1.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-4.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-3.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-1.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-2.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-2.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-4.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-3.jpg",
      alt: "image",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
