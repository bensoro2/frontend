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

interface Project {
  id: number;
  name: string;
  budget: number;
  department: string;
  department_group: DepartmentGroup;
  responsible: string;
  withdrawalAmount: number;
  remainingBudget: number;
  fiscalYearId: number;
  fiscalYear?: {
    id: number;
    year: string;
  };
  subsidy?: {
    id: number;
    type: string;
  };
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  budget: number;
  department: string;
  department_group: DepartmentGroup;
  responsible: string;
  fiscalYearId: number;
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

export default function EditProjectModal({
  isOpen,
  onClose,
  project,
  onSuccess,
}: EditProjectModalProps) {
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: project
      ? {
          name: project.name,
          budget: project.budget,
          department: project.department,
          department_group: project.department_group,
          responsible: project.responsible,
          fiscalYearId: project.fiscalYearId,
          subsidyId: project.subsidy?.id,
        }
      : undefined,
  });

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

  useEffect(() => {
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
          if (project?.subsidy) {
            const currentSubsidy = result.data.find(
              (s: Subsidy) => s.id === project.subsidy?.id
            );
            setSelectedSubsidy(currentSubsidy || null);
          }
        }
      } catch (error) {
        console.error("Error fetching subsidies:", error);
      }
    };

    fetchFiscalYears();
    fetchSubsidies();
  }, [project]);

  const onSubmit = async (data: FormData) => {
    if (!project || !selectedSubsidy) return;

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
        `https://school-web-c2oh.onrender.com/projects/${project.id}`,
        // `http://localhost:3001/projects/${project.id}`,
        {
          method: "PUT",
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
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton
      isDismissable={false}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>แก้ไขโครงการ</ModalHeader>
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
                defaultValue={project?.subsidy?.id}
                render={({ field }) => (
                  <Autocomplete
                    label="ประเภทเงิน"
                    placeholder="พิมพ์เพื่อค้นหาประเภทเงิน..."
                    defaultItems={subsidies}
                    selectedKey={field.value?.toString()}
                    defaultSelectedKey={project?.subsidy?.id?.toString()}
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
                defaultValue={project?.department_group}
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
                defaultValue={project?.name}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
              />

              <Controller
                name="responsible"
                control={control}
                defaultValue={
                  // หา id จาก name ที่มีอยู่
                  responsibles.find((r) => r.name === project?.responsible)?.id
                }
                rules={{ required: "กรุณาเลือกผู้รับผิดชอบ" }}
                render={({ field }) => (
                  <div className="flex gap-2">
                    <Autocomplete
                      className="flex-1"
                      label="ผู้รับผิดชอบ"
                      placeholder="พิมพ์เพื่อค้นหาผู้รับผิดชอบ..."
                      defaultItems={responsibles}
                      selectedKey={field.value}
                      defaultSelectedKey={
                        // หา id จาก name ที่มีอยู่
                        responsibles.find(
                          (r) => r.name === project?.responsible
                        )?.id
                      }
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
                {...register("budget", { required: "กรุณากรอกงบประมาณ" })}
                type="number"
                label="งบประมาณ"
                defaultValue={project?.budget.toString()}
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
