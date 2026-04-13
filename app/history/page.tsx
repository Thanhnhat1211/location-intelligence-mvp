import { Metadata } from "next";
import HistoryClient from "./history-client";

export const metadata: Metadata = {
  title: "Lịch sử phân tích - Location Intelligence",
  description: "Xem lại các phân tích địa điểm đã thực hiện",
};

export default function HistoryPage() {
  return <HistoryClient />;
}
