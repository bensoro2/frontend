"use client";

interface TableWrapperProps {
  children: React.ReactNode;
}

export default function TableWrapper({ children }: TableWrapperProps) {
  return (
    <div className="relative w-full">
      <div className="max-w-full">
        <div className="overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}
