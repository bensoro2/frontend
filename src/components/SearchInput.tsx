"use client";

import { Input } from "@nextui-org/react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
}: SearchInputProps) {
  return (
    <div className="w-full sm:max-w-[44%]">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "ค้นหา..."}
        startContent={<Search className="text-default-400" size={20} />}
        size="sm"
      />
    </div>
  );
}
