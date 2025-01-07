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

interface Project {
  id: number;
  name: string;
  budget: number;
  department: string;
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
          responsible: project.responsible,
          fiscalYearId: project.fiscalYearId,
          subsidyId: project.subsidy?.id,
        }
      : undefined,
  });

  const fetchFiscalYears = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/fiscal-years", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
        const response = await fetch("http://localhost:3001/subsidies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/projects/${project.id}`,
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
    <Modal isOpen={isOpen} onClose={onClose}>
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

              <Input
                {...register("name", { required: "กรุณากรอกชื่อโครงการ" })}
                label="ชื่อโครงการ"
                defaultValue={project?.name}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
              />

              <Input
                {...register("department", {
                  required: "กรุณากรอกชื่อหน่วยงาน",
                })}
                label="หน่วยงาน"
                defaultValue={project?.department}
                isInvalid={!!errors.department}
                errorMessage={errors.department?.message}
              />

              <Input
                {...register("responsible", {
                  required: "กรุณากรอกชื่อผู้รับผิดชอบ",
                })}
                label="ผู้รับผิดชอบ"
                defaultValue={project?.responsible}
                isInvalid={!!errors.responsible}
                errorMessage={errors.responsible?.message}
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
