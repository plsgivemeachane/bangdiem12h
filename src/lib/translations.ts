/**
 * Vietnamese translations for the Group Scoring System
 * Centralized constants for common terms and phrases
 */

// Common actions
export const ACTIONS = {
  CREATE: 'Tạo mới',
  EDIT: 'Chỉnh sửa',
  DELETE: 'Xóa',
  SAVE: 'Lưu',
  CANCEL: 'Hủy',
  SUBMIT: 'Gửi',
  CONFIRM: 'Xác nhận',
  CLOSE: 'Đóng',
  ADD: 'Thêm',
  REMOVE: 'Xóa bỏ',
  UPDATE: 'Cập nhật',
  RELOAD: 'Tải lại',
  EXPORT: 'Xuất',
  DOWNLOAD: 'Tải xuống',
  UPLOAD: 'Tải lên',
  SEARCH: 'Tìm kiếm',
  FILTER: 'Lọc',
  RESET: 'Đặt lại',
  BACK: 'Quay lại',
  NEXT: 'Tiếp theo',
  VIEW: 'Xem',
  MANAGE: 'Quản lý',
}

// Navigation
export const NAV = {
  DASHBOARD: 'Bảng điều khiển',
  GROUPS: 'Nhóm',
  ANALYTICS: 'Phân tích',
  ADMIN: 'Quản trị',
  ACCOUNT: 'Tài khoản',
  SETTINGS: 'Cài đặt',
  ACTIVITY_LOGS: 'Nhật ký hoạt động',
  SIGN_IN: 'Đăng nhập',
  SIGN_OUT: 'Đăng xuất',
}

// User roles
export const USER_ROLES = {
  USER: 'Người dùng',
  ADMIN: 'Quản trị viên',
}

// Group roles
export const GROUP_ROLES = {
  MEMBER: 'Thành viên',
  ADMIN: 'Quản trị viên',
  OWNER: 'Chủ nhóm',
}

// Common labels
export const LABELS = {
  EMAIL: 'Email',
  PASSWORD: 'Mật khẩu',
  NAME: 'Tên',
  DESCRIPTION: 'Mô tả',
  POINTS: 'Điểm',
  NOTES: 'Ghi chú',
  DATE: 'Ngày',
  TIME: 'Thời gian',
  STATUS: 'Trạng thái',
  ROLE: 'Vai trò',
  MEMBER: 'Thành viên',
  MEMBERS: 'Thành viên',
  GROUP: 'Nhóm',
  GROUPS: 'Nhóm',
  RULE: 'Quy tắc',
  RULES: 'Quy tắc',
  SCORE: 'Điểm',
  SCORES: 'Điểm',
  TOTAL: 'Tổng',
  AVERAGE: 'Trung bình',
  COUNT: 'Số lượng',
  CREATED_AT: 'Ngày tạo',
  UPDATED_AT: 'Ngày cập nhật',
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Không hoạt động',
}

// Common messages
export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Tạo thành công!',
    UPDATED: 'Cập nhật thành công!',
    DELETED: 'Xóa thành công!',
    SAVED: 'Lưu thành công!',
    SIGNED_IN: 'Đăng nhập thành công!',
    SIGNED_OUT: 'Đăng xuất thành công!',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Không thể tải dữ liệu',
    FAILED_TO_CREATE: 'Không thể tạo',
    FAILED_TO_UPDATE: 'Không thể cập nhật',
    FAILED_TO_DELETE: 'Không thể xóa',
    ACCESS_DENIED: 'Truy cập bị từ chối',
    INVALID_INPUT: 'Dữ liệu không hợp lệ',
    REQUIRED_FIELD: 'Trường này là bắt buộc',
    SOMETHING_WENT_WRONG: 'Đã xảy ra lỗi',
  },
  CONFIRM: {
    DELETE: 'Bạn có chắc chắn muốn xóa không?',
    LEAVE: 'Bạn có chắc chắn muốn rời khỏi không?',
    TRANSFER_OWNERSHIP: 'Bạn có chắc chắn muốn chuyển quyền sở hữu không?',
  },
}

