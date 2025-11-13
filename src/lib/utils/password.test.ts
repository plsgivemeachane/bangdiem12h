import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "./password";

describe("Password Utilities", () => {
  describe("hashPassword", () => {
    it("should hash a valid password", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });

    it("should throw error for password too short", async () => {
      await expect(hashPassword("short")).rejects.toThrow(
        "Password must be at least 8 characters long",
      );
    });

    it("should throw error for password too long", async () => {
      const longPassword = "a".repeat(101);
      await expect(hashPassword(longPassword)).rejects.toThrow(
        "Password must not exceed 100 characters",
      );
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await hashPassword(password);

      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const correctPassword = "TestPassword123!";
      const wrongPassword = "WrongPassword123!";
      const hashedPassword = await hashPassword(correctPassword);

      const isValid = await verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it("should reject empty inputs", async () => {
      const hashedPassword = await hashPassword("TestPassword123!");

      expect(await verifyPassword("", hashedPassword)).toBe(false);
      expect(await verifyPassword("TestPassword123!", "")).toBe(false);
    });
  });

  describe("validatePasswordStrength", () => {
    it("should validate strong password", () => {
      const password = "StrongPass123!";
      const result = validatePasswordStrength(password);

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject weak passwords", () => {
      const weakPassword = "weak";
      const result = validatePasswordStrength(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should validate password without uppercase", () => {
      const noUppercase = "lowercase123!";
      const result = validatePasswordStrength(noUppercase);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least 1 uppercase letter(s)",
      );
    });

    it("should validate password without lowercase", () => {
      const noLowercase = "UPPERCASE123!";
      const result = validatePasswordStrength(noLowercase);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least 1 lowercase letter(s)",
      );
    });

    it("should validate password without numbers", () => {
      const noNumbers = "NoNumbers!";
      const result = validatePasswordStrength(noNumbers);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least 1 number(s)",
      );
    });

    it("should validate password without special chars", () => {
      const noSpecial = "NoSpecial123";
      const result = validatePasswordStrength(noSpecial);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least 1 special character(s)",
      );
    });

    it("should give higher score for longer passwords", () => {
      const shortPassword = "Pass123!";
      const longPassword = "VeryLongPasswordWithManyCharacters123!";

      const shortResult = validatePasswordStrength(shortPassword);
      const longResult = validatePasswordStrength(longPassword);

      expect(longResult.score).toBeGreaterThan(shortResult.score);
    });
  });
});
