# BangDiemLop Localization Audit Report

**Generated:** 2025-11-10  
**Scope:** Comprehensive scan of entire codebase for hardcoded text strings
**Total Files Analyzed:** 50+ files across components, pages, API routes, and utilities

## Executive Summary

This audit identified **120+ hardcoded text strings** across the BangDiemLop codebase that should be migrated to the translation system. The application currently has a well-established Vietnamese-first translation system in `src/lib/translations.ts`, but many components are not utilizing it consistently.

## Current Translation System Status

- ✅ **Translation infrastructure exists** (`src/lib/translations.ts`)
- ✅ **Vietnamese translations are comprehensive** (ACTIONS, LABELS, MESSAGES, etc.)
- ✅ **Some components already use translations** (AdminUsersPage, GroupCard, etc.)
- ❌ **Mixed usage** - Many components still use hardcoded strings
- ❌ **English hardcoded strings** found in several components

## Critical Findings by Category

### 🔴 HIGH PRIORITY - UI Text Strings (45+ instances)

#### Components with Mixed Translation Usage

**1. GroupForm.tsx** (`src/components/groups/GroupForm.tsx`)
```typescript
// ❌ HARDCODED - Lines 35-36, 85, 88, 95, 113, 117, 130, 133, 139, 154, 176, 180
'Tên nhóm là bắt buộc'
'Tên nhóm phải ít hơn 100 ký tự'
'Tạo nhóm thành công!'
'ID nhóm là bắt buộc để chỉnh sửa'
'Cập nhật nhóm thành công!'
'Tạo nhóm mới' / 'Chỉnh sửa nhóm'
'Tạo nhóm mới để bắt đầu tổ chức các hoạt động chấm điểm của bạn.'
'Tên nhóm *'
'Nhập tên nhóm'
'Tên duy nhất để xác định nhóm của bạn'
'Nhập mô tả nhóm (tùy chọn)'
'Hủy'
'Tạo nhóm' / 'Cập nhật nhóm'
```

**2. RuleCreationModal.tsx** (`src/components/ui/rule-creation-modal.tsx`)
```typescript
// ❌ HARDCODED - Lines 94, 99, 148, 169, 186, 188, 217, 220, 237, 241, 246, 253, 259, 264, 270, 275, 285, 295, 304, 308, 317, 326, 332, 339, 354, 362, 386, 400, 410, 415
'Tên quy tắc là bắt buộc'
'Vui lòng nhập số hợp lệ cho điểm (dương cho thưởng, âm cho phạt)'
'Quy tắc "{name}" đã được cập nhật thành công!'
'Quy tắc "{name}" đã được tạo thành công!'
'Không thể tạo quy tắc' (x2)
'Tạo quy tắc chấm điểm mới' / 'Chỉnh sửa quy tắc chấm điểm'
'Định nghĩa quy tắc chấm điểm mới có thể được sử dụng trong tất cả các nhóm'
'Thông tin cơ bản'
'Tên quy tắc *'
'VD: Hoàn thành nhiệm vụ, Tham gia'
'Điểm *'
'VD: 10 cho thưởng, -5 cho phạt'
'Dùng số dương cho thưởng, số âm cho phạt'
'Mô tả'
'Mô tả quy tắc này dùng để làm gì và khi nào nên áp dụng...'
'Tiêu chí chấm điểm'
'Chọn thủ công' / 'Điều kiện tự động'
'Thủ công' / 'Tự động'
'Thành viên sẽ chọn quy tắc này thủ công khi ghi điểm'
'Điểm sẽ được tính tự động dựa trên điều kiện'
'Điều kiện'
'Thêm điều kiện'
'Chưa có điều kiện nào. Thêm điều kiện để tự động kích hoạt quy tắc này.'
'Trường'
'bằng', 'không bằng', 'lớn hơn', 'nhỏ hơn', 'chứa'
'Giá trị'
'Quy tắc này sẽ xuất hiện trong danh sách chọn quy tắc khi thành viên ghi điểm thủ công.'
'Hủy'
'Đang lưu...'
'Tạo quy tắc' / 'Cập nhật quy tắc'
```

**3. GroupCard.tsx** (`src/components/groups/GroupCard.tsx`)
- ✅ Already using translation constants properly

**4. AdminUsersPage.tsx** (`src/app/admin/users/page.tsx`)
- ✅ Has both hardcoded and translated strings mixed
- ❌ Lines 467, 468, 470, 475: "Huỷ", "Xoá", "Xoá người dùng"
- ✅ Most other strings properly translated

