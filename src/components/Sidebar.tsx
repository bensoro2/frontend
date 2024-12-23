"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@nextui-org/react";

const menuItems = [
  {
    name: "ปีงบประมาณ",
    href: "/dashboard/fiscal-years",
    icon: "📅",
  },
  {
    name: "ประเภทเงิน",
    href: "/dashboard/subsidies",
    icon: "💰",
  },
  {
    name: "โครงการ",
    href: "/dashboard/projects",
    icon: "📋",
  },
  {
    name: "รายการหลัก",
    href: "/dashboard/transactions",
    icon: "📝",
  },
  {
    name: "จัดการผู้ใช้",
    href: "/dashboard/users",
    icon: "👥",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } h-screen bg-gray-100 dark:bg-gray-900 p-4 transition-all duration-300 ease-in-out relative`}
    >
      {/* ปุ่มซ่อน/แสดง Sidebar */}
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="absolute -right-3 top-6 z-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? "→" : "←"}
      </Button>

      <div className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "space-x-2"
            } p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 ${
              pathname === item.href
                ? "bg-gray-200 dark:bg-gray-800"
                : "text-gray-700 dark:text-gray-300"
            }`}
            title={isCollapsed ? item.name : ""}
          >
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
