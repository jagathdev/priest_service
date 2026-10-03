import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Admin login should use the same UI as the user login page.
// This route simply forwards the admin to the shared login form.
export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("adminToken")) {
      // We can't easily clear cookies in a server component without a route handler or response,
      // but the middleware could handle it. Let's just redirect.
  }
  redirect("/auth/login?role=admin");
}
