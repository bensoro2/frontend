"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import { Search, Download } from "lucide-react";
import AddProjectModal from "./AddProjectModal";
import EditProjectModal from "./EditProjectModal";
import TableWrapper from "@/components/common/TableWrapper";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";
import { exportToPDF } from "../utils/exportPDF";
import { DepartmentGroup } from "@/data/departments";

interface Project {
  id: number;
  name: string;
  budget: number;
  department: string;
  department_group: DepartmentGroup;
  responsible: string;
  withdrawalAmount: number;
  remainingBudget: number;
  status: string;
  startDate: string;
  endDate: string;
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

interface ProjectTableProps {
  searchTerm: string;
  onSearch: (value: string) => void;
}

export default function ProjectTable({
  searchTerm,
  onSearch,
}: ProjectTableProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://school-web-c2oh.onrender.com/projects",
        // "http://localhost:3001/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    onEditOpen();
  };

  const handleDelete = async (id: number) => {
    setSelectedId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://school-web-c2oh.onrender.com/projects/${selectedId}`,
        // `http://localhost:3001/projects/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setProjects(projects.filter((project) => project.id !== selectedId));
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
    setDeleteModalOpen(false);
  };

  const handleExportPDF = () => {
    const dataToExport = searchTerm
      ? projects.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.budget.toString().includes(searchTerm) ||
            item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.remainingBudget.toString().includes(searchTerm)
        )
      : projects;

    exportToPDF({
      title: "รายงานโครงการ",
      filename: "projects-report",
      headers: [
        "ปีงบประมาณ",
        "ชื่อโครงการ",
        "งบประมาณ",
        "กลุ่มงาน",
        "ผู้รับผิดชอบ",
        "ประเภทเงิน",
        "การเบิกจ่าย",
        "งบประมาณคงเหลือ",
      ],
      data: dataToExport,
      mapping: (item) => {
        return [
          item.fiscalYear?.year || "-",
          item.name || "-",
          (item.budget || 0).toLocaleString() + " บาท",
          item.department || "-",
          item.responsible || "-",
          item.subsidy?.type || "-",
          (item.withdrawalAmount || 0).toLocaleString() + " บาท",
          (item.remainingBudget || 0).toLocaleString() + " บาท",
        ];
      },
      columnWidths: [
        "10%", // ปีงบประมาณ
        "20%", // ชื่อโครงการ
        "10%", // งบประมาณ
        "15%", // กลุ่มงาน
        "15%", // ผู้รับผิดชอบ
        "10%", // ประเภทเงิน
        "10%", // การเบิกจ่าย
        "10%", // งบประมาณคงเหลือ
      ],
      styles: {
        fontSize: 12,
        alignment: "center",
      },
      pageOrientation: "landscape",
    });
  };

  const filteredData = projects.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.budget.toString().includes(searchTerm) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.remainingBudget.toString().includes(searchTerm)
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="w-full sm:max-w-[400px]">
          <Input
            value={searchTerm}
            onValueChange={onSearch}
            placeholder="ค้นหาโครงการ..."
            startContent={<Search className="text-default-400" size={20} />}
            radius="lg"
            classNames={{
              input: "text-sm",
            }}
          />
        </div>
        <div className="flex items-center gap-4">
          <Button
            color="primary"
            variant="flat"
            onPress={handleExportPDF}
            startContent={<Download size={20} />}
          >
            Export PDF
          </Button>
          <Button color="primary" onPress={onAddOpen}>
            เพิ่มโครงการ
          </Button>
        </div>
      </div>

      <TableWrapper>
        <Table aria-label="ตารางโครงการ" className="min-w-[1200px]">
          <TableHeader>
            <TableColumn>ปีงบประมาณ</TableColumn>
            <TableColumn>ชื่อโครงการ</TableColumn>
            <TableColumn>กลุ่มงาน/กลุ่มสาระ</TableColumn>
            <TableColumn>ผู้รับผิดชอบ</TableColumn>
            <TableColumn>ประเภทเงิน</TableColumn>
            <TableColumn>งบประมาณ</TableColumn>
            <TableColumn>เบิกจ่าย</TableColumn>
            <TableColumn>คงเหลือ</TableColumn>
            <TableColumn>จัดการ</TableColumn>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.fiscalYear?.year || "-"}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.department}</TableCell>
                  <TableCell>{project.responsible}</TableCell>
                  <TableCell>{project.subsidy?.type || "-"}</TableCell>
                  <TableCell>{project.budget.toLocaleString()} บาท</TableCell>
                  <TableCell>
                    {project.withdrawalAmount.toLocaleString()} บาท
                  </TableCell>
                  <TableCell>
                    {project.remainingBudget.toLocaleString()} บาท
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => handleEdit(project)}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onPress={() => handleDelete(project.id)}
                      >
                        ลบ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>ไม่พบข้อมูลโครงการ</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableWrapper>

      <AddProjectModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        onSuccess={async () => {
          await fetchProjects();
          onAddClose();
        }}
      />

      <EditProjectModal
        isOpen={isEditOpen}
        onClose={() => {
          onEditClose();
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSuccess={async () => {
          await fetchProjects();
          onEditClose();
          setSelectedProject(null);
        }}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="ยืนยันการลบโครงการ"
        message="คุณแน่ใจหรือไม่ที่จะลบโครงการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
      />
    </>
  );
}
