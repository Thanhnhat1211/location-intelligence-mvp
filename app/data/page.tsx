import { Metadata } from "next";
import DataClient from "./data-client";

export const metadata: Metadata = {
  title: "Quản lý Dataset - Location Intelligence",
  description: "Upload và quản lý dữ liệu comparable properties",
};

export default function DataPage() {
  return <DataClient />;
}
