"use client";

import ProjectTable from "@/components/projects/ProjectTable";
import { useState } from "react";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">โครงการ</h1>
      <ProjectTable searchTerm={searchTerm} onSearch={setSearchTerm} />
    </div>
  );
}
