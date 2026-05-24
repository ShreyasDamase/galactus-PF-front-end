// src/lib/api/freelance.api.ts
import { apiClient } from "./apiClient";

export interface SubmitInquiryPayload {
  name: string;
  email: string;
  company?: string;
  projectType?: string;
  budget: number;
  currency: string;
  description: string;
}

export const freelanceApi = {
  /**
   * Submit a new freelance project inquiry
   * @param username Target freelancer username
   * @param payload Proposal payload details
   */
  submitInquiry: (username: string, payload: SubmitInquiryPayload) => {
    return apiClient.post(`/freelance/inquire/${username}`, payload);
  },
};
