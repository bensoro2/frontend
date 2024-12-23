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

interface FiscalYear {
  id: number;
  year: string;
  totalBudget: number;
  totalExpense: number;
  remainingBudget: number;
}

interface EditFiscalYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  fiscalYear: FiscalYear | null;
  onSuccess: () => void;
}

export default function EditFiscalYearModal({
  isOpen,
  onClose,
  fiscalYear,
  onSuccess,
}: EditFiscalYearModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      year: fiscalYear?.year || "",
    },
  });

  const onSubmit = async (data: any) => {
    if (!fiscalYear) return;

    try {
      const response = await fetch(
        `http://localhost:3001/fiscal-years/${fiscalYear.id}`,
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
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error updating fiscal year:", error);
    }
  };

  if (!fiscalYear) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>แก้ไขปีงบประมาณ</ModalHeader>
          <ModalBody>
            <Input
              {...register("year", { required: true })}
              label="ปีงบประมาณ"
              placeholder="เช่น 2567"
              defaultValue={fiscalYear.year}
              isInvalid={!!errors.year}
              errorMessage={errors.year && "กรุณากรอกปีงบประมาณ"}
            />
            <div className="mt-4 space-y-2">
              <p>
                งบประมาณทั้งหมด: {fiscalYear.totalBudget.toLocaleString()} บาท
              </p>
              <p>
                ค่าใช้จ่ายทั้งหมด: {fiscalYear.totalExpense.toLocaleString()}{" "}
                บาท
              </p>
              <p>
                งบประมาณคงเหลือ: {fiscalYear.remainingBudget.toLocaleString()}{" "}
                บาท
              </p>
            </div>
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
