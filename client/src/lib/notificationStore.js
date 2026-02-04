import { create } from "zustand";
import apiRequest from "./apiRequest";

export const useNotificationStore = create((set) => ({
  number: 0,
  fetch: async () => {
    try {
      const res = await apiRequest("/users/notification");
      set({ number: res.data });
    } catch (error) {
      // 401 错误表示用户未登录或 token 无效，这是正常的，不需要记录错误
      if (error.response && error.response.status === 401) {
        set({ number: 0 });
        return;
      }
      // 其他错误才记录
      console.error("Error fetching notifications:", error);
      set({ number: 0 });
    }
  },
  decrease: () => {
    set((prev) => ({ number: Math.max(0, prev.number - 1) }));
  },
  reset: () => {
    set({ number: 0 });
  },
}));
