import { create } from "zustand";
import apiRequest from "./apiRequest";

export const useNotificationStore = create((set) => ({
  number: 0,
  fetch: async () => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      console.log('User not logged in');
      return;
    }
    try {
      const res = await apiRequest("/users/notification");
      set({ number: res.data });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },
  decrease: () => {
    set((prev) => ({ number: prev.number - 1 }));
  },
  reset: () => {
    set({ number: 0 });
  },
}));
