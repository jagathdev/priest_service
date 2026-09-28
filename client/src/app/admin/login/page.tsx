import { redirect } from "next/navigation";

// Admin login should use the same UI as the user login page.
// This route simply forwards the admin to the shared login form.
export default function AdminLoginPage() {
  redirect("/auth/login?role=admin");
}
