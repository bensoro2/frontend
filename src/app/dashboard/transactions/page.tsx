"use client";

import TransactionTable from "@/components/transactions/TransactionTable";
import { useState } from "react";

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">รายการหลัก</h1>
      <TransactionTable searchTerm={searchTerm} onSearch={setSearchTerm} />
    </div>
  );
}
