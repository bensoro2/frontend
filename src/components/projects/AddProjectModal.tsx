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
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";
import { departmentGroups, DepartmentGroup } from "@/data/departments";
import { responsibles } from "@/data/responsibles";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  budget: number;
  status: string;
  startDate: string;
  endDate: string;
  fiscalYearId: number;
  department: string;
  department_group: DepartmentGroup;
  responsible: string;
  subsidyId: number;
}

interface FiscalYear {
  id: number;
  year: string;
}

interface Subsidy {
  id: number;
  type: string;
  budget: number;
  remainingBudget: number;
}

export default function AddProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProjectModalProps) {
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>();

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
      const result = await response.json();
      if (result.success) {
        setFiscalYears(result.data);
      }
    } catch (error) {
      console.error("Error fetching fiscal years:", error);
    }
  };

  const fetchSubsidies = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://school-web-c2oh.onrender.com/subsidies",
        // "http://localhost:3001/subsidies",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setSubsidies(result.data);
      }
    } catch (error) {
      console.error("Error fetching subsidies:", error);
    }
  };

  useEffect(() => {
    fetchFiscalYears();
    fetchSubsidies();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!selectedSubsidy) {
      alert("กรุณาเลือกรายการเงินอุดหนุน");
      return;
    }

    if (Number(data.budget) > selectedSubsidy.remainingBudget) {
      alert(
        `งบประมาณที่ขอเกินกว่างบประมาณคงเหลือ (${selectedSubsidy.remainingBudget.toLocaleString()} บาท)`
      );
      return;
    }

    // หา responsible name จาก id
    const selectedResponsible = responsibles.find(
      (r) => r.id === data.responsible
    );
    if (!selectedResponsible) {
      alert("ไม่พบข้อมูลผู้รับผิดชอบ");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://school-web-c2oh.onrender.com/projects",
        // "http://localhost:3001/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...data,
            budget: Number(data.budget),
            fiscalYearId: Number(data.fiscalYearId),
            subsidyId: selectedSubsidy.id,
            department: departmentGroups[data.department_group],
            responsible: selectedResponsible.name, // ส่ง name แทน id
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        reset();
        onSuccess();
        onClose();
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการเพิ่มโครงการ");
      }
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton
      isDismissable={false}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>เพิ่มโครงการ</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Controller
                name="fiscalYearId"
                control={control}
                rules={{ required: "กรุณาเลือกปีงบประมาณ" }}
                render={({ field }) => (
                  <Select
                    label="ปีงบประมาณ"
                    selectedKeys={field.value ? [field.value.toString()] : []}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    isInvalid={!!errors.fiscalYearId}
                    errorMessage={errors.fiscalYearId?.message}
                    selectionMode="single"
                  >
                    {fiscalYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="subsidyId"
                control={control}
                rules={{ required: "กรุณาเลือกประเภทเงิน" }}
                render={({ field }) => (
                  <Autocomplete
                    label="ประเภทเงิน"
                    placeholder="พิมพ์เพื่อค้นหาประเภทเงิน..."
                    defaultItems={subsidies}
                    selectedKey={field.value?.toString()}
                    onSelectionChange={(key) => {
                      const value = Number(key);
                      field.onChange(value);
                      const subsidy = subsidies.find((s) => s.id === value);
                      setSelectedSubsidy(subsidy || null);
                    }}
                    errorMessage={errors.subsidyId?.message}
                  >
                    {(subsidy) => (
                      <AutocompleteItem
                        key={subsidy.id}
                        textValue={subsidy.type}
                      >
                        <div className="flex flex-col">
                          <span>{subsidy.type}</span>
                          <span className="text-small text-default-400">
                            งบประมาณคงเหลือ:{" "}
                            {subsidy.remainingBudget.toLocaleString()} บาท
                          </span>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                )}
              />

              <Controller
                name="department_group"
                control={control}
                rules={{ required: "กรุณาเลือกกลุ่มงาน/กลุ่มสาระ" }}
                render={({ field }) => (
                  <Select
                    label="กลุ่มงาน/กลุ่มสาระ"
                    selectedKeys={field.value ? [field.value] : []}
                    onChange={(e) => field.onChange(e.target.value)}
                    isInvalid={!!errors.department_group}
                    errorMessage={errors.department_group?.message}
                  >
                    {Object.entries(departmentGroups).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Input
                {...register("name", { required: "กรุณากรอกชื่อโครงการ" })}
                label="ชื่อโครงการ"
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
              />

              <Controller
                name="responsible"
                control={control}
                rules={{ required: "กรุณาเลือกผู้รับผิดชอบ" }}
                render={({ field }) => (
                  <div className="flex gap-2">
                    <Autocomplete
                      className="flex-1"
                      label="ผู้รับผิดชอบ"
                      placeholder="พิมพ์เพื่อค้นหาผู้รับผิดชอบ..."
                      defaultItems={responsibles}
                      selectedKey={field.value}
                      onSelectionChange={(key) => {
                        const selected = responsibles.find((r) => r.id === key);
                        if (selected) {
                          field.onChange(selected.id);
                        }
                      }}
                      isInvalid={!!errors.responsible}
                      errorMessage={errors.responsible?.message}
                    >
                      {(item) => (
                        <AutocompleteItem key={item.id} textValue={item.name}>
                          {item.name}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                    <Button
                      type="button"
                      variant="flat"
                      onPress={() => {
                        const selected = responsibles.find(
                          (r) => r.id === field.value
                        );
                        if (selected) {
                          const name = selected.name;
                          if (name.includes("และคณะ")) {
                            field.onChange(
                              responsibles.find(
                                (r) => r.name === name.replace(" และคณะ", "")
                              )?.id
                            );
                          } else {
                            field.onChange(
                              responsibles.find(
                                (r) => r.name === name + " และคณะ"
                              )?.id
                            );
                          }
                        }
                      }}
                    >
                      และคณะ
                    </Button>
                  </div>
                )}
              />

              <Input
                {...register("budget", {
                  required: "กรุณากรอกงบประมาณ",
                  min: { value: 0, message: "งบประมาณต้องไม่ต่ำกว่า 0" },
                  validate: (value) => {
                    if (!selectedSubsidy) return true;
                    return (
                      Number(value) <= selectedSubsidy.remainingBudget ||
                      "งบประมาณเกินกว่างบประมาณที่คงเหลือ"
                    );
                  },
                })}
                type="number"
                label="งบประมาณ"
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
