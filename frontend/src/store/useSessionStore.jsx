import { create } from "zustand";

const useSessionStore = create((set) => ({
  sessionId: null,
  jobDescription: "",
  resume: "",
  setSession: ({ sessionId, jobDescription, resume }) =>
    set({ sessionId, jobDescription, resume }),
  clearSession: () => set({ sessionId: null, jobDescription: "", resume: "" }),
}));

export default useSessionStore;
