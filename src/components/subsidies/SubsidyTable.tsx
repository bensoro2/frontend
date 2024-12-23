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
import { Search } from "lucide-react";
import AddSubsidyModal from "./AddSubsidyModal";
import EditSubsidyModal from "./EditSubsidyModal";
import TableWrapper from "@/components/common/TableWrapper";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";

interface Subsidy {
  id: number;
  type: string;
  budget: number;
  fiscalYearId: number;
  withdrawal: number;
  remainingBudget: number;
  createdAt: string;
  updatedAt: string;
  fiscalYear: {
    id: number;
    year: string;
    totalBudget: number;
    totalExpense: number;
    remainingBudget: number;
  };
}

interface SubsidyTableProps {
  searchTerm: string;
  onSearch: (value: string) => void;
}

export default function SubsidyTable({
  searchTerm,
  onSearch,
}: SubsidyTableProps) {
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null);
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

  const fetchSubsidies = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/subsidies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subsidies");
      }

      const data = await response.json();
      if (data.success) {
        setSubsidies(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching subsidies:", error);
    }
  };

  useEffect(() => {
    fetchSubsidies();
  }, []);

  const handleEdit = (subsidy: Subsidy) => {
    setSelectedSubsidy(subsidy);
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
        `http://localhost:3001/subsidies/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchSubsidies();
      }
    } catch (error) {
      console.error("Error deleting subsidy:", error);
    }
    setDeleteModalOpen(false);
  };

  const filteredData = subsidies.filter(
    (item) =>
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.budget.toString().includes(searchTerm) ||
      item.withdrawal.toString().includes(searchTerm) ||
      item.remainingBudget.toString().includes(searchTerm)
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="w-full sm:max-w-[400px]">
          <Input
            value={searchTerm}
            onValueChange={onSearch}
            placeholder="ค้นหาประเภทเงิน..."
            startContent={<Search className="text-default-400" size={20} />}
            radius="lg"
            classNames={{
              input: "text-sm",
            }}
          />
        </div>
        <Button color="primary" onPress={onAddOpen}>
          เพิ่มเงินอุดหนุน
        </Button>
      </div>

      <TableWrapper>
        <Table aria-label="ตารางเงินอุดหนุน" className="min-w-[1000px]">
          <TableHeader>
            <TableColumn>ชีงบประมาณ</TableColumn>
            <TableColumn>ประเภทเงินอุดหนุน</TableColumn>
            <TableColumn>งบประมาณ</TableColumn>
            <TableColumn>การเบิกจ่าย</TableColumn>
            <TableColumn>งบประมาณคงเหลือ</TableColumn>
            <TableColumn>วันที่สร้าง</TableColumn>
            <TableColumn>จัดการ</TableColumn>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((subsidy) => (
                <TableRow key={subsidy.id}>
                  <TableCell>{subsidy.fiscalYear.year}</TableCell>
                  <TableCell>{subsidy.type}</TableCell>
                  <TableCell>{subsidy.budget.toLocaleString()} บาท</TableCell>
                  <TableCell>
                    {subsidy.withdrawal.toLocaleString()} บาท
                  </TableCell>
                  <TableCell>
                    {subsidy.remainingBudget.toLocaleString()} บาท
                  </TableCell>
                  <TableCell>
                    {new Date(subsidy.createdAt).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => handleEdit(subsidy)}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onPress={() => handleDelete(subsidy.id)}
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
                <TableCell>ไม่พบข้อมูลเงินอุดหนุน</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableWrapper>

      <AddSubsidyModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        onSuccess={fetchSubsidies}
      />

      <EditSubsidyModal
        isOpen={isEditOpen}
        onClose={() => {
          onEditClose();
          setSelectedSubsidy(null);
        }}
        subsidy={selectedSubsidy}
        onSuccess={fetchSubsidies}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="ยืนยันการลบประเภทเงิน"
        message="คุณแน่ใจหรือไม่ที่จะลบประเภทเงินนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
      />
    </>
  );
}
