export async function checkAuthStatus(): Promise<{ is_user: boolean; user: any }> {
  if (typeof window !== "undefined") {
    // Check multiple storage mechanisms to ensure logged in users are never re-prompted
    const hasUserLoginCookie = document.cookie.includes("userLogin=true");
    const hasTokenCookie = /(?:^|;\s*)token=([^;]+)/.test(document.cookie);
    const localToken = localStorage.getItem("token");
    const localUserStr = localStorage.getItem("mockUser");

    const hasValidToken = Boolean(
      (localToken && localToken.trim() !== "" && localToken !== "null" && localToken !== "undefined") ||
      hasTokenCookie
    );

    if (hasUserLoginCookie || hasValidToken) {
      let parsedUser = {};
      if (localUserStr) {
        try {
          parsedUser = JSON.parse(localUserStr);
        } catch {
          // ignore parsing error
        }
      }
      return { is_user: true, user: parsedUser };
    }
  }

  return { is_user: false, user: null };
}

