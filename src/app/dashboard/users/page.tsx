"use client";
import UserTable from "@/components/users/UserTable";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import AddUserModal from "@/components/users/AddUserModal";

export default function UsersPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">จัดการผู้ใช้</h1>
        <Button color="primary" onPress={() => setIsOpen(true)}>
          เพิ่มผู้ใช้
        </Button>
      </div>

      <UserTable />

      <AddUserModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
