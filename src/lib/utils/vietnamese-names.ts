/**
 * Vietnamese Name Formatting Utilities
 *
 * Provides functions to properly format Vietnamese names according to Vietnamese naming conventions
 * where the surname (family name) comes last in the full name but should be displayed first for identification.
 */

/**
 * Common Vietnamese surnames for better surname detection
 */
const VIETNAMESE_SURNAMES = [
  "nguyễn",
  "trần",
  "lê",
  "phạm",
  "hoàng",
  "huỳnh",
  "vũ",
  "võ",
  "đặng",
  "bùi",
  "đỗ",
  "hồ",
  "ngô",
  "dương",
  "lý",
  "trường",
  "tạ",
  "trịnh",
  "đinh",
  "phan",
  "tống",
  "phùng",
  "mai",
  "tô",
  "la",
  "trương",
  "bạch",
  "bảo",
  "cao",
  "châu",
  "chế",
  "chử",
  "cổ",
  "công",
  "cụ",
  "diêu",
  "đan",
  "đàm",
  "điền",
  "đồng",
  "giang",
  "hà",
  "hanh",
  "hiếu",
  "hình",
  "hộ",
  "kha",
  "khánh",
  "khổng",
  "kim",
  "lạc",
  "lam",
  "lê",
  "liên",
  "long",
  "luân",
  "ma",
  "mạc",
  "mẫn",
  "mộc",
  "nghiêm",
  "ngu",
  "ngưu",
  "nhữ",
  "phi",
  "quách",
  "quang",
  "quyền",
  "sác",
  "sơn",
  "thạch",
  "thái",
  "thanh",
  "thien",
  "thủy",
  "thương",
  "từ",
  "ưng",
  "vi",
  "vương",
  "xung",
  "ý",
];

/**
 * Extract the surname from a Vietnamese name
 * In Vietnamese culture, the surname is typically the last word in a full name
 * @param fullName - The complete Vietnamese name
 * @returns string - The surname (last part of the name)
 */
export function getVietnameseSurname(fullName: string): string {
  if (!fullName || typeof fullName !== "string") {
    return "Không xác định";
  }

  // Clean up the name by trimming and removing extra whitespace
  const cleanName = fullName.trim().replace(/\s+/g, " ");

  // Handle empty or single character names
  if (!cleanName || cleanName.length === 0) {
    return "Không xác định";
  }

  // Split the name into parts
  const nameParts = cleanName.split(" ");

  // If it's a single part name, return it
  if (nameParts.length === 1) {
    return cleanName;
  }

  // Get the last part (surname in Vietnamese naming convention)
  const surname = nameParts[nameParts.length - 1];

  // Check if it's a known Vietnamese surname or if it looks like a common surname pattern
  const normalizedSurname = surname.toLowerCase().trim();

  if (VIETNAMESE_SURNAMES.includes(normalizedSurname)) {
    return surname; // Return original capitalization
  }

  // If the last part doesn't match known surnames, it might still be the surname
  // Vietnamese surnames are typically one word
  if (surname.length > 0 && !surname.includes(" ")) {
    return surname;
  }

  // Fallback: return the original last part
  return surname;
}

/**
 * Format a Vietnamese name with proper spacing and capitalization
 * @param fullName - The complete Vietnamese name
 * @returns string - Properly formatted name
 */
export function formatVietnameseName(fullName: string): string {
  if (!fullName || typeof fullName !== "string") {
    return "Không xác định";
  }

  // Clean up extra whitespace
  const cleanName = fullName.trim().replace(/\s+/g, " ");

  if (!cleanName) {
    return "Không xác định";
  }

  // Capitalize each part of the name properly
  return cleanName
    .split(" ")
    .map((part) => {
      // Handle Vietnamese diacritics and capitalization
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Get a responsive display name based on screen size
 * For mobile: show only surname for space efficiency
 * For desktop: show full name for complete identification
 * @param fullName - The complete Vietnamese name
 * @param isMobile - Whether to show mobile format (surname only)
 * @returns string - The formatted display name
 */
export function getResponsiveDisplayName(
  fullName: string,
  isMobile: boolean = false,
): string {
  if (!fullName || typeof fullName !== "string") {
    return "Không xác định";
  }

  if (isMobile) {
    // Mobile: Show only surname
    return getVietnameseSurname(fullName);
  } else {
    // Desktop: Show full name
    return formatVietnameseName(fullName);
  }
}

/**
 * Get HTML string with responsive classes for Tailwind CSS
 * Returns HTML string with appropriate responsive classes
 * @param fullName - The complete Vietnamese name
 * @returns string - HTML string with responsive name display
 */
export function getResponsiveDisplayNameHTML(fullName: string): string {
  const surname = getVietnameseSurname(fullName);
  const fullNameFormatted = formatVietnameseName(fullName);

  return `
    <span class="hidden sm:block">
      ${fullNameFormatted}
    </span>
    <span class="block sm:hidden">
      ${surname}
    </span>
  `;
}

/**
 * Validate if a name appears to be in Vietnamese format
 * @param name - Name to validate
 * @returns boolean - True if it appears to be a Vietnamese name format
 */
export function isVietnameseNameFormat(name: string): boolean {
  if (!name || typeof name !== "string") {
    return false;
  }

  const cleanName = name.trim();

  // Basic validation: should have at least one word and reasonable length
  if (cleanName.length < 2 || cleanName.length > 100) {
    return false;
  }

  // Check if it contains Vietnamese characters or follows Vietnamese name patterns
  const vietnamesePattern =
    /[àáạảãăắằặẳẵâấầậẩẫèéẹẻẽêếềệểễìíịỉĩòóọỏõôốồộổỗơớờợởỡùúụủũưứừựửữỳýỵỷỹđ]/i;
  const hasVietnameseChars = vietnamesePattern.test(cleanName);

  if (hasVietnameseChars) {
    return true;
  }

  // Check if it's a multi-word name (common for Vietnamese names)
  const nameParts = cleanName.split(" ");
  if (nameParts.length >= 2) {
    return true;
  }

  // Check if the last word is a common Vietnamese surname
  if (nameParts.length >= 2) {
    const lastPart = nameParts[nameParts.length - 1].toLowerCase();
    return VIETNAMESE_SURNAMES.includes(lastPart);
  }

  return false;
}

/**
 * Vietnamese name utility functions export object
 */
export const vietnameseNameUtils = {
  getVietnameseSurname,
  formatVietnameseName,
  getResponsiveDisplayName,
  getResponsiveDisplayNameHTML,
  isVietnameseNameFormat,
  commonSurnames: VIETNAMESE_SURNAMES,
};

export default vietnameseNameUtils;
