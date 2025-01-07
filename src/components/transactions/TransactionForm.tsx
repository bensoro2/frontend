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
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";

interface Project {
  id: number;
  name: string;
  budget: number;
  remainingBudget: number;
}

interface Transaction {
  id?: number;
  title: string;
  date: string;
  amount: number;
  duration: string;
  note?: string;
  projectId?: number;
  project?: Project;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  onSuccess: () => void;
}

export default function TransactionForm({
  isOpen,
  onClose,
  transaction,
  onSuccess,
}: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue,
  } = useForm<Transaction>();

  // ดึงข้อมูลโครงการทั้งหมด
  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:3001/projects", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ:", error);
    }
  };

  // เซ็ตค่าเริ่มต้นเมื่อเปิด Modal
  useEffect(() => {
    fetchProjects();
    if (transaction) {
      // กำหนดค่าเริ่มต้นสำหรับทุกฟิลด์
      setValue("title", transaction.title);
      setValue("date", new Date(transaction.date).toISOString().split("T")[0]);
      setValue("amount", transaction.amount);
      setValue("duration", transaction.duration);
      setValue("note", transaction.note || "");
      setValue("projectId", transaction.projectId);

      // Set selected project
      if (transaction.project) {
        setSelectedProject(transaction.project);
      }
    } else {
      // รีเซ็ตฟอร์มเมื่อเพิ่มใหม่
      reset({
        title: "",
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        duration: "",
        note: "",
        projectId: undefined,
      });
      setSelectedProject(null);
    }
  }, [transaction, setValue, reset]);

  const onSubmit = async (data: Transaction) => {
    try {
      if (!selectedProject) {
        throw new Error("กรุณาเลือกโครงการ");
      }

      if (Number(data.amount) > selectedProject.remainingBudget) {
        throw new Error(
          `จำนวนเงินเกินงบประมาณคงเหลือ (${selectedProject.remainingBudget.toLocaleString()} บาท)`
        );
      }

      const url = transaction
        ? `http://localhost:3001/transactions/${transaction.id}`
        : "http://localhost:3001/transactions";

      const response = await fetch(url, {
        method: transaction ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
        reset();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล:", error);
      alert(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            {transaction ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Controller
              name="projectId"
              control={control}
              rules={{ required: "กรุณาเลือกโครงการ" }}
              defaultValue={transaction?.projectId}
              render={({ field }) => (
                <Autocomplete
                  label="โครงการ"
                  placeholder="พิมพ์เพื่อค้นหาโครงการ..."
                  defaultItems={projects}
                  selectedKey={field.value?.toString()}
                  defaultSelectedKey={transaction?.project?.id?.toString()}
                  onSelectionChange={(key) => {
                    const value = Number(key);
                    field.onChange(value);
                    const project = projects.find((p) => p.id === value);
                    setSelectedProject(project || null);
                  }}
                  errorMessage={errors.projectId?.message}
                >
                  {(project) => (
                    <AutocompleteItem key={project.id} textValue={project.name}>
                      <div className="flex flex-col">
                        <span>{project.name}</span>
                        <span className="text-small text-default-400">
                          งบประมาณคงเหลือ:{" "}
                          {project.remainingBudget.toLocaleString()} บาท
                        </span>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}
            />
            <Input
              label="ชื่อรายการ"
              {...register("title", { required: "กรุณากรอกชื่อรายการ" })}
              errorMessage={errors.title?.message}
            />
            <Input
              type="date"
              label="วันที่"
              {...register("date", { required: "กรุณาเลือกวันที่" })}
              errorMessage={errors.date?.message}
            />
            <Input
              type="number"
              label="จำนวนเงิน"
              {...register("amount", {
                required: "กรุณากรอกจำนวนเงิน",
                min: { value: 0, message: "จำนวนเงินต้องมากกว่า 0" },
              })}
              errorMessage={errors.amount?.message}
            />
            <Input
              label="ระยะเวลา"
              {...register("duration", { required: "กรุณากรอกระยะเวลา" })}
              errorMessage={errors.duration?.message}
            />
            <Textarea label="หมายเหตุ" {...register("note")} />
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
