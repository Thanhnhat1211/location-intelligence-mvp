import { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "Trang chủ - Location Intelligence",
  description: "Dashboard tổng quan phân tích địa điểm kinh doanh",
};

export default function HomePage() {
  return <HomeClient />;
}
