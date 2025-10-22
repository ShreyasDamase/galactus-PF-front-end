// src/lib/api/types.ts

// ====================
// USER PROFILE
// ====================
type SocialLink = { name: string; icon: string; link: string };

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  bio: string;
  profileImage: string;
  social: SocialLink[];
  resumeUrl: string;
  resume: Resume | null;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  preferences: UserPreferences;
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  hasImage: boolean;
}

// ====================
// RESUME
// ====================
export interface Resume {
  name: string;
  storedName: string;
  url: string;
  size: number;
  format: string;
  checksum: string;
  uploadedAt: string;
}

// ====================
// EXPERIENCE
// ====================
export interface Experience {
  _id?: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
  isCurrentJob: boolean;
  companyLogo?: string;
}

// ====================
// EDUCATION
// ====================
export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  gpa?: number;
  description?: string;
}

// ====================
// PROJECTS
// ====================
export interface Project {
  _id?: string;
  title: string;
  description?: string;
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  featured: boolean;
}

// ====================
// PREFERENCES
// ====================
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  profileVisibility: 'public' | 'private';
  showEmail: boolean; // determines if email is shown on public profile
}

// ====================
// UPDATE PAYLOAD
// ====================
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  leetcode?: string;
  portfolio?: string;
  skills?: string[];
  preferences?: Partial<UserPreferences>;
}

// ====================
// ANALYTICS
// ====================
export interface UserAnalytics {
  profileViews: number;
  projectClicks: number;
  resumeDownloads: number;
  lastUpdated: string;
}


// ============================================
// Blog store types
// ============================================

export interface BlogAuthor {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
}

export interface BlogPost {
  _id: string;
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  coverImage: string;
  tags: string[];
  category: string;
  readingTime: number;
  publishedAt: string;
  views: number;
  likes: number;
  author: BlogAuthor;
  wordCount?: number;
}

export interface PaginationMeta {
  current: number;
  total: number;
  count: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PostsListResponse {
  posts: BlogPost[];
  pagination: PaginationMeta;
}