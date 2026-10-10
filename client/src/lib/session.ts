import { cookies } from "next/headers";

export const getSessionToken = async (): Promise<string | null> => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  try {
    const cookieStore = await cookies();
    return cookieStore.get("token")?.value || null;
  } catch {
    return null;
  }
};
