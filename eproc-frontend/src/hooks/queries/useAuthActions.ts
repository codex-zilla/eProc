import { useMutation } from "@tanstack/react-query";
import { useErrorHandler } from "../useErrorHandler";
import api from "@/lib/axios";

export const useForgotPassword = () => {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (email: string) => api.post('/auth/forgot-password', { email }),
    onError: (error) => handleError(error, "Failed to send reset email"),
  });
};
