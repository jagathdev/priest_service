export async function checkAuthStatus(): Promise<{ is_user: boolean; user: any }> {
  if (typeof window !== "undefined") {
    const isUserLoginCookie = /(?:^|;\s*)userLogin=true/.test(document.cookie);
    const token = localStorage.getItem("token");

    let userData: any = null;
    try {
      const raw = localStorage.getItem("mockUser");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.id || parsed._id || parsed.mobileNumber || parsed.phone)) {
          userData = parsed;
        }
      }
    } catch {
      userData = null;
    }

    if (isUserLoginCookie && (userData || token)) {
      return { is_user: true, user: userData || {} };
    }
  }

  return { is_user: false, user: null };
}
