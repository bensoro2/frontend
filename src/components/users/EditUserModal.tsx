import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";

interface User {
  id: number;
  email: string;
  name: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  password?: string;
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EditUserModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    try {
      const response = await fetch(
        `https://school-web-c2oh.onrender.com/auth/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      if (result.success) {
        onClose();
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>แก้ไขผู้ใช้</ModalHeader>
          <ModalBody>
            <Input
              {...register("name")}
              label="ชื่อ"
              placeholder="กรอกชื่อ"
              defaultValue={user?.name}
            />
            <Input
              {...register("email", {
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              })}
              label="อีเมล"
              placeholder="กรอกอีเมล"
              defaultValue={user?.email}
              isInvalid={!!errors.email}
              errorMessage={errors.email && "กรุณากรอกอีเมลให้ถูกต้อง"}
            />
            <Input
              {...register("password")}
              label="รหัสผ่าน"
              type="password"
              placeholder="กรอกรหัสผ่านใหม่ (ไม่จำเป็น)"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              ยกเลิก
            </Button>
            <Button color="primary" type="submit">
              บันทึก
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
