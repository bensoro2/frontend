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
  Tooltip,
  Pagination,
  Input,
} from "@nextui-org/react";
import { Edit2, Trash2, Search } from "lucide-react";
import { formatDate, formatNumber } from "../utils/format";
import TransactionForm from "./TransactionForm";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";
import TableWrapper from "@/components/common/TableWrapper";

interface Project {
  id: number;
  name: string;
  budget: number;
  remainingBudget: number;
}

interface Transaction {
  id: number;
  title: string;
  date: string;
  amount: number;
  duration: string;
  note?: string;
  projectId?: number;
  project?: Project;
}

interface TransactionTableProps {
  searchTerm: string;
  onSearch: (value: string) => void;
}

export default function TransactionTable({
  searchTerm,
  onSearch,
}: TransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteModal = useDisclosure();
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        "https://school-web-c2oh.onrender.com/transactions",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดาวงข้อมูล:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `https://school-web-c2oh.onrender.com/transactions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchTransactions();
        deleteModal.onClose();
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error);
    }
  };

  const pages = Math.ceil(transactions.length / rowsPerPage);

  const filteredData = transactions.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.amount.toString().includes(searchTerm) ||
      item.duration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="w-full sm:max-w-[400px]">
          <Input
            value={searchTerm}
            onValueChange={onSearch}
            placeholder="ค้นหารายการ..."
            startContent={<Search className="text-default-400" size={20} />}
            radius="lg"
            classNames={{
              input: "text-sm",
            }}
          />
        </div>
        <Button
          color="primary"
          onPress={() => {
            setSelectedTransaction(null);
            onOpen();
          }}
        >
          เพิ่มรายการใหม่
        </Button>
      </div>

      <TableWrapper>
        <Table aria-label="รายการทั้งหมด" className="min-w-[1000px]">
          <TableHeader>
            <TableColumn>ชื่อรายการ</TableColumn>
            <TableColumn>วันที่</TableColumn>
            <TableColumn>จำนวนเงิน</TableColumn>
            <TableColumn>ระยะเวลา</TableColumn>
            <TableColumn>โครงการ</TableColumn>
            <TableColumn>หมายเหตุ</TableColumn>
            <TableColumn>จัดการ</TableColumn>
          </TableHeader>
          <TableBody>
            {filteredData.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.title}</TableCell>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{formatNumber(transaction.amount)}</TableCell>
                <TableCell>{transaction.duration}</TableCell>
                <TableCell>{transaction.project?.name || "-"}</TableCell>
                <TableCell>{transaction.note || "-"}</TableCell>
                <TableCell className="flex gap-2">
                  <Tooltip content="แก้ไข">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => {
                        setSelectedTransaction(transaction);
                        onOpen();
                      }}
                    >
                      <Edit2 size={16} />
                    </Button>
                  </Tooltip>
                  <Tooltip content="ลบ" color="danger">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => {
                        setSelectedTransaction(transaction);
                        deleteModal.onOpen();
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>

      <div className="flex justify-center">
        <Pagination total={pages} page={page} onChange={setPage} />
      </div>

      <TransactionForm
        isOpen={isOpen}
        onClose={onClose}
        transaction={selectedTransaction}
        onSuccess={() => {
          fetchTransactions();
          onClose();
        }}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onConfirm={() =>
          selectedTransaction && handleDelete(selectedTransaction.id)
        }
        title="ยืนยันการลบรายการ"
        message="คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
      />
    </div>
  );
}
