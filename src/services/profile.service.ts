export const profileService = {
  getProfile: async (id: string) => { return { id, name: "Revathi S." }; },
  updateProfile: async (id: string, data: any) => { return { success: true }; }
};
