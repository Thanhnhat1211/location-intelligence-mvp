import { Metadata } from "next";
import SettingsClient from "./settings-client";

export const metadata: Metadata = {
  title: "Cấu hình - Location Intelligence",
  description: "Quản lý API keys, model và trọng số phân tích",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
