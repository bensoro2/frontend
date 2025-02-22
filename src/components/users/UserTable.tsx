"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import EditUserModal from "@/components/users/EditUserModal";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";

interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://school-web-c2oh.onrender.com/auth/users",
        // "http://localhost:3001/auth/users",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDelete = async (id: number) => {
    setSelectedId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      const response = await fetch(
        `https://school-web-c2oh.onrender.com/auth/users/${selectedId}`,
        // `http://localhost:3001/auth/users/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setDeleteModalOpen(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <Table aria-label="ตารางผู้ใช้">
        <TableHeader>
          <TableColumn>ชื่อ</TableColumn>
          <TableColumn>อีเมล</TableColumn>
          <TableColumn>วันที่สร้าง</TableColumn>
          <TableColumn>จัดการ</TableColumn>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString("th-TH")}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    onPress={() => {
                      setSelectedUser(user);
                      onOpen();
                    }}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onPress={() => handleDelete(user.id)}
                  >
                    ลบ
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditUserModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="ยืนยันการลบผู้ใช้"
        message="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
      />
    </>
  );
}
