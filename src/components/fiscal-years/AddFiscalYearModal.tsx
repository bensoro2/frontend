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

interface AddFiscalYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddFiscalYearModal({
  isOpen,
  onClose,
  onSuccess,
}: AddFiscalYearModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    try {
      // ดึง token จาก localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch("http://localhost:3001/fiscal-years", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // เพิ่ม Bearer token
        },
        body: JSON.stringify({
          year: data.year,
          totalBudget: 0, // เพิ่มค่าเริ่มต้น
          totalExpense: 0,
          remainingBudget: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        reset();
        onSuccess();
        window.location.reload();
      } else {
        console.error("Failed to create fiscal year:", result.error);
        alert(result.error || "เกิดข้อผิดพลาดในการเพิ่มปีงบประมาณ");
      }
    } catch (error) {
      console.error("Error creating fiscal year:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มปีงบประมาณ");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>เพิ่มปีงบประมาณ</ModalHeader>
          <ModalBody>
            <Input
              {...register("year", {
                required: "กรุณากรอกปีงบประมาณ",
                pattern: {
                  value: /^[0-9]{4}$/,
                  message: "กรุณากรอกปีเป็นตัวเลข 4 หลัก",
                },
              })}
              label="ปีงบประมาณ"
              placeholder="เช่น 2567"
              isInvalid={!!errors.year}
              errorMessage={errors.year?.message?.toString()}
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