// Activity types translations
export const ACTIVITY_TYPES = {
  USER_REGISTERED: 'Người dùng đã đăng ký',
  USER_LOGIN: 'Người dùng đã đăng nhập',
  LOGIN_FAILED: 'Đăng nhập thất bại',
  PASSWORD_RESET_REQUESTED: 'Yêu cầu đặt lại mật khẩu',
  PASSWORD_RESET_COMPLETED: 'Đặt lại mật khẩu hoàn tất',
  ADMIN_USER_CREATED: 'Quản trị viên tạo người dùng',
  ADMIN_USER_ROLE_UPDATED: 'Quản trị viên cập nhật vai trò người dùng',
  ADMIN_USER_DELETED: 'Quản trị viên xóa người dùng',
  ADMIN_PASSWORD_RESET_BY_ADMIN: 'Quản trị viên đặt lại mật khẩu',
  GROUP_CREATED: 'Nhóm đã được tạo',
  GROUP_UPDATED: 'Nhóm đã được cập nhật',
  GROUP_DELETED: 'Nhóm đã bị xóa',
  MEMBER_INVITED: 'Thành viên được mời',
  MEMBER_JOINED: 'Thành viên đã tham gia',
  MEMBER_ADDED: 'Thành viên được thêm',
  MEMBER_REMOVED: 'Thành viên bị xóa',
  MEMBER_ROLE_UPDATED: 'Vai trò thành viên được cập nhật',
  OWNERSHIP_TRANSFERRED: 'Quyền sở hữu được chuyển giao',
  SCORING_RULE_CREATED: 'Quy tắc chấm điểm được tạo',
  SCORING_RULE_UPDATED: 'Quy tắc chấm điểm được cập nhật',
  SCORING_RULE_DELETED: 'Quy tắc chấm điểm bị xóa',
  RULE_ADDED_TO_GROUP: 'Quy tắc được thêm vào nhóm',
  RULE_REMOVED_FROM_GROUP: 'Quy tắc bị xóa khỏi nhóm',
  SCORE_RECORDED: 'Điểm được ghi nhận',
  SCORE_UPDATED: 'Điểm được cập nhật',
  SCORE_DELETED: 'Điểm bị xóa',
}

// Time periods
export const PERIODS = {
  WEEK: 'Tuần',
  MONTH: 'Tháng',
  YEAR: 'Năm',
  TODAY: 'Hôm nay',
  YESTERDAY: 'Hôm qua',
  THIS_WEEK: 'Tuần này',
  THIS_MONTH: 'Tháng này',
  THIS_YEAR: 'Năm nay',
  LAST_WEEK: 'Tuần trước',
  LAST_MONTH: 'Tháng trước',
  LAST_YEAR: 'Năm trước',
  CUSTOM: 'Tùy chỉnh',
}

// Placeholders
export const PLACEHOLDERS = {
  ENTER_EMAIL: 'Nhập email',
  ENTER_PASSWORD: 'Nhập mật khẩu',
  ENTER_NAME: 'Nhập tên',
  ENTER_DESCRIPTION: 'Nhập mô tả',
  SEARCH: 'Tìm kiếm...',
  SELECT: 'Chọn...',
  OPTIONAL: 'Tùy chọn',
}

// Page titles
export const PAGE_TITLES = {
  DASHBOARD: 'Bảng điều khiển',
  GROUPS: 'Quản lý nhóm',
  GROUP_DETAILS: 'Chi tiết nhóm',
  CREATE_GROUP: 'Tạo nhóm mới',
  EDIT_GROUP: 'Chỉnh sửa nhóm',
  SCORING_RULES: 'Quy tắc chấm điểm',
  RECORD_SCORE: 'Ghi điểm',
  ANALYTICS: 'Phân tích',
  ACTIVITY_LOGS: 'Nhật ký hoạt động',
  ADMIN_USERS: 'Quản lý người dùng',
  ACCOUNT_SETTINGS: 'Cài đặt tài khoản',
  SIGN_IN: 'Đăng nhập',
}

// Descriptions
export const DESCRIPTIONS = {
  GROUP_SCORING_SYSTEM: 'Hệ thống chấm điểm nhóm',
  WELCOME_BACK: 'Chào mừng trở lại',
  NO_DATA: 'Không có dữ liệu',
  LOADING: 'Đang tải...',
  NO_RESULTS: 'Không tìm thấy kết quả',
}
