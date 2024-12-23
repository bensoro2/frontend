"use client";
import FiscalYearTable from "@/components/fiscal-years/FiscalYearTable";
import { useState } from "react";

export default function FiscalYearsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ปีงบประมาณ</h1>
      <FiscalYearTable searchTerm={searchTerm} onSearch={setSearchTerm} />
    </div>
  );
}
