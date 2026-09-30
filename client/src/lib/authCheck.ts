export async function checkAuthStatus(): Promise<{ is_user: boolean; user: any }> {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      if (data && (data.is_user === true || data.authenticated === true)) {
        return { is_user: true, user: data.user };
      }
    }
  } catch {
    // Ignore fetch errors
  }

  if (typeof window !== "undefined") {
    const mockUserStr = localStorage.getItem("mockUser");
    if (mockUserStr) {
      try {
        const parsed = JSON.parse(mockUserStr);
        if (parsed) {
          return { is_user: true, user: parsed };
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
  }

  return { is_user: false, user: null };
}
