export async function checkAuthStatus(): Promise<{ is_user: boolean; user: any }> {
  // API call removed per user request
  /*
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000"}/api/auth/me`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.is_user === true || data.authenticated === true)) {
        return { is_user: true, user: data.user };
      }
    }
  } catch {
    // Ignore fetch errors
  }
  */

  if (typeof window !== "undefined") {
    const isUserLogin = document.cookie.includes("userLogin=true");
    if (isUserLogin) {
      return { is_user: true, user: {} };
    }
  }

  return { is_user: false, user: null };
}
