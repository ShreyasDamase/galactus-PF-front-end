// src/lib/api/endpoints.ts
"use client";

import { apiClient } from "./apiClient";
import { UserProfile } from "../types";

// Base path for user auth routes
const BASE_PATH = "/user-auth";

/**
 * Profile API endpoints
 * For now, only GET profile is implemented
 * Other endpoints will be added gradually
 */
export const profileApi = {
  /**
   * Fetch current user's profile
   * @returns Promise with user profile data
   */
  getProfile: () =>
    apiClient.post<UserProfile>(
      `${BASE_PATH}/public-profile`,

      {
        headers: {
          "x-user-id": process.env.NEXT_PUBLIC_USER_TO_FETCH,
        },
      }
    ),
};
