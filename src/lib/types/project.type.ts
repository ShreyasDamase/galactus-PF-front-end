// types/project.types.ts

/**
 * Public Project Response (Sanitized)
 */
export interface ProjectResponse {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  documentDescription: string;
  
  status: 'draft' | 'active' | 'archived' | 'work-in-progress';
  visibility: 'public' | 'private' | 'unlisted';
  category: string;
  tags: string[];
  technologyStack: string[];
  
  // Media & Visuals
  coverImage: string;
  screenshots: Screenshot[];
  primaryImageIndex: number;
  diagrams: Diagram[];
  embeddedVideos: string[];
  
  // Files & Downloads (URLs are proxied)
  attachedFiles: AttachedFile[];
  downloadButtons: DownloadButton[];
  releases: Release[];
  
  // Documentation
  tableOfContents: TOCItem[];
  references: Reference[];
  glossary: GlossaryEntry[];
  faqs: FAQ[];
  
  // Milestones (sanitized - no tasks or linkedReleaseId)
  milestones: Milestone[];
  
  // Customization
  theme: ProjectTheme;
  pinnedFeatures: string[];
  featureList: string[];
  
  // Technical Details
  hardwareCompatibility: HardwareCompatibility[];
  performanceBenchmarks: PerformanceBenchmark[];
  
  // Engagement Metrics
  views: number;
  likes: number;
  downloads: number;
  
  // Contributors (optional, email removed)
  contributors?: Contributor[];
  
  // Timestamps
  publishedAt: string; // ISO 8601 date string
  createdAt: string;
  updatedAt: string;
}

/**
 * Screenshot
 */
export interface Screenshot {
  url: string;
  caption?: string;
  alt: string;
  size: number;
  format: string;
  uploadedAt: string;
}

/**
 * Diagram (Mermaid, Image, or Embed)
 */
export interface Diagram {
  name: string;
  type: 'mermaid' | 'image' | 'embed';
  content: string;
  description?: string;
}

/**
 * Attached File (URL is proxied)
 */
export interface AttachedFile {
  name: string;
  size: number;
  format: string;
  category: 'document' | 'firmware' | 'source' | 'asset' | 'other';
  description?: string;
  uploadedAt: string;
  downloadUrl: string; // Proxied: /api/public/download/:slug/file/:fileId
}

/**
 * Download Button
 */
export interface DownloadButton {
  label: string;
  icon?: string;
  version?: string;
  platform?: string;
  downloadCount: number;
  downloadUrl: string; // Proxied or external URL
}

/**
 * Release (with proxied artifact URLs)
 */
export interface Release {
  version: string;
  name?: string;
  changelog: string;
  releaseDate: string;
  downloadCount: number;
  isLatest: boolean;
  isPrerelease: boolean;
  artifacts: ReleaseArtifact[];
}

/**
 * Release Artifact (URL is proxied)
 */
export interface ReleaseArtifact {
  name: string;
  size: number;
  format: string;
  category: 'document' | 'firmware' | 'source' | 'asset' | 'other';
  description?: string;
  uploadedAt: string;
  downloadUrl: string; // Proxied: /api/public/download/:slug/artifact/:artifactId
}

/**
 * Table of Contents Item
 */
export interface TOCItem {
  title: string;
  level: number;
  anchor: string;
}

/**
 * Reference Link
 */
export interface Reference {
  title: string;
  url: string;
  type: 'repository' | 'documentation' | 'tutorial' | 'article' | 'other';
  description?: string;
}

/**
 * Glossary Entry
 */
export interface GlossaryEntry {
  term: string;
  definition: string;
}

/**
 * FAQ Entry
 */
export interface FAQ {
  question: string;
  answer: string;
  order: number;
}

/**
 * Milestone (sanitized - no internal references)
 */
export interface Milestone {
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
}

/**
 * Project Theme
 */
export interface ProjectTheme {
  primaryColor: string;
  accentColor: string;
  darkMode: boolean;
  customCSS?: string;
}

/**
 * Hardware Compatibility
 */
export interface HardwareCompatibility {
  device: string;
  compatible: boolean;
  notes?: string;
  version?: string;
}

/**
 * Performance Benchmark
 */
export interface PerformanceBenchmark {
  name: string;
  value: number;
  unit: string;
  conditions?: string;
  version: string;
}

/**
 * Contributor (email removed for privacy)
 */
export interface Contributor {
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  avatar?: string;
  joinedAt: string;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * Paginated Projects Response
 */
export interface PaginatedProjectsResponse {
  projects: ProjectResponse[];
  pagination: Pagination;
}

/**
 * Pagination
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Single Project API Response
 */
export type SingleProjectResponse = ApiResponse<ProjectResponse>;

/**
 * Multiple Projects API Response
 */
export type MultipleProjectsResponse = ApiResponse<PaginatedProjectsResponse>;

/**
 * Query Parameters for getAllPubProjects
 */
export interface PublicProjectsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string; // Comma-separated
  technologyStack?: string; // Comma-separated
  search?: string;
  sortBy?: 'publishedAt' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'title';
  sortOrder?: 'asc' | 'desc';
}