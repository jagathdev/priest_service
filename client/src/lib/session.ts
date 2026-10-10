export const getSessionToken = async (): Promise<string | null> => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};
