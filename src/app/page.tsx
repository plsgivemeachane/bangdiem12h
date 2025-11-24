import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LandingPage from "@/components/layout/LandingPage";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect("/auth/signin");
  // }

  // redirect("/dashboard");

  return (
    <LandingPage />
  )
}
