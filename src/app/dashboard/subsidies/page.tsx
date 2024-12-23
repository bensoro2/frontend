"use client";

import SubsidyTable from "@/components/subsidies/SubsidyTable";
import { useState } from "react";

export default function SubsidiesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ประเภทเงิน</h1>
      <SubsidyTable searchTerm={searchTerm} onSearch={setSearchTerm} />
    </div>
  );
}
