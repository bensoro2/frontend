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

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(
        "https://school-web-c2oh.onrender.com/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        reset();
        onClose();
        // Refresh user list
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>เพิ่มผู้ใช้</ModalHeader>
          <ModalBody>
            <Input
              {...register("name", { required: true })}
              label="ชื่อ"
              placeholder="กรอกชื่อ"
              isInvalid={!!errors.name}
              errorMessage={errors.name && "กรุณากรอกชื่อ"}
            />
            <Input
              {...register("email", {
                required: true,
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              })}
              label="อีเมล"
              placeholder="กรอกอีเมล"
              isInvalid={!!errors.email}
              errorMessage={errors.email && "กรุณากรอกอีเมลให้ถูกต้อง"}
            />
            <Input
              {...register("password", { required: true, minLength: 6 })}
              label="รหัสผ่าน"
              type="password"
              placeholder="กรอกรหัสผ่าน"
              isInvalid={!!errors.password}
              errorMessage={
                errors.password && "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
              }
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
