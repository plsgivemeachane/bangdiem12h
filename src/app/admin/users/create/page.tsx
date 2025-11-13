"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, Copy, Eye, EyeOff, KeyRound, Check } from "lucide-react";
import toast from "react-hot-toast";
import {
  USER_MANAGEMENT,
  ACTIONS,
  LABELS,
  USER_ROLES,
  VALIDATION,
  MESSAGES,
  DESCRIPTIONS,
  PLACEHOLDERS,
} from "@/lib/translations";

// Simple password strength checker
const checkPasswordStrength = (password: string) => {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  Object.values(checks).forEach((passed) => {
    if (passed) strength++;
  });

  return { strength, checks };
};

// Generate secure password
const generateSecurePassword = (length: number = 16): string => {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const requiredChars = [
    uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
    lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
    numberChars[Math.floor(Math.random() * numberChars.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  const remainingLength = length - requiredChars.length;
  const remainingChars = Array.from(
    { length: remainingLength },
    () => allChars[Math.floor(Math.random() * allChars.length)],
  );

  const allPasswordChars = [...requiredChars, ...remainingChars];

  // Shuffle
  for (let i = allPasswordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPasswordChars[i], allPasswordChars[j]] = [
      allPasswordChars[j],
      allPasswordChars[i],
    ];
  }

  return allPasswordChars.join("");
};

export default function CreateUserPage() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
      toast.error(USER_MANAGEMENT.CREATE_USER.ACCESS_DENIED_ADMIN);
    }
  }, [isAdmin, authLoading, router]);

  const handleGeneratePassword = () => {
    const password = generateSecurePassword(16);
    setFormData((prev) => ({
      ...prev,
      password,
      confirmPassword: password,
    }));
    toast.success(USER_MANAGEMENT.CREATE_USER.PASSWORD_COPIED_SUCCESS);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      setPasswordCopied(true);
      toast.success(USER_MANAGEMENT.CREATE_USER.PASSWORD_COPIED_CLIPBOARD);
      setTimeout(() => setPasswordCopied(false), 3000);
    } catch (error) {
      toast.error(USER_MANAGEMENT.CREATE_USER.CANNOT_COPY_PASSWORD);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation - removed password strength check for admin user creation
    if (!formData.email || !formData.password) {
      toast.error(VALIDATION.USER.EMAIL_PASSWORD_REQUIRED);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(VALIDATION.USER.PASSWORD_MISMATCH);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || null,
          password: formData.password,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || MESSAGES.ERROR.FAILED_TO_CREATE);
      }

      const data = await response.json();
      toast.success(
        USER_MANAGEMENT.CREATE_USER.SUCCESS_MESSAGE.replace(
          "{email}",
          data.user.email,
        ),
      );

      // Navigate back to users list after a brief delay
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } catch (error) {
      console.error(USER_MANAGEMENT.CREATE_USER.ERROR_CREATE_USER, ":", error);
      toast.error(
        error instanceof Error
          ? error.message
          : MESSAGES.ERROR.FAILED_TO_CREATE,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = checkPasswordStrength(formData.password);
  const strengthLabel =
    [
      USER_MANAGEMENT.CREATE_USER.PASSWORD_STRENGTH_VERY_WEAK,
      USER_MANAGEMENT.CREATE_USER.PASSWORD_STRENGTH_WEAK,
      USER_MANAGEMENT.CREATE_USER.PASSWORD_STRENGTH_MEDIUM,
      USER_MANAGEMENT.CREATE_USER.PASSWORD_STRENGTH_GOOD,
      USER_MANAGEMENT.CREATE_USER.PASSWORD_STRENGTH_STRONG,
    ][passwordStrength.strength - 1] ||
    USER_MANAGEMENT.CREATE_USER.PASSWORD_STRENGTH_VERY_WEAK;
  const strengthColor =
    [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ][passwordStrength.strength - 1] || "bg-gray-300";

  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">{ACTIONS.LOADING_DASHBOARD}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/users")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {USER_MANAGEMENT.CREATE_USER.BACK_TO_LIST}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{USER_MANAGEMENT.CREATE_USER.BACK_TO_MANAGEMENT}</p>
          </TooltipContent>
        </Tooltip>
        <h1 className="text-3xl font-bold">
          {USER_MANAGEMENT.CREATE_USER.TITLE}
        </h1>
        <p className="text-gray-600 mt-1">
          {USER_MANAGEMENT.CREATE_USER.DESCRIPTION}
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{USER_MANAGEMENT.CREATE_USER.USER_INFO}</CardTitle>
          <CardDescription>
            {USER_MANAGEMENT.CREATE_USER.USER_INFO_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{LABELS.EMAIL} *</Label>
              <Input
                id="email"
                type="email"
                placeholder={PLACEHOLDERS.ENTER_EMAIL}
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{LABELS.NAME}</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">{LABELS.ROLE} *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={PLACEHOLDERS.SELECT} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">{USER_ROLES.USER}</SelectItem>
                  <SelectItem value="ADMIN">{USER_ROLES.ADMIN}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {formData.role === "ADMIN"
                  ? USER_MANAGEMENT.CREATE_USER.ROLE_ADMIN_DESCRIPTION
                  : USER_MANAGEMENT.CREATE_USER.ROLE_USER_DESCRIPTION}
              </p>
            </div>

            {/* Password Generation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{LABELS.PASSWORD} *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePassword}
                    >
                      <KeyRound className="mr-2 h-3 w-3" />
                      {USER_MANAGEMENT.CREATE_USER.GENERATE_SECURE_PASSWORD}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{USER_MANAGEMENT.CREATE_USER.GENERATE_STRONG_RANDOM}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={PLACEHOLDERS.ENTER_PASSWORD}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                />
                <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-1">
                  {formData.password && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyPassword}
                          className="h-8 px-2"
                        >
                          {passwordCopied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {passwordCopied
                            ? USER_MANAGEMENT.CREATE_USER.COPIED
                            : USER_MANAGEMENT.CREATE_USER.COPY_TO_CLIPBOARD}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-8 px-2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {showPassword
                          ? ACTIONS.TOGGLE_HIDE
                          : ACTIONS.TOGGLE_SHOW}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      {USER_MANAGEMENT.CREATE_USER.PASSWORD_STRENGTH}:
                    </span>
                    <span
                      className={`font-medium ${passwordStrength.strength >= 4 ? "text-green-600" : "text-orange-600"}`}
                    >
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${level <= passwordStrength.strength ? strengthColor : "bg-gray-200"}`}
                      />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <div className="space-y-1 text-xs">
                    <div
                      className={
                        passwordStrength.checks.length
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {passwordStrength.checks.length ? "✓" : "○"}{" "}
                      {USER_MANAGEMENT.CREATE_USER.MINIMUM_8_CHARS}
                    </div>
                    <div
                      className={
                        passwordStrength.checks.uppercase
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {passwordStrength.checks.uppercase ? "✓" : "○"}{" "}
                      {USER_MANAGEMENT.CREATE_USER.ONE_UPPERCASE}
                    </div>
                    <div
                      className={
                        passwordStrength.checks.lowercase
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {passwordStrength.checks.lowercase ? "✓" : "○"}{" "}
                      {USER_MANAGEMENT.CREATE_USER.ONE_LOWERCASE}
                    </div>
                    <div
                      className={
                        passwordStrength.checks.number
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {passwordStrength.checks.number ? "✓" : "○"}{" "}
                      {USER_MANAGEMENT.CREATE_USER.ONE_DIGIT}
                    </div>
                    <div
                      className={
                        passwordStrength.checks.special
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {passwordStrength.checks.special ? "✓" : "○"}{" "}
                      {USER_MANAGEMENT.CREATE_USER.ONE_SPECIAL_CHAR}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {USER_MANAGEMENT.CREATE_USER.CONFIRM_PASSWORD} *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={
                    USER_MANAGEMENT.CREATE_USER.CONFIRM_PASSWORD_PLACEHOLDER
                  }
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-0 top-0 h-full px-3"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {showConfirmPassword
                        ? ACTIONS.TOGGLE_HIDE
                        : ACTIONS.TOGGLE_SHOW}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {VALIDATION.USER.PASSWORD_MISMATCH}
                  </p>
                )}
              {formData.confirmPassword &&
                formData.password === formData.confirmPassword && (
                  <p className="text-xs text-green-600">
                    {USER_MANAGEMENT.CREATE_USER.PASSWORD_MATCHES}
                  </p>
                )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/users")}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {ACTIONS.CANCEL}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{USER_MANAGEMENT.CREATE_USER.CANCEL_AND_BACK}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      formData.password !== formData.confirmPassword
                    }
                    className="flex-1"
                  >
                    {isSubmitting
                      ? USER_MANAGEMENT.CREATE_USER.CREATING
                      : USER_MANAGEMENT.CREATE_USER.CREATE_USER}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isSubmitting
                      ? USER_MANAGEMENT.CREATE_USER.CREATING_ACCOUNT
                      : formData.password !== formData.confirmPassword
                        ? USER_MANAGEMENT.CREATE_USER.PASSWORD_MUST_MATCH
                        : USER_MANAGEMENT.CREATE_USER.CREATE_USER_ACCOUNT}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
