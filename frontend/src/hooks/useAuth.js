import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return {
    token,
    user,
    logout,
    isAuthenticated: Boolean(token)
  };
};