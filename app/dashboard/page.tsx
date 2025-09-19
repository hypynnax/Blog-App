import { Metadata } from "next";
import DashboardPage from "@/components/Pages/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Kişisel blog dashboard'unuz. Yazılarınızı yönetin ve istatistiklerinizi görün.",
  robots: "noindex, nofollow",
};

export default function Dashboard() {
  return <DashboardPage />;
}
