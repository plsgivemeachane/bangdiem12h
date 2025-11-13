import bcrypt from "bcryptjs";

// Password configuration constants
export const PASSWORD_CONFIG = {
  rounds: 12, // bcrypt rounds for security/performance balance
  minLength: 8, // minimum password length
  maxLength: 100, // maximum password length
  minUppercase: 1, // minimum uppercase letters
  minLowercase: 1, // minimum lowercase letters
  minNumbers: 1, // minimum numbers
  minSpecial: 1, // minimum special characters
};

/**
 * Hash a password using bcryptjs
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password
 * @throws Error if password is invalid or hashing fails
 */
export async function hashPassword(password: string): Promise<string> {
  // Validate password length
  if (password.length < PASSWORD_CONFIG.minLength) {
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (password.length > PASSWORD_CONFIG.maxLength) {
    throw new Error("Mật khẩu không được vượt quá 100 ký tự");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, PASSWORD_CONFIG.rounds);
    return hashedPassword;
  } catch (error) {
    console.error("Băm mật khẩu thất bại:", error);
    throw new Error("Xử lý mật khẩu thất bại");
  }
}

/**
 * Verify a password against its hash
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise<boolean> - True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    if (!password || !hashedPassword) {
      return false;
    }

    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    console.error("Xác minh mật khẩu thất bại:", error);
    return false;
  }
}

/**
 * Validate password strength according to configuration rules
 * @param password - Password to validate
 * @returns Object with validation result and error messages
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number; // 0-5 strength score
} {
  const errors: string[] = [];
  let score = 0;

  // Length validation
  if (password.length < PASSWORD_CONFIG.minLength) {
    errors.push(`Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.minLength} ký tự`);
  } else if (password.length >= 12) {
    score += 2; // Bonus for long passwords
  } else {
    score += 1;
  }

  // Character type validation
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  const numberCount = (password.match(/\d/g) || []).length;
  const specialCount = (password.match(/[^A-Za-z0-9]/g) || []).length;

  if (uppercaseCount >= PASSWORD_CONFIG.minUppercase) {
    score += 1;
  } else {
    errors.push(
      `Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.minUppercase} chữ hoa`,
    );
  }

  if (lowercaseCount >= PASSWORD_CONFIG.minLowercase) {
    score += 1;
  } else {
    errors.push(
      `Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.minLowercase} chữ thường`,
    );
  }

  if (numberCount >= PASSWORD_CONFIG.minNumbers) {
    score += 1;
  } else {
    errors.push(
      `Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.minNumbers} chữ số`,
    );
  }

  if (specialCount >= PASSWORD_CONFIG.minSpecial) {
    score += 1;
  } else {
    errors.push(
      `Mật khẩu phải có ít nhất ${PASSWORD_CONFIG.minSpecial} ký tự đặc biệt`,
    );
  }

  // Additional strength indicators
  if (password.length >= 16) {
    score += 1; // Extra bonus for very long passwords
  }

  if (
    uppercaseCount >= 2 &&
    lowercaseCount >= 2 &&
    numberCount >= 2 &&
    specialCount >= 2
  ) {
    score += 1; // Bonus for meeting enhanced requirements
  }

  const isValid = errors.length === 0;
  return {
    isValid,
    errors,
    score: Math.min(score, 5), // Cap at 5
  };
}

/**
 * Generate a random password that meets all requirements
 * @param length - Desired password length (defaults to 16)
 * @returns string - Generated password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  // Ensure at least one of each required character type
  const requiredChars = [
    uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
    lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
    numberChars[Math.floor(Math.random() * numberChars.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];

  // Create the character pool for the remaining characters
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;

  // Fill the rest of the password
  const remainingLength = length - requiredChars.length;
  const remainingChars = Array.from(
    { length: remainingLength },
    () => allChars[Math.floor(Math.random() * allChars.length)],
  );

  // Combine and shuffle
  const allPasswordChars = [...requiredChars, ...remainingChars];

  // Fisher-Yates shuffle
  for (let i = allPasswordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPasswordChars[i], allPasswordChars[j]] = [
      allPasswordChars[j],
      allPasswordChars[i],
    ];
  }

  return allPasswordChars.join("");
}

/**
 * Check if a password is commonly used (basic check)
 * @param password - Password to check
 * @returns boolean - True if password appears to be commonly used
 */
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    "password",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "password123",
    "admin",
    "letmein",
    "welcome",
    "monkey",
    "1234567890",
    "dragon",
    "master",
    "hello",
    "login",
  ];

  return commonPasswords.includes(password.toLowerCase());
}

/**
 * Password utility functions export object
 */
export const passwordUtils = {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateSecurePassword,
  isCommonPassword,
  config: PASSWORD_CONFIG,
};

export default passwordUtils;
