"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { Separator } from "@/components/ui/separator";
import { Lock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Tất cả các trường mật khẩu là bắt buộc");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể thay đổi mật khẩu");
      }

      toast.success("Đổi mật khẩu thành công");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể thay đổi mật khẩu",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Đang tải cài đặt..." />
      </div>
    );
  }

  const hasPassword = user.password !== null && user.password !== undefined;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt tài khoản</h1>
        <p className="text-muted-foreground">
          Quản lý bảo mật và tùy chọn tài khoản của bạn
        </p>
      </div>

      <div className="space-y-6">
        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
            <CardDescription>
              {hasPassword
                ? "Cập nhật mật khẩu để bảo vệ tài khoản của bạn"
                : "Bạn đang sử dụng xác thực OAuth. Quản lý mật khẩu không khả dụng."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasPassword ? (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Nhập mật khẩu hiện tại của bạn"
                    disabled={isChangingPassword}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                    disabled={isChangingPassword}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Nhập lại mật khẩu mới của bạn"
                    disabled={isChangingPassword}
                  />
                </div>

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                </Button>
              </form>
            ) : (
              <div className="text-sm text-muted-foreground">
                Tài khoản của bạn được kết nối thông qua nhà cung cấp OAuth bên
                thứ ba. Quản lý mật khẩu nên được thực hiện thông qua cài đặt
                của nhà cung cấp OAuth của bạn.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Section (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Thông báo email</CardTitle>
            <CardDescription>
              Quản lý tùy chọn thông báo email của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Tùy chọn thông báo email sẽ có sẵn trong bản cập nhật tương lai.
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt quyền riêng tư</CardTitle>
            <CardDescription>
              Kiểm soát quyền riêng tư và tùy chọn chia sẻ dữ liệu của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Cài đặt quyền riêng tư sẽ có sẵn trong bản cập nhật tương lai.
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Khu vực nguy hiểm
            </CardTitle>
            <CardDescription>
              Hành động không thể đảo ngược và có thể gây tổn hại
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Xóa tài khoản</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Một khi bạn xóa tài khoản, không thể hoàn tác. Điều này sẽ
                  vĩnh viễn xóa tài khoản của bạn và loại bỏ tất cả dữ liệu liên
                  quan.
                </p>
                <Button variant="destructive" disabled>
                  Xóa tài khoản (Sắp ra mắt)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
