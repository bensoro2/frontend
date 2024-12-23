"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
} from "@nextui-org/react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import DeleteConfirmationModal from "./common/DeleteConfirmationModal";
import Link from "next/link";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export default function AdminNavbar() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    router.push("/");
    setLogoutModalOpen(false);
  };

  return (
    <div className="w-full min-w-[1200px] overflow-x-auto">
      <Navbar
        isBordered
        className="bg-background w-full min-w-[1200px]"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div className="w-full flex justify-between items-center px-4">
          <NavbarBrand>
            <Link
              href="/dashboard"
              className="font-bold text-inherit cursor-pointer hover:opacity-80 transition-opacity"
            >
              ระบบจัดการโรงเรียน
            </Link>
          </NavbarBrand>

          <NavbarContent justify="end">
            <NavbarItem>
              <ThemeSwitcher />
            </NavbarItem>
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <User
                    as="button"
                    avatarProps={{
                      isBordered: true,
                      src: "https://i.pravatar.cc/150",
                    }}
                    className="transition-transform cursor-pointer"
                    description="Admin"
                    name={userProfile?.name || "ผู้ดูแลระบบ"}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem
                    key="logout"
                    color="danger"
                    onClick={handleLogout}
                  >
                    ออกจากระบบ
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </NavbarContent>
        </div>
      </Navbar>

      <DeleteConfirmationModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="ยืนยันการออกจากระบบ"
        message="คุณแน่ใจหรือไม่ที่จะออกจากระบบ?"
        confirmText="ออกจากระบบ"
      />
    </div>
  );
}
