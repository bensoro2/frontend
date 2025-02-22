"use client";
import React, { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";

interface Subsidy {
  id: number;
  type: string;
  budget: number;
  fiscalYearId: number;
  withdrawal: number;
  remainingBudget: number;
  fiscalYear: {
    id: number;
    year: string;
  };
}

interface EditSubsidyModalProps {
  isOpen: boolean;
  onClose: () => void;
  subsidy: Subsidy | null;
  onSuccess: () => void;
}

interface FormData {
  type: string;
  budget: number;
  fiscalYearId: number;
}

export default function EditSubsidyModal({
  isOpen,
  onClose,
  subsidy,
  onSuccess,
}: EditSubsidyModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    if (subsidy) {
      reset({
        type: subsidy.type,
        budget: subsidy.budget,
        fiscalYearId: subsidy.fiscalYearId,
      });
    }
  }, [subsidy, reset]);

  const onSubmit = async (data: FormData) => {
    if (!subsidy) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://school-web-c2oh.onrender.com/subsidies/${subsidy.id}`,
        // `http://localhost:3001/subsidies/${subsidy.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: data.type,
            budget: Number(data.budget),
            fiscalYearId: Number(data.fiscalYearId),
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      }
    } catch (error) {
      console.error("Error updating subsidy:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  if (!subsidy) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>แก้ไขเงินอุดหนุน</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Controller
                name="fiscalYearId"
                control={control}
                defaultValue={subsidy.fiscalYearId}
                rules={{ required: "กรุณาเลือกปีงบประมาณ" }}
                render={({ field }) => (
                  <Select
                    label="ปีงบประมาณ"
                    selectedKeys={[field.value.toString()]}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    isInvalid={!!errors.fiscalYearId}
                    errorMessage={errors.fiscalYearId?.message}
                  >
                    <SelectItem
                      key={subsidy.fiscalYear.id}
                      value={subsidy.fiscalYear.id}
                    >
                      {subsidy.fiscalYear.year}
                    </SelectItem>
                  </Select>
                )}
              />
              <Input
                {...register("type", {
                  required: "กรุณากรอกประเภทเงินอุดหนุน",
                })}
                label="ประเภทเงินอุดหนุน"
                defaultValue={subsidy.type}
                isInvalid={!!errors.type}
                errorMessage={errors.type?.message}
              />
              <Input
                {...register("budget", {
                  required: "กรุณากรอกจำนวนเงิน",
                  min: { value: 0, message: "จำนวนเงินต้องไม่ต่ำกว่า 0" },
                })}
                type="number"
                label="จำนวนเงิน"
                defaultValue={subsidy.budget.toString()}
                isInvalid={!!errors.budget}
                errorMessage={errors.budget?.message}
              />
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
