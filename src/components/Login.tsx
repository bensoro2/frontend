"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Image,
} from "@nextui-org/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Lock, Mail, CheckCircle2, XCircle } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userName, setUserName] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        Cookies.set("token", data.token);
        localStorage.setItem("token", data.token);

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUserName(data.user.name);
        }

        setShowSuccessModal(true);
      } else {
        setErrorMessage(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace("/dashboard");
  };

  return (
    <>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-col gap-3 items-center pt-8 pb-0">
          <Image
            src="https://www.stw.ac.th/wp-content/uploads/2016/12/cropped-1091560167.jpg"
            alt="Logo"
            width={100}
            height={100}
            className="rounded-full"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">เข้าสู่ระบบ</h1>
            <p className="text-sm text-default-500 mt-1">
              ระบบบริหารงบประมาณโรงเรียนสตูลวิทยา
            </p>
          </div>
        </CardHeader>
        <CardBody className="px-8 py-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Input
              type="email"
              label="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="bordered"
              radius="lg"
              startContent={<Mail className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
              }}
              isRequired
            />
            <Input
              type="password"
              label="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="bordered"
              radius="lg"
              startContent={<Lock className="text-default-400" size={20} />}
              classNames={{
                input: "text-base",
              }}
              isRequired
            />
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full mt-2 font-semibold text-base h-12"
              radius="lg"
              size="lg"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Modal สำเร็จ */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        hideCloseButton
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 items-center pt-8">
            <CheckCircle2 className="text-success w-16 h-16" />
            <span className="text-xl font-semibold mt-2">
              เข้าสู่ระบบสำเร็จ
            </span>
          </ModalHeader>
          <ModalBody className="text-center pb-6">
            <p className="text-lg">ยินดีต้อนรับ, {userName}</p>
            <p className="text-default-500">กำลังนำคุณเข้าสู่ระบบ...</p>
          </ModalBody>
          <ModalFooter className="justify-center pb-8">
            <Button
              color="primary"
              onPress={handleModalClose}
              size="lg"
              radius="lg"
            >
              ตกลง
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal ไม่สำเร็จ */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 items-center pt-8">
            <XCircle className="text-danger w-16 h-16" />
            <span className="text-xl font-semibold mt-2">
              เข้าสู่ระบบไม่สำเร็จ
            </span>
          </ModalHeader>
          <ModalBody className="text-center pb-6">
            <p className="text-default-500">{errorMessage}</p>
          </ModalBody>
          <ModalFooter className="justify-center pb-8">
            <Button
              color="danger"
              variant="light"
              onPress={() => setShowErrorModal(false)}
              size="lg"
              radius="lg"
            >
              ปิด
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
