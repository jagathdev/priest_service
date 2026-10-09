export async function checkAuthStatus(): Promise<{ is_user: boolean; user: any }> {
  if (typeof window !== "undefined") {
    const isUserLogin = document.cookie.includes("userLogin=true");
    if (isUserLogin) {
      return { is_user: true, user: {} };
    }
  }

  return { is_user: false, user: null };
}