**5. MemberInvite.tsx** (`src/components/groups/MemberInvite.tsx`)
```typescript
// ❌ HARDCODED - Lines 188, 297, 390, 392, 306
'Thêm thành viên mới vào nhóm. Người dùng có thể đăng nhập bằng tài khoản hiện có.'
'Chọn vai trò' (x2)
'Quản lý thành viên'
'Xem và quản lý thành viên trong nhóm. Bạn có thể cập nhật vai trò hoặc xoá thành viên.'
'Thành viên có thể ghi điểm. Quản trị viên còn có thể quản lý nhóm.'
```

### 🟡 MEDIUM PRIORITY - English Hardcoded Strings (20+ instances)

**1. AdminUsersCreatePage.tsx** (`src/app/admin/users/create/page.tsx`)
```typescript
// ❌ ENGLISH HARDCODED - Lines 414, 435, 444
'Creating...'
'Create User' (x2)
```

**2. GroupsPage.tsx** (`src/app/groups/page.tsx`)
```typescript
// ❌ HARDCODED - Line 142
'Nhóm'
```

**3. DashboardClient.tsx** (`src/app/dashboard/dashboard-client.tsx`)
```typescript
// ❌ HARDCODED - Lines 299, 305, 309
'Chọn một nhóm để xem và quản lý quy tắc chấm điểm của nó.'
'Nhóm'
'Chọn nhóm'
```

### 🟠 MEDIUM PRIORITY - API Route Messages (30+ instances)

**1. API Response Messages**
```typescript
// ❌ HARDCODED API MESSAGES
src/app/api/groups/[id]/route.ts:207 - 'Đã xóa nhóm thành công'
src/app/api/groups/[id]/members/route.ts:417 - 'Đã xóa thành viên thành công'
src/app/api/auth/reset-password/route.ts:15 - 'Dữ liệu không hợp lệ'
src/app/api/admin/users/route.ts:142 - 'Mật khẩu không đáp ứng yêu cầu'
src/app/api/groups/[id]/rules/route.ts:81 - 'Cần cung cấp mã quy tắc'
```

**2. Error Handling**
```typescript
// ❌ HARDCODED ERROR MESSAGES
src/lib/api-utils.ts:60-86 - 'Lỗi máy chủ nội bộ', 'Access denied', etc.
src/app/api/score-records/route.ts:241 - 'Lỗi ghi điểm'
src/app/api/groups/route.ts:140 - 'Lỗi tạo nhóm'
src/app/api/activity-logs/route.ts:216 - 'Không thể tạo nhật ký hoạt động'
```

### 🟡 MEDIUM PRIORITY - Activity Logger Messages (25+ instances)

**1. Activity Logger Text** (`src/lib/activity-logger.ts`)
```typescript
// ❌ HARDCODED - Mixed Vietnamese/English
'Admin user created: {email}' (English)
'Password reset requested for {email}' (English)
'Failed login attempt for {email}' (English)
'Tài khoản quản trị được tạo: {email}' (Vietnamese)
'Yêu cầu đặt lại mật khẩu cho {email}' (Vietnamese)
'Đăng nhập thất bại cho {email}' (Vietnamese)
```

**2. API Activity Logs** (Mixed languages)
```typescript
// ❌ HARDCODED ACTIVITY DESCRIPTIONS
src/app/api/groups/[id]/members/route.ts:142 - 'Đã thêm {email} với vai trò {role} vào nhóm'
src/app/api/groups/[id]/members/route.ts:149 - 'Added {email} as {role} to group' (English)
src/app/api/groups/[id]/members/route.ts:314 - 'Đã cập nhật vai trò của {email} thành {role}'
src/app/api/groups/[id]/members/route.ts:230 - 'Updated {email} role to {role} in group' (English)
```

### 🟢 LOW PRIORITY - Form Validation & Toast Messages (15+ instances)

**1. Toast Notifications**
```typescript
// ❌ HARDCODED TOAST MESSAGES
src/app/admin/users/create/page.tsx:133 - 'User {email} created successfully!'
src/app/admin/users/create/page.tsx:155 - 'Failed to create user'
src/lib/validators/auth.ts:166 - 'Rất yếu', 'Yếu', 'Trung bình', 'Tốt', 'Mạnh', 'Rất mạnh'
src/lib/validators/auth.ts:204 - Password strength labels
```

