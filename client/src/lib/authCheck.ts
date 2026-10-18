export async function checkAuthStatus(): Promise<{ is_user: boolean; user: any }> {
  if (typeof window !== "undefined") {
    const isUserLoginCookie = /(?:^|;\s*)userLogin=true/.test(document.cookie);
    let token = localStorage.getItem("token");
    if (!token) {
      const match = document.cookie.match(/(?:^|;\s*)(?:token|adminToken)=([^;]+)/);
      if (match && match[1]) token = decodeURIComponent(match[1]);
    }

    let userData: any = null;
    try {
      const raw = localStorage.getItem("mockUser");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.id || parsed._id || parsed.mobileNumber || parsed.phone || parsed.name)) {
          userData = parsed;
        }
      }
    } catch {
      userData = null;
    }

    // A user is logged in if the cookie is set, or a valid user token or userData exists
    if (isUserLoginCookie || (userData && (userData.id || userData._id)) || (token && token !== "undefined" && token !== "null")) {
      // Ensure cookie is in sync if user was restored from localStorage
      if (!isUserLoginCookie) {
        const secureAttr = window.location.protocol === "https:" ? "; Secure; SameSite=Lax" : "; SameSite=Lax";
        document.cookie = `userLogin=true; path=/; max-age=604800${secureAttr}`;
      }
      return { is_user: true, user: userData || {} };
    }
  }

  return { is_user: false, user: null };
}
