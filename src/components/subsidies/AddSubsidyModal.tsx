"use client";
import React, { useEffect, useState } from "react";
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

interface AddSubsidyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  type: string;
  budget: number;
  fiscalYearId: number;
}

interface FiscalYear {
  id: number;
  year: string;
}

export default function AddSubsidyModal({
  isOpen,
  onClose,
  onSuccess,
}: AddSubsidyModalProps) {
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>();

  // เพิ่มฟังก์ชันดึงข้อมูลปีงบประมาณ
  const fetchFiscalYears = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://school-web-c2oh.onrender.com/fiscal-years",
        // "http://localhost:3001/fiscal-years",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch fiscal years");

      const data = await response.json();
      if (data.success) {
        setFiscalYears(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching fiscal years:", error);
    }
  };

  useEffect(() => {
    fetchFiscalYears();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://school-web-c2oh.onrender.com/subsidies",
        // "http://localhost:3001/subsidies",
        {
          method: "POST",
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
        reset();
        onSuccess();
        onClose();
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
      }
    } catch (error) {
      console.error("Error adding subsidy:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>เพิ่มประเภทเงิน</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Controller
                name="fiscalYearId"
                control={control}
                rules={{ required: "กรุณาเลือกปีงบประมาณ" }}
                render={({ field }) => (
                  <Select
                    label="ปีงบประมาณ"
                    isInvalid={!!errors.fiscalYearId}
                    errorMessage={errors.fiscalYearId?.message}
                    selectedKeys={field.value ? [field.value.toString()] : []}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    {fiscalYears.map((fiscalYear) => (
                      <SelectItem key={fiscalYear.id} value={fiscalYear.id}>
                        {fiscalYear.year}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Input
                {...register("type", {
                  required: "กรุณากรอกประเภทเงินอุดหนุน",
                })}
                label="เพิ่มประเภทเงิน"
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
