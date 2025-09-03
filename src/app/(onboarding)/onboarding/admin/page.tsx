import { redirect } from "next/navigation";

export default function AdminOnboardingPage() {
    // Admins don't need onboarding, redirect to admin dashboard
    redirect("/dashboard/admin");
}