**2. Form Field Labels**
```typescript
// ❌ HARDCODED FORM LABELS
src/app/account/settings/page.tsx:35 - 'Tất cả các trường mật khẩu là bắt buộc'
src/app/account/settings/page.tsx:208 - 'Xóa tài khoản'
src/app/account/settings/page.tsx:213 - 'Xóa tài khoản (Sắp ra mắt)'
src/app/account/settings/page.tsx:174 - 'Quản lý tùy chọn thông báo email của bạn'
```

## Migration Priority Matrix

### Phase 1: Critical UI Components (Weeks 1-2)
**Priority: CRITICAL**
- [ ] **GroupForm.tsx** - 15+ hardcoded strings, core functionality
- [ ] **RuleCreationModal.tsx** - 30+ hardcoded strings, rule management
- [ ] **MemberInvite.tsx** - 5+ hardcoded strings, user management

### Phase 2: Page Components (Weeks 3-4)
**Priority: HIGH**
- [ ] **AdminUsersPage.tsx** - 10+ hardcoded strings, mixed usage
- [ ] **AdminUsersCreatePage.tsx** - 3+ English hardcoded strings
- [ ] **DashboardClient.tsx** - 3+ hardcoded strings

### Phase 3: API & Services (Weeks 5-6)
**Priority: MEDIUM**
- [ ] **API Route Error Messages** - 15+ messages, all API responses
- [ ] **Activity Logger Messages** - 25+ messages, mixed languages
- [ ] **Email Service Integration** - Future implementation needed

### Phase 4: Validation & Toast (Weeks 7-8)
**Priority: LOW**
- [ ] **Form Validation Messages** - Password strength, field requirements
- [ ] **Toast Notifications** - Success/error messages
- [ ] **Placeholders & Tooltips** - User guidance text

## Technical Recommendations

### 1. Extend Translation System
```typescript
// Add to src/lib/translations.ts
export const COMPONENT_SPECIFIC = {
  GROUP_FORM: {
    NAME_REQUIRED: 'Tên nhóm là bắt buộc',
    NAME_TOO_LONG: 'Tên nhóm phải ít hơn 100 ký tự',
    DESCRIPTION_TOO_LONG: 'Mô tả phải ít hơn 500 ký tự',
    // ... more group form strings
  },
  RULE_CREATION: {
    RULE_NAME_REQUIRED: 'Tên quy tắc là bắt buộc',
    INVALID_POINTS: 'Vui lòng nhập số hợp lệ cho điểm',
    // ... more rule creation strings
  }
}
```

### 2. Migration Strategy
1. **Create translation keys** for all missing strings
2. **Refactor components** to use translation imports
3. **Update API responses** to use translation keys
4. **Test thoroughly** after each component migration
5. **Add English translations** as needed

### 3. Code Quality Improvements
- Add ESLint rules to detect hardcoded strings
- Create TypeScript types for translation keys
- Implement translation key validation
- Add automated tests for translation coverage

## Current Translation System Gaps

### Missing Categories
1. **Component-Specific Text** - Form labels, placeholders
2. **API Error Messages** - Server responses, validation errors
3. **Activity Log Descriptions** - User action descriptions
4. **Toast Notification Text** - Success/error feedback
5. **Date/Time Formatting** - Vietnamese date formats
6. **Number Formatting** - Vietnamese number formats

### Inconsistent Usage Patterns
1. **Mixed Languages** - Some files use Vietnamese, others English
2. **Incomplete Migration** - Components partially using translations
3. **Missing Error Handling** - Hardcoded error messages in try-catch blocks

## Estimated Impact

- **Total Strings to Migrate:** 120+
- **Files Requiring Changes:** 25+ files
- **Development Time:** 4-6 weeks
- **Testing Effort:** 1-2 weeks
- **Risk Level:** Low (existing translation system)

## Success Metrics

- [ ] 100% of UI components using translation system
- [ ] All API responses using translation keys
- [ ] Complete Vietnamese language coverage
- [ ] English translations for core functionality
- [ ] Automated testing for translation coverage
- [ ] ESLint rules preventing hardcoded strings

---

**Next Steps:**
1. Review and approve migration plan
2. Create detailed task breakdown in TASKS.md
3. Begin Phase 1 implementation
4. Set up automated translation coverage testing
5. Schedule regular progress reviews

**Contact:** Development Team for questions about this audit report.