import { Suspense } from "react";
import { Metadata } from "next";
import AnalyzeClient from "./analyze-client";

export const metadata: Metadata = {
  title: "Phân tích địa điểm - Location Intelligence",
  description: "Phân tích chi tiết địa điểm kinh doanh với AI",
};

export default function AnalyzePage() {
  return (
    <Suspense>
      <AnalyzeClient />
    </Suspense>
  );
}
