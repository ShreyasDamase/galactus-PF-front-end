import { useMutation } from "@tanstack/react-query";
import { profileApi } from "../api/endpoints";

export function useSendMail() {
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      message: string;
    }) => {
      const response = await profileApi.sendMail(payload);
      return response.data;
    },
    retry: 1,
  });
}
