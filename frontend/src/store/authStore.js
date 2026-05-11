import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: ({ token, user }) =>
    set({
      token,
      user,
      isAuthenticated: Boolean(token)
    }),

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true
    }),

  logout: () =>
    set({
      token: null,
      user: null,
      isAuthenticated: false
    })
}));