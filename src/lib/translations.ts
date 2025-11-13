/**
 * Vietnamese translations for the Group Scoring System
 * Centralized constants for common terms and phrases
 */

// Common actions
export const ACTIONS = {
  CREATE: "Tạo mới",
  EDIT: "Chỉnh sửa",
  DELETE: "Xóa",
  SAVE: "Lưu",
  CANCEL: "Hủy",
  SUBMIT: "Gửi",
  CONFIRM: "Xác nhận",
  CLOSE: "Đóng",
  ADD: "Thêm",
  REMOVE: "Xóa bỏ",
  UPDATE: "Cập nhật",
  RELOAD: "Tải lại",
  EXPORT: "Xuất",
  DOWNLOAD: "Tải xuống",
  UPLOAD: "Tải lên",
  SEARCH: "Tìm kiếm",
  FILTER: "Lọc",
  RESET: "Đặt lại",
  BACK: "Quay lại",
  NEXT: "Tiếp theo",
  VIEW: "Xem",
  MANAGE: "Quản lý",
  TRANSFER: "Chuyển giao",
  PREVIOUS: "Trước",
  DETAILS: "Chi tiết",
  CHOOSE: "Chọn",
  HIDE: "Ẩn",
  CLEAR_ALL: "Xóa tất cả",
  TRY_AGAIN: "Thử lại",
  PREVIOUS_PAGE: "Trước",
  NEXT_PAGE: "Tiếp theo",
  CHECKING_AUTHENTICATION: "Kiểm tra xác thực...",
  LOADING_DASHBOARD: "Đang tải bảng điều khiển...",
  LOADING_GROUP_INFO: "Đang tải thông tin nhóm...",
  LOADING_SCORE_DATA: "Đang tải dữ liệu chấm điểm...",
  LOADING_GROUP_RULES: "Đang tải quy tắc nhóm...",
  LOADING_GROUP_MEMBERS: "Đang tải thành viên nhóm...",
  LOADING_ANALYTICS: "Đang tải dữ liệu phân tích...",
  LOADING_SETTINGS: "Đang tải cài đặt...",
  LOADING_PROFILE: "Đang tải hồ sơ...",
  LOADING_USERS: "Đang tải danh sách người dùng...",
  LOADING_USER_LIST: "Đang tải danh sách người dùng...",
  SAVING: "Đang lưu...",
  SAVE_CHANGES: "Lưu thay đổi",
  SHOW_PASSWORD: "Hiển thị mật khẩu",
  HIDE_PASSWORD: "Ẩn mật khẩu",
  SHOW: "Hiển thị",
  TOGGLE_SHOW: "Hiển thị",
  TOGGLE_HIDE: "Ẩn",
  APPLY_FILTER: "Áp dụng bộ lọc",
  LOADING_ACTIVITIES: "Đang tải hoạt động...",
  LOADING_USER_LIST_SEARCH: "Đang tìm kiếm...",
  ACCOUNT_PROFILE: "Hồ sơ tài khoản",
  MANAGE_ACCOUNT_INFO: "Quản lý thông tin tài khoản và xem hoạt động của bạn",
  PROFILE_INFORMATION: "Thông tin hồ sơ",
  UPDATE_PERSONAL_INFO: "Cập nhật thông tin cá nhân",
  EDIT_PROFILE: "Chỉnh sửa hồ sơ",
  YOUR_STATISTICS: "Thống kê của bạn",
  ACTIVITY_OVERVIEW: "Tổng quan hoạt động",
  TOTAL_GROUPS_LABEL: "Tổng nhóm",
  SCORE_RECORDS_LABEL: "Bản ghi điểm",
  TOTAL_POINTS_LABEL: "Tổng điểm",
  UNKNOWN: "Không xác định",
  NOT_SET: "Chưa thiết lập",
  VERIFIED: "Đã xác minh",
};

// Navigation
export const NAV = {
  DASHBOARD: "Bảng điều khiển",
  GROUPS: "Nhóm",
  ANALYTICS: "Phân tích",
  SCORE_RECORDS: "Bản ghi điểm",
  ADMIN: "Quản trị",
  ADMIN_SCORING_RULES: "Quản lý quy tắc toàn cục",
  ACCOUNT: "Tài khoản",
  SETTINGS: "Cài đặt",
  ACTIVITY_LOGS: "Nhật ký hoạt động",
  SIGN_IN: "Đăng nhập",
  SIGN_OUT: "Đăng xuất",
};

// User roles
export const USER_ROLES = {
  USER: "Người dùng",
  ADMIN: "Quản trị viên",
};

// Group roles
export const GROUP_ROLES = {
  MEMBER: "Thành viên",
  ADMIN: "Quản trị viên",
  OWNER: "Chủ nhóm",
};

// Common labels
export const LABELS = {
  EMAIL: "Email",
  PASSWORD: "Mật khẩu",
  NAME: "Tên",
  DESCRIPTION: "Mô tả",
  POINTS: "Điểm",
  NOTES: "Ghi chú",
  DATE: "Ngày",
  TIME: "Thời gian",
  STATUS: "Trạng thái",
  ROLE: "Vai trò",
  MEMBER: "Thành viên",
  MEMBERS: "Thành viên",
  GROUP: "Nhóm",
  GROUPS: "Nhóm",
  RULE: "Quy tắc",
  RULES: "Quy tắc",
  SCORE: "Điểm",
  SCORES: "Điểm",
  TOTAL: "Tổng",
  AVERAGE: "Trung bình",
  COUNT: "Số lượng",
  CREATED_AT: "Ngày tạo",
  UPDATED_AT: "Ngày cập nhật",
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
  YOUR_GROUPS: "Nhóm của bạn",
  CREATE_GROUP: "Tạo nhóm",
  ALL_GROUPS: "Tất cả nhóm",
  ACTIVE_ONLY: "Chỉ hoạt động",
  INACTIVE_ONLY: "Chỉ không hoạt động",
  TOTAL_GROUPS: "Tổng số nhóm",
  TOTAL_MEMBERS: "Tổng thành viên",
  FILTER_BY_STATUS: "Lọc theo trạng thái",
  CREATED_BY: "Tạo bởi",
  CREATED: "Tạo",
  VIEW_DETAILS: "Xem chi tiết",
  THIS_PAGE: "Trang này",
  CURRENT_PAGE: "Trang hiện tại",
  YOUR_ROLE: "Vai trò của bạn",
  VIEW_PERMISSIONS: "Quyền xem",
  ACTION_TYPE: "Loại hành động",
  START_DATE: "Ngày bắt đầu",
  END_DATE: "Ngày kết thúc",
  PAGINATION_PREVIOUS: "Trước",
  PAGINATION_NEXT: "Tiếp theo",
  FILTERS: "Bộ lọc",
  CLEAR_ALL: "Xóa tất cả",
  TOTAL_GROUPS_DISPLAY: "{count} tổng số nhóm",
};

// Common messages
export const MESSAGES = {
  SUCCESS: {
    CREATED: "Tạo thành công!",
    UPDATED: "Cập nhật thành công!",
    DELETED: "Xóa thành công!",
    SAVED: "Lưu thành công!",
    SIGNED_IN: "Đăng nhập thành công!",
    SIGNED_OUT: "Đăng xuất thành công!",
  },
  ERROR: {
    FAILED_TO_LOAD: "Không thể tải dữ liệu",
    FAILED_TO_CREATE: "Không thể tạo",
    FAILED_TO_UPDATE: "Không thể cập nhật",
    FAILED_TO_DELETE: "Không thể xóa",
    ACCESS_DENIED: "Truy cập bị từ chối",
    INVALID_INPUT: "Dữ liệu không hợp lệ",
    REQUIRED_FIELD: "Trường này là bắt buộc",
    SOMETHING_WENT_WRONG: "Đã xảy ra lỗi",
    NAME_REQUIRED: "Tên là bắt buộc",
    ACTIVITY_LOGS_LOAD_FAILED: "Không thể tải nhật ký hoạt động",
  },
  CONFIRM: {
    DELETE: "Bạn có chắc chắn muốn xóa không?",
    LEAVE: "Bạn có chắc chắn muốn rời khỏi không?",
    TRANSFER_OWNERSHIP: "Bạn có chắc chắn muốn chuyển quyền sở hữu không?",
  },
  OWNER_TRANSFER: {
    NO_ELIGIBLE_MEMBERS:
      "Không tìm thấy thành viên đủ điều kiện. Thêm thành viên để chuyển quyền sở hữu.",
    TRANSFER_OWNERSHIP: "Chuyển quyền sở hữu nhóm",
    TRANSFER_DESCRIPTION:
      'Chuyển quyền sở hữu "{groupName}" cho thành viên khác',
    SELECT_NEW_OWNER: "Chọn chủ sở hữu mới",
    TRANSFER_SUMMARY: "Tóm tắt chuyển giao",
    NEW_OWNER: "Chủ sở hữu mới",
    YOUR_NEW_ROLE: "Vai trò mới của bạn",
    CONFIRMATION_TEXT:
      "Tôi hiểu rằng hành động này là vĩnh viễn và tôi sẽ trở thành quản trị viên sau khi chuyển giao",
    THIS_ACTION_PERMANENT: "Hành động này là vĩnh viễn",
    PERMANENT_DESCRIPTION:
      "Một khi bạn chuyển quyền sở hữu, bạn sẽ trở thành quản trị viên và không thể hoàn tác hành động này. Chủ sở hữu mới sẽ có toàn quyền kiểm soát nhóm.",
  },
};

// Activity types translations
export const ACTIVITY_TYPES = {
  USER_REGISTERED: "Người dùng đã đăng ký",
  USER_LOGIN: "Người dùng đã đăng nhập",
  LOGIN_FAILED: "Đăng nhập thất bại",
  PASSWORD_RESET_REQUESTED: "Yêu cầu đặt lại mật khẩu",
  PASSWORD_RESET_COMPLETED: "Đặt lại mật khẩu hoàn tất",
  ADMIN_USER_CREATED: "Quản trị viên tạo người dùng",
  ADMIN_USER_ROLE_UPDATED: "Quản trị viên cập nhật vai trò người dùng",
  ADMIN_USER_DELETED: "Quản trị viên xóa người dùng",
  ADMIN_PASSWORD_RESET_BY_ADMIN: "Quản trị viên đặt lại mật khẩu",
  GROUP_CREATED: "Nhóm đã được tạo",
  GROUP_UPDATED: "Nhóm đã được cập nhật",
  GROUP_DELETED: "Nhóm đã bị xóa",
  MEMBER_INVITED: "Thành viên được mời",
  MEMBER_JOINED: "Thành viên đã tham gia",
  MEMBER_ADDED: "Thành viên được thêm",
  MEMBER_REMOVED: "Thành viên bị xóa",
  MEMBER_ROLE_UPDATED: "Vai trò thành viên được cập nhật",
  OWNERSHIP_TRANSFERRED: "Quyền sở hữu được chuyển giao",
  SCORING_RULE_CREATED: "Quy tắc chấm điểm được tạo",
  SCORING_RULE_UPDATED: "Quy tắc chấm điểm được cập nhật",
  SCORING_RULE_TOGGLED: "Quy tắc chấm điểm được bật/tắt",
  SCORING_RULE_DELETED: "Quy tắc chấm điểm bị xóa",
  RULE_ADDED_TO_GROUP: "Quy tắc được thêm vào nhóm",
  RULE_REMOVED_FROM_GROUP: "Quy tắc bị xóa khỏi nhóm",
  SCORE_RECORDED: "Điểm được ghi nhận",
  SCORE_UPDATED: "Điểm được cập nhật",
  SCORE_DELETED: "Điểm bị xóa",
};

// Time periods
export const PERIODS = {
  WEEK: "Tuần",
  MONTH: "Tháng",
  YEAR: "Năm",
  TODAY: "Hôm nay",
  YESTERDAY: "Hôm qua",
  THIS_WEEK: "Tuần này",
  THIS_MONTH: "Tháng này",
  THIS_YEAR: "Năm nay",
  LAST_WEEK: "Tuần trước",
  LAST_MONTH: "Tháng trước",
  LAST_YEAR: "Năm trước",
  CUSTOM: "Tùy chỉnh",
};

// Placeholders
export const PLACEHOLDERS = {
  ENTER_EMAIL: "Nhập email",
  ENTER_PASSWORD: "Nhập mật khẩu",
  ENTER_NAME: "Nhập tên",
  ENTER_DESCRIPTION: "Nhập mô tả",
  SEARCH: "Tìm kiếm...",
  SEARCH_GROUPS: "Tìm kiếm nhóm...",
  SELECT: "Chọn...",
  CHOOSE_MEMBER: "Chọn thành viên...",
  OPTIONAL: "Tùy chọn",
  ALL_ACTIONS: "Tất cả hành động",
};

// Page titles
export const PAGE_TITLES = {
  DASHBOARD: "Bảng điều khiển",
  GROUPS: "Quản lý nhóm",
  GROUP_DETAILS: "Chi tiết nhóm",
  CREATE_GROUP: "Tạo nhóm mới",
  EDIT_GROUP: "Chỉnh sửa nhóm",
  SCORING_RULES: "Quy tắc chấm điểm",
  RECORD_SCORE: "Ghi điểm",
  ANALYTICS: "Phân tích",
  ACTIVITY_LOGS: "Nhật ký hoạt động",
  ADMIN_USERS: "Quản lý người dùng",
  ACCOUNT_SETTINGS: "Cài đặt tài khoản",
  SIGN_IN: "Đăng nhập",
};

// Descriptions
export const DESCRIPTIONS = {
  GROUP_SCORING_SYSTEM: "Hệ thống chấm điểm nhóm",
  WELCOME_BACK: "Chào mừng trở lại",
  NO_DATA: "Không có dữ liệu",
  LOADING: "Đang tải...",
  NO_RESULTS: "Không tìm thấy kết quả",
  NO_GROUPS_FOUND: "Không tìm thấy nhóm",
  CREATE_FIRST_GROUP: "Tạo nhóm đầu tiên để bắt đầu với hoạt động chấm điểm",
  ADJUST_SEARCH_FILTER: "Thử điều chỉnh tiêu chí tìm kiếm hoặc lọc.",
  CREATE_YOUR_FIRST_GROUP: "Tạo nhóm đầu tiên của bạn",
  NO_ACTIVITY_LOGS_FOUND: "Không tìm thấy nhật ký hoạt động",
  TRY_ADJUSTING_FILTER: "Thử điều chỉnh tiêu chí lọc.",
  NO_ACTIVITIES_RECORDED: "Chưa có hoạt động nào được ghi lại.",
  AUTHENTICATION_REQUIRED: "Yêu cầu xác thực",
  PLEASE_SIGN_IN: "Vui lòng đăng nhập để xem nhật ký hoạt động.",
  SHOWING_NOW: "Đang hiển thị",
  CURRENT_PAGE: "Trang hiện tại",
  VIEW_PERMISSIONS: "Quyền xem",
  RECENT_ACTIVITY: "Hoạt động gần đây",
  SYSTEM_ACTIVITIES: "Hoạt động hệ thống và hành động của người dùng",
  VIEW_DETAILS: "Xem chi tiết",
  CHOOSE_MEMBER: "Chọn thành viên",
  UNKNOWN_USER: "Người dùng không xác định",
  TRY_AGAIN: "Thử lại",
  SHOWING_RESULTS: "Hiển thị {start} đến {end} của {total} kết quả",
  TOTAL_LOGS: "Tổng nhật ký",
  ACTIVITY_RECORDS: "Bản ghi hoạt động",
  LOADING_ACTIVITY_LOGS: "Đang tải nhật ký hoạt động...",
  SYSTEM_ACTIVITIES_USER_ACTIONS:
    "Hoạt động hệ thống và hành động của người dùng",
  TRY_ADJUSTING_FILTER_CRITERIA: "Thử điều chỉnh tiêu chí lọc.",
  NO_ACTIVITIES_RECORDED_YET: "Chưa có hoạt động nào được ghi lại.",
  SHOWING_RANGE_RESULTS: "Hiển thị {start} đến {end} của {total} kết quả",
  RECORDS_RELATED_TO_ME: "Record liên quan đến tôi",
  GROUP_STATS: "Tổ Stats",
};

// Component-specific translations
export const COMPONENTS = {
  GROUP_FORM: {
    TITLE_CREATE: "Tạo nhóm mới",
    TITLE_EDIT: "Chỉnh sửa nhóm",
    DESCRIPTION_CREATE:
      "Tạo nhóm mới để bắt đầu tổ chức các hoạt động chấm điểm của bạn.",
    DESCRIPTION_EDIT: "Thay đổi thông tin nhóm của bạn.",
    LABEL_NAME: "Tên nhóm *",
    LABEL_DESCRIPTION: "Mô tả",
    PLACEHOLDER_NAME: "Nhập tên nhóm",
    PLACEHOLDER_DESCRIPTION: "Nhập mô tả nhóm (tùy chọn)",
    DESCRIPTION_NAME: "Tên duy nhất để xác định nhóm của bạn",
    DESCRIPTION_DESCRIPTION:
      "Mô tả tùy chọn để giúp thành viên hiểu mục đích của nhóm",
    BUTTON_CREATE: "Tạo nhóm",
    BUTTON_UPDATE: "Cập nhật nhóm",
    BUTTON_CANCEL: "Hủy",
    ERROR_ID_REQUIRED: "ID nhóm là bắt buộc để chỉnh sửa",
    LOG_PREFIX: "Lỗi biểu mẫu nhóm:",
  },
  RULE_CREATION: {
    TITLE_CREATE: "Tạo quy tắc chấm điểm mới",
    TITLE_EDIT: "Chỉnh sửa quy tắc chấm điểm",
    DESCRIPTION:
      "Định nghĩa quy tắc chấm điểm mới có thể được sử dụng trong tất cả các nhóm",
    SECTION_BASIC_INFO: "Thông tin cơ bản",
    LABEL_RULE_NAME: "Tên quy tắc *",
    LABEL_POINTS: "Điểm *",
    LABEL_DESCRIPTION: "Mô tả",
    PLACEHOLDER_NAME: "VD: Hoàn thành nhiệm vụ, Tham gia",
    PLACEHOLDER_POINTS: "VD: 10 cho thưởng, -5 cho phạt",
    PLACEHOLDER_DESCRIPTION:
      "Mô tả quy tắc này dùng để làm gì và khi nào nên áp dụng...",
    DESCRIPTION_POINTS: "Dùng số dương cho thưởng, số âm cho phạt",
    SECTION_SCORING_CRITERIA: "Tiêu chí chấm điểm",
    CRITERIA_MANUAL: "Chọn thủ công",
    CRITERIA_AUTOMATIC: "Điều kiện tự động",
    BADGE_MANUAL: "Thủ công",
    BADGE_AUTOMATIC: "Tự động",
    DESCRIPTION_MANUAL: "Thành viên sẽ chọn quy tắc này thủ công khi ghi điểm",
    DESCRIPTION_AUTOMATIC: "Điểm sẽ được tính tự động dựa trên điều kiện",
    LABEL_CONDITIONS: "Điều kiện",
    BUTTON_ADD_CONDITION: "Thêm điều kiện",
    PLACEHOLDER_FIELD: "Trường",
    PLACEHOLDER_VALUE: "Giá trị",
    OPERATOR_EQUALS: "bằng",
    OPERATOR_NOT_EQUALS: "không bằng",
    OPERATOR_GREATER_THAN: "lớn hơn",
    OPERATOR_LESS_THAN: "nhỏ hơn",
    OPERATOR_CONTAINS: "chứa",
    NO_CONDITIONS:
      "Chưa có điều kiện nào. Thêm điều kiện để tự động kích hoạt quy tắc này.",
    MANUAL_DESCRIPTION:
      "Quy tắc này sẽ xuất hiện trong danh sách chọn quy tắc khi thành viên ghi điểm thủ công.",
    BUTTON_CREATE: "Tạo quy tắc",
    BUTTON_UPDATE: "Cập nhật quy tắc",
    BUTTON_CANCEL: "Hủy",
    LOADING: "Đang lưu...",
    ERROR_NAME_REQUIRED: "Tên quy tắc là bắt buộc",
    ERROR_INVALID_POINTS:
      "Vui lòng nhập số hợp lệ cho điểm (dương cho thưởng, âm cho phạt)",
    SUCCESS_CREATED: 'Quy tắc "{name}" đã được tạo thành công!',
    SUCCESS_UPDATED: 'Quy tắc "{name}" đã được cập nhật thành công!',
    ERROR_CREATE: "Không thể tạo quy tắc",
    ERROR_UPDATE: "Không thể tạo quy tắc",
    AUTO_ADD_TO_GROUPS_CHECKBOX: "Tự động thêm vào tất cả các nhóm",
    AUTO_ADD_TO_GROUPS_DESCRIPTION:
      "Quy tắc sẽ được tự động thêm vào tất cả các nhóm mà bạn có quyền truy cập",
  },
  MEMBER_INVITE: {
    TITLE: "Thêm thành viên",
    DESCRIPTION:
      "Thêm thành viên mới vào nhóm. Người dùng có thể đăng nhập bằng tài khoản hiện có.",
    LABEL_EMAIL: "Địa chỉ email *",
    LABEL_ROLE: "Vai trò *",
    PLACEHOLDER_SEARCH: "Tìm kiếm người dùng...",
    PLACEHOLDER_SEARCH_INPUT: "Tìm theo tên hoặc email...",
    DESCRIPTION_EMAIL: "Tìm và chọn người dùng trong hệ thống",
    PLACEHOLDER_ROLE: "Chọn vai trò",
    DESCRIPTION_ROLE:
      "Thành viên có thể ghi điểm. Quản trị viên còn có thể quản lý nhóm.",
    BUTTON_ADD: "Thêm thành viên",
    BUTTON_CANCEL: "Huỷ",
    LOADING_USERS: "Đang tải danh sách người dùng...",
    LOADING_SEARCH: "Đang tìm kiếm...",
    NO_USERS_FOUND: "Không tìm thấy người dùng nào",
    GROUP_HEADING_SEARCH: "Kết quả tìm kiếm",
    GROUP_HEADING_ALL: "Tất cả người dùng hiện có",
    ERROR_SEARCH: "Không thể tìm kiếm người dùng",
    SUCCESS_ADDED: "Thêm thành viên thành công!",
    ERROR_ADD: "Không thể thêm thành viên",
    ERROR_PREFIX: "Lỗi thêm thành viên:",
    MANAGEMENT_TITLE: "Quản lý thành viên",
    MANAGEMENT_DESCRIPTION:
      "Xem và quản lý thành viên trong nhóm. Bạn có thể cập nhật vai trò hoặc xoá thành viên.",
    NO_MEMBERS: "Không có thành viên nào trong nhóm này.",
    JOINED_DATE: "Tham gia ngày {date}",
    CONFIRM_REMOVE: "Bạn có chắc muốn xoá {email} khỏi nhóm này không?",
    BUTTON_REMOVE: "Xoá",
    BUTTON_CLOSE: "Đóng",
    SUCCESS_ROLE_UPDATE: "Cập nhật vai trò thành viên thành công",
    SUCCESS_MEMBER_REMOVED: "Xoá thành viên thành công",
    ERROR_ROLE_UPDATE: "Không thể cập nhật vai trò thành viên",
    ERROR_MEMBER_REMOVED: "Không thể xoá thành viên",
    ERROR_PREFIX_ROLE: "Không thể cập nhật vai trò thành viên:",
    ERROR_PREFIX_REMOVE: "Không thể xoá thành viên:",
  },
};

// Validation messages
export const VALIDATION = {
  GROUP: {
    NAME_REQUIRED: "Tên nhóm là bắt buộc",
    NAME_TOO_LONG: "Tên nhóm phải ít hơn 100 ký tự",
    DESCRIPTION_TOO_LONG: "Mô tả phải ít hơn 500 ký tự",
  },
  MEMBER: {
    EMAIL_REQUIRED: "Vui lòng nhập email",
    EMAIL_INVALID: "Vui lòng nhập địa chỉ email hợp lệ",
    ROLE_REQUIRED: "Vui lòng chọn vai trò",
  },
  USER: {
    EMAIL_PASSWORD_REQUIRED: "Email và mật khẩu là bắt buộc",
    PASSWORD_MISMATCH: "Mật khẩu không khớp",
    PASSWORD_INSUFFICIENT: "Mật khẩu không đáp ứng đủ yêu cầu",
  },
};

// User management
export const USER_MANAGEMENT = {
  CREATE_USER: {
    TITLE: "Tạo người dùng mới",
    DESCRIPTION: "Thêm người dùng mới vào hệ thống",
    USER_INFO: "Thông tin người dùng",
    USER_INFO_DESCRIPTION:
      "Điền thông tin chi tiết để tạo tài khoản người dùng mới",
    BACK_TO_LIST: "Quay lại danh sách người dùng",
    BACK_TO_MANAGEMENT: "Quay lại quản lý người dùng",
    GENERATE_SECURE_PASSWORD: "Tạo mật khẩu bảo mật",
    GENERATE_STRONG_RANDOM: "Tạo mật khẩu ngẫu nhiên mạnh",
    COPY_TO_CLIPBOARD: "Sao chép mật khẩu vào clipboard",
    COPIED: "Đã sao chép!",
    PASSWORD_STRENGTH: "Độ mạnh mật khẩu",
    MINIMUM_8_CHARS: "Ít nhất 8 ký tự",
    ONE_UPPERCASE: "Một chữ cái viết hoa",
    ONE_LOWERCASE: "Một chữ cái viết thường",
    ONE_DIGIT: "Một chữ số",
    ONE_SPECIAL_CHAR: "Một ký tự đặc biệt",
    PASSWORD_STRENGTH_VERY_WEAK: "Rất yếu",
    PASSWORD_STRENGTH_WEAK: "Yếu",
    PASSWORD_STRENGTH_MEDIUM: "Trung bình",
    PASSWORD_STRENGTH_GOOD: "Tốt",
    PASSWORD_STRENGTH_STRONG: "Mạnh",
    REQUIREMENT_CHECKLIST: "Yêu cầu mật khẩu:",
    ROLE_ADMIN_DESCRIPTION:
      "Quản trị viên có thể quản lý người dùng, nhóm và cài đặt hệ thống",
    ROLE_USER_DESCRIPTION:
      "Người dùng có thể tạo và quản lý nhóm cũng như hệ thống chấm điểm",
    CANCEL_AND_BACK: "Hủy và quay lại danh sách người dùng",
    CREATING: "Đang tạo...",
    CREATE_USER: "Tạo người dùng",
    CREATING_ACCOUNT: "Đang tạo tài khoản người dùng...",
    PASSWORD_MUST_MATCH: "Mật khẩu phải khớp",
    CREATE_USER_ACCOUNT: "Tạo tài khoản người dùng",
    SUCCESS_MESSAGE: "Người dùng {email} đã được tạo thành công!",
    ERROR_CREATE_USER: "Không thể tạo người dùng",
    PASSWORD_MISMATCH_ERROR: "Mật khẩu không khớp",
    PASSWORD_MEETS_REQUIREMENTS: "Mật khẩu không đáp ứng đủ yêu cầu",
    PASSWORD_COPIED_SUCCESS: "Đã tạo mật khẩu an toàn!",
    PASSWORD_COPIED_CLIPBOARD: "Đã sao chép mật khẩu vào clipboard!",
    CANNOT_COPY_PASSWORD: "Không thể sao chép mật khẩu",
    CONFIRM_PASSWORD: "Xác nhận mật khẩu",
    CONFIRM_PASSWORD_PLACEHOLDER: "Xác nhận mật khẩu",
    PASSWORD_MATCHES: "✓ Mật khẩu khớp",
    REQUIRED_FIELD: "Trường này là bắt buộc",
    ACCESS_DENIED_ADMIN: "Truy cập bị từ chối. Cần quyền quản trị viên.",
  },
};

// Dashboard content
export const DASHBOARD = {
  OVERVIEW: {
    WELCOME_BACK:
      "Chào mừng trở lại! Đây là tổng quan về các hoạt động chấm điểm của bạn.",
    AUTHENTICATION_REQUIRED: "Yêu cầu xác thực",
    PLEASE_SIGNIN_ACCESS: "Vui lòng đăng nhập để truy cập bảng điều khiển.",
    DASHBOARD_LOAD_ERROR: "Lỗi tải bảng điều khiển",
    RELOAD_DASHBOARD: "Thử lại",
    TOTAL_GROUPS_STAT: "Tổng số nhóm",
    TOTAL_GROUPS_DESC: "Nhóm đang hoạt động bạn tham gia",
    SCORE_RECORDS_STAT: "Bản ghi điểm",
    SCORE_RECORDS_DESC: "Tổng số điểm đã ghi",
    TOTAL_POINTS_STAT: "Tổng điểm",
    TOTAL_POINTS_DESC: "Tất cả các hoạt động",
    ACTIVITY_STAT: "Hoạt động",
    ACTIVITY_DESC: "Hoạt động gần đây",
    TOTAL_ACTIVITY_DESC: "Tổng hoạt động",
    YOUR_GROUPS_SECTION: "Nhóm của bạn",
    NO_GROUPS_YET: "Bạn chưa tham gia nhóm nào.",
    CREATE_GROUP: "Tạo nhóm",
    QUICK_ACTIONS: "Thao tác nhanh",
    CREATE_NEW_GROUP: "Tạo nhóm mới",
    MANAGE_GROUPS: "Quản lý nhóm",
    VIEW_SCORING_RULES: "Xem quy tắc chấm điểm",
    RECENT_ACTIVITY: "Hoạt động gần đây",
    SCORING_RULES_GROUP_SELECT: "Chọn nhóm cho quy tắc chấm điểm",
    SCORING_RULES_GROUP_DESC:
      "Chọn một nhóm để xem và quản lý quy tắc chấm điểm của nó.",
    VIEW_ALL: "Xem tất cả {count} nhóm",
  },
};

// Global Rules translations
export const GLOBAL_RULES = {
  CREATE_GLOBAL_RULE: "Tạo quy tắc toàn cục",
  GLOBAL_SCORING_RULES: "Quy tắc chấm điểm toàn cục",
  MANAGE_GLOBAL_RULES:
    "Quản lý quy tắc chấm điểm toàn cục có sẵn trong tất cả các nhóm",
  VIEW_ALL_RULES: "Xem tất cả {count} quy tắc",
  NO_DESCRIPTION: "Không có mô tả",
  POINTS: "điểm",
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
};

// Groups page
export const GROUPS_PAGE = {
  TITLE: "Nhóm",
  DESCRIPTION: "Quản lý nhóm và tổ chức các hoạt động chấm điểm",
  LOADING_GROUPS_ERROR: "Lỗi tải danh sách nhóm",
  RELOAD_GROUPS: "Thử lại",
  AUTHENTICATION_REQUIRED: "Yêu cầu xác thực",
  PLEASE_SIGNIN_GROUPS: "Vui lòng đăng nhập để truy cập nhóm của bạn.",
  TOTAL_GROUPS_STAT: "Tổng số nhóm",
  TOTAL_GROUPS_ACTIVE: "{count} hoạt động",
  TOTAL_MEMBERS_STAT: "Tổng thành viên",
  TOTAL_MEMBERS_DESC: "Trên tất cả nhóm",
  SCORE_RECORDS_STAT: "Bản ghi điểm",
  SCORE_RECORDS_DESC: "Tổng số đã ghi",
  YOUR_ROLE_STAT: "Vai trò của bạn",
  YOUR_ROLE_DESC: "Cấp quyền hiện tại",
  YOUR_ROLE_ADMIN: "Quản trị viên",
  YOUR_ROLE_USER: "Người dùng",
};

// Sign in page
export const SIGNIN = {
  WELCOME_BACK: "Chào mừng trở lại",
  LOGIN_TO_GROUP_SYSTEM: "Đăng nhập vào Hệ thống chấm điểm nhóm",
  ENTER_EMAIL: "Nhập email của bạn",
  ENTER_PASSWORD: "Nhập mật khẩu của bạn",
  SIGNIN: "Đăng nhập",
  NO_ACCOUNT_ADMIN:
    "Chưa có tài khoản? Liên hệ quản trị viên để tạo tài khoản.",
  TERMS_PRIVACY_AGREEMENT: "Bằng cách đăng nhập, bạn đồng ý với",
  TERMS_OF_SERVICE: "Điều khoản dịch vụ",
  AND: "và",
  PRIVACY_POLICY: "Chính sách bảo mật",
};

// App header
export const APP_HEADER = {
  GROUP_SCORING_SYSTEM: "Chấm Điểm Nhóm",
  OPEN_MAIN_MENU: "Mở menu chính",
};

// Score recording modal
export const SCORE_RECORDING = {
  TITLE: "Ghi điểm",
  DESCRIPTION: "Thêm bản ghi điểm mới vào {groupName}",
  LABEL_MEMBER: "Thành viên *",
  PLACEHOLDER_MEMBER: "Chọn thành viên để chấm điểm...",
  HELPER_MEMBER: "Chọn thành viên để ghi điểm",
  LABEL_RULE: "Quy tắc chấm điểm *",
  PLACEHOLDER_RULE: "Chọn quy tắc chấm điểm...",
  NO_ACTIVE_RULES:
    "Không có quy tắc chấm điểm đang hoạt động. Liên hệ quản trị viên để thêm quy tắc.",
  BADGE_POINTS: "{points} điểm",
  OVERRIDE_CHECKBOX: "Ghi đè điểm mặc định ({points} điểm)",
  LABEL_POINTS: "Điểm *",
  UNIT_POINTS: "điểm",
  WARNING_DIFFERENT:
    "ℹ️ Điểm tùy chỉnh: {customPoints} điểm (ghi đè điểm mặc định: {defaultPoints})",
  LABEL_DATE: "Ngày *",
  LABEL_NOTES: "Ghi chú (Tùy chọn)",
  PLACEHOLDER_NOTES: "Thêm thông tin bổ sung về điểm này...",
  CHARACTER_COUNT: "{count}/500 ký tự",
  BUTTON_CANCEL: "Hủy",
  BUTTON_LOADING: "Đang ghi...",
  BUTTON_SAVE: "Ghi điểm",
  VALIDATION: {
    SELECT_MEMBER: "Vui lòng chọn thành viên",
    SELECT_RULE: "Vui lòng chọn quy tắc chấm điểm",
    VALID_POINTS: "Vui lòng nhập điểm hợp lệ",
    POINTS_GREATER_THAN_ZERO: "Điểm phải lớn hơn 0",
  },
  MESSAGES: {
    SUCCESS: "Đã ghi {points} điểm thành công!",
    ERROR_LOG_PREFIX: "Ghi điểm thất bại:",
    ERROR_GENERAL: "Không thể ghi điểm",
    CONFIRM_OVERRIDE:
      'Bạn đang ghi {customPoints} điểm nhưng quy tắc "{ruleName}" thường cho {defaultPoints} điểm. Tiếp tục?',
  },
};

// User account menu
export const USER_ACCOUNT = {
  USER_ALT: "Người dùng",
  USER_FALLBACK: "Người dùng",
  MENU_PROFILE: "Hồ sơ",
  MENU_SETTINGS: "Cài đặt",
  MENU_ACTIVITY_LOGS: "Nhật ký hoạt động",
  MENU_SIGN_OUT: "Đăng xuất",
  TOAST_SUCCESS: "Đăng xuất thành công",
  TOAST_ERROR: "Không thể đăng xuất",
  ERROR_LOG_PREFIX: "Lỗi đăng xuất:",
};

// Admin user management
export const ADMIN_USERS = {
  PAGE_TITLE: "Quản lý người dùng",
  PAGE_DESCRIPTION: "Quản lý người dùng hệ thống và vai trò của họ",
  BUTTON_CREATE_USER: "Tạo người dùng",
  TOOLTIP_CREATE_USER: "Tạo tài khoản người dùng mới",
  STATS: {
    TOTAL_USERS: "Tổng số người dùng",
    ADMINISTRATORS: "Quản trị viên",
    REGULAR_USERS: "Người dùng thông thường",
  },
  FILTERS: {
    TITLE: "Bộ lọc",
    SEARCH_PLACEHOLDER: "Tìm theo tên hoặc email...",
    TOOLTIP_SEARCH: "Tìm kiếm người dùng",
    ROLE_FILTER: "Lọc theo vai trò",
    ALL_ROLES: "Tất cả vai trò",
    ADMIN_ROLE: "Quản trị viên",
    USER_ROLE: "Người dùng",
  },
  USERS_TABLE: {
    TITLE: "Người dùng",
    DESCRIPTION: "Tổng cộng {count} người dùng",
    HEADERS: {
      NAME: "Họ tên",
      EMAIL: "Email",
      ROLE: "Vai trò",
      CREATED_DATE: "Ngày tạo",
      STATS: "Thống kê",
      ACTIONS: "Thao tác",
    },
    TOOLTIPS: {
      EDIT_ROLE: "Chỉnh sửa vai trò người dùng",
      CANNOT_EDIT_OWN_ROLE: "Không thể sửa vai trò của chính bạn",
      RESET_PASSWORD: "Đặt lại mật khẩu người dùng",
      DELETE_USER: "Xoá người dùng",
      CANNOT_DELETE_OWN_ACCOUNT: "Không thể xoá tài khoản của chính bạn",
    },
  },
  PAGINATION: {
    PAGE_INFO: "Trang {current}/{total}",
    PREVIOUS: "Trước",
    NEXT: "Sau",
    TOOLTIP_PREVIOUS: "Đến trang trước",
    TOOLTIP_NEXT: "Đến trang tiếp theo",
  },
  LOADING: {
    LOADING_USERS: "Đang tải danh sách người dùng...",
  },
  DIALOGS: {
    DELETE: {
      TITLE: "Xoá người dùng",
      DESCRIPTION:
        "Bạn có chắc chắn muốn xoá {name}? Hành động này không thể hoàn tác.",
      BUTTON_CANCEL: "Huỷ",
      BUTTON_DELETE: "Xoá",
    },
    UPDATE_ROLE: {
      TITLE: "Cập nhật vai trò người dùng",
      DESCRIPTION: "Thay đổi vai trò cho {name}",
      CURRENT_ROLE: "Vai trò hiện tại",
      NEW_ROLE: "Vai trò mới",
      ROLE_PLACEHOLDER: "Chọn vai trò",
      BUTTON_CANCEL: "Huỷ",
      BUTTON_UPDATE: "Cập nhật vai trò",
    },
    RESET_PASSWORD: {
      TITLE: "Đặt lại mật khẩu",
      DESCRIPTION: "Đặt mật khẩu mới cho {name}",
      NEW_PASSWORD: "Mật khẩu mới",
      PASSWORD_PLACEHOLDER: "Nhập mật khẩu mới",
      TOGGLE_SHOW: "Hiện",
      TOGGLE_HIDE: "Ẩn",
      PASSWORD_REQUIREMENTS:
        "Phải có ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
      BUTTON_CANCEL: "Huỷ",
      BUTTON_RESET: "Đặt lại mật khẩu",
    },
  },
  TOOLTIPS: {
    STATS_GROUPS: "Nhóm",
    STATS_MEMBERSHIPS: "Tham gia nhóm",
    STATS_SCORES: "Điểm",
  },
  FORMATS: {
    NO_DATA: "Không có",
  },
  VALIDATION: {
    ACCESS_DENIED: "Từ chối truy cập. Cần quyền quản trị.",
  },
  MESSAGES: {
    SUCCESS: {
      USER_DELETED: "Xoá người dùng thành công",
      ROLE_UPDATED: "Cập nhật vai trò người dùng thành công",
      PASSWORD_RESET: "Đặt lại mật khẩu thành công",
    },
    ERROR: {
      LOAD_USERS_FAILED: "Lỗi tải danh sách người dùng:",
      DELETE_USER_FAILED: "Lỗi xóa người dùng:",
      UPDATE_ROLE_FAILED: "Lỗi cập nhật vai trò:",
      RESET_PASSWORD_FAILED: "Lỗi đặt lại mật khẩu:",
      TOAST: {
        LOAD_USERS_FAILED: "Không thể tải danh sách người dùng",
        DELETE_USER_FAILED: "Không thể xoá người dùng",
        UPDATE_ROLE_FAILED: "Không thể cập nhật vai trò",
        RESET_PASSWORD_FAILED: "Không thể đặt lại mật khẩu",
      },
    },
  },
};

// API response messages
export const API = {
  ERROR: {
    UNAUTHORIZED: "Chưa được xác thực",
    ACCESS_DENIED: "Truy cập bị từ chối",
    FORBIDDEN: "Không có quyền truy cập",
    NOT_FOUND: "Không tìm thấy",
    INTERNAL_SERVER_ERROR: "Lỗi máy chủ nội bộ",
    INVALID_INPUT: "Dữ liệu không hợp lệ",
    REQUIRED_FIELD: "Trường này là bắt buộc",
    INVALID_EMAIL: "Định dạng email không hợp lệ",
    EMAIL_EXISTS: "Email đã được đăng ký",
    PASSWORD_TOO_WEAK: "Mật khẩu không đáp ứng yêu cầu",
    PASSWORD_COMMON:
      "Mật khẩu này quá phổ biến. Vui lòng chọn mật khẩu an toàn hơn.",
    INVALID_DATE_FORMAT: "Định dạng ngày không hợp lệ",
    INVALID_POINTS: "Điểm phải là một số hợp lệ",
    NAME_EXISTS: "Tên này đã tồn tại",
    NAME_EXISTS_IN_GROUP: "Tên quy tắc này đã tồn tại trong nhóm",
    NAME_EXISTS_SYSTEM: "Tên quy tắc này đã tồn tại trên toàn hệ thống",
    DUPLICATE_NAME: "Bạn đã có một nhóm với tên này",
    USER_NOT_FOUND: "Không tìm thấy người dùng",
    GROUP_NOT_FOUND: "Không tìm thấy nhóm",
    MEMBER_NOT_FOUND: "Không tìm thấy thành viên",
    RULE_NOT_FOUND: "Không tìm thấy quy tắc chấm điểm",
    SCORE_NOT_FOUND: "Không tìm thấy bản ghi điểm",
    INVALID_USER: "Không tìm thấy người dùng",
    NOT_GROUP_MEMBER: "Bạn không phải thành viên của nhóm này",
    TARGET_NOT_GROUP_MEMBER: "Người dùng mục tiêu không thuộc nhóm này",
    RULE_INACTIVE:
      "Không tìm thấy quy tắc chấm điểm hoặc quy tắc đang bị vô hiệu",
    RULE_NOT_BELONG_TO_GROUP: "Quy tắc chấm điểm này không thuộc về nhóm",
    CANNOT_DELETE_OWNER: "Không thể xóa chủ nhóm",
    CANNOT_DELETE_GROUP_WITH_DATA:
      "Không thể xóa nhóm khi còn bản ghi điểm hoặc quy tắc chấm điểm",
    INSUFFICIENT_PERMISSIONS: "Không đủ quyền",
    ONLY_OWNER_CAN_TRANSFER: "Chỉ chủ sở hữu hiện tại mới có thể chuyển quyền",
    ALREADY_OWNER: "Bạn đã là chủ nhóm",
    ONLY_ADMIN_CREATE_GROUP: "Chỉ quản trị viên hệ thống mới có thể tạo nhóm",
    ONLY_ADMIN_CREATE_RULE: "Cần quyền quản trị viên để tạo quy tắc toàn cục",
    ONLY_ADMIN_OWNER_MANAGE_SCORES:
      "Chỉ quản trị viên hoặc chủ nhóm mới có thể ghi điểm",
    ONLY_ADMIN_OWNER_EDIT_SCORES:
      "Chỉ quản trị viên hoặc chủ nhóm mới có thể chỉnh sửa bản ghi điểm",
    ONLY_ADMIN_OWNER_DELETE_SCORES:
      "Chỉ quản trị viên hoặc chủ nhóm mới có thể xóa bản ghi điểm",
    ONLY_ADMIN_OWNER_MANAGE_RULES:
      "Chỉ quản trị viên hoặc chủ nhóm mới có thể tạo quy tắc cho nhóm này",
    ONLY_ADMIN_DELETE_RULE:
      "Chỉ quản trị viên hệ thống mới có thể xóa quy tắc chấm điểm",
    ONLY_ADMIN_UPDATE_RULE:
      "Chỉ quản trị viên hệ thống mới có thể cập nhật quy tắc chấm điểm",
    CANNOT_DELETE_RULE_WITH_RECORDS:
      "Không thể xóa quy tắc vì còn bản ghi điểm sử dụng quy tắc này",
    CANNOT_DELETE_RULE_IN_USE_BY_GROUPS:
      "Không thể xóa quy tắc vì đang được sử dụng bởi các nhóm: {groupNames}",
    RULE_NAME_REQUIRED: "Tên quy tắc là bắt buộc",
    ONLY_ADMIN_OWNER_DELETE_GROUP: "Chỉ quản trị viên nhóm mới có thể xóa nhóm",
    ALREADY_MEMBER: "Người dùng đã là thành viên của nhóm này",
    MISSING_REQUIRED_FIELDS: "Cần cung cấp {fields}",
    NEED_MEMBER_ID: "Cần cung cấp mã thành viên",
    NEED_MEMBER_ID_AND_ROLE: "Cần cung cấp mã thành viên và vai trò",
    NEED_RULE_ID: "Cần cung cấp mã quy tắc",
    NEED_GROUP_ID_RULE_ID_TARGET:
      "Cần cung cấp mã nhóm, mã quy tắc và mã người nhận điểm",
    NEED_SCORE_ID: "Cần cung cấp mã bản ghi điểm",
    NEED_ACTION_AND_DESCRIPTION: "Cần cung cấp hành động và mô tả",
    NO_GROUP_ACCESS: "Không có quyền truy cập nhóm này",
    CANNOT_CREATE_USER: "Không thể tạo người dùng",
    CANNOT_LOAD_USERS: "Không thể tải danh sách người dùng",
    CANNOT_CREATE_GROUP: "Lỗi tạo nhóm",
    CANNOT_LOAD_GROUP: "Lỗi tải danh sách nhóm",
    CANNOT_LOAD_GROUP_INFO: "Lỗi tải thông tin nhóm",
    CANNOT_UPDATE_GROUP: "Lỗi cập nhật nhóm",
    CANNOT_DELETE_GROUP: "Lỗi xóa nhóm",
    CANNOT_LOAD_MEMBERS: "Lỗi tải thành viên nhóm",
    CANNOT_ADD_MEMBER: "Lỗi thêm thành viên nhóm",
    CANNOT_UPDATE_MEMBER: "Lỗi cập nhật thành viên nhóm",
    CANNOT_REMOVE_MEMBER: "Lỗi xóa thành viên nhóm",
    CANNOT_CREATE_RULE: "Lỗi tạo quy tắc chấm điểm",
    CANNOT_LOAD_RULES: "Lỗi tải quy tắc chấm điểm",
    CANNOT_UPDATE_RULE: "Lỗi cập nhật quy tắc chấm điểm",
    CANNOT_RECORD_SCORE: "Lỗi ghi điểm",
    CANNOT_LOAD_SCORES: "Lỗi tải bản ghi điểm",
    CANNOT_UPDATE_SCORE: "Lỗi cập nhật bản ghi điểm",
    CANNOT_CREATE_ACTIVITY_LOG: "Không thể tạo nhật ký hoạt động",
    INVALID_JSON: "JSON trong nội dung yêu cầu không hợp lệ",
  },
  SUCCESS: {
    GROUP_CREATED: 'Đã tạo nhóm "{name}"',
    GROUP_UPDATED: 'Đã cập nhật nhóm "{name}"',
    GROUP_DELETED: 'Đã xóa nhóm "{name}"',
    MEMBER_ADDED: 'Đã thêm {email} với vai trò {role} vào nhóm "{groupName}"',
    MEMBER_ROLE_UPDATED:
      'Đã cập nhật vai trò của {email} thành {role} trong nhóm "{groupName}"',
    MEMBER_REMOVED: 'Đã xóa {email} khỏi nhóm "{groupName}"',
    OWNERSHIP_TRANSFERRED:
      'Đã chuyển quyền sở hữu "{groupName}" từ {fromEmail} sang {toEmail}',
    RULE_CREATED:
      'Đã tạo quy tắc chấm điểm "{ruleName}" cho nhóm "{groupName}"',
    RULE_CREATED_GLOBAL:
      'Đã tạo quy tắc chấm điểm toàn cục "{ruleName}" với {points} điểm',
    RULE_UPDATED: 'Đã cập nhật quy tắc chấm điểm "{ruleName}"',
    RULE_DELETED: 'Đã xóa quy tắc chấm điểm "{ruleName}"',
    RULE_STATUS_UPDATED: 'Đã {status} quy tắc chấm điểm "{ruleName}"',
    SCORE_RECORDED:
      'Đã ghi {points} điểm cho {userName} bằng quy tắc "{ruleName}"',
    SCORE_UPDATED: "Đã cập nhật bản ghi điểm cho {userName}: {points} điểm",
    SCORE_DELETED:
      'Đã xóa bản ghi điểm của {userName}: {points} điểm bằng quy tắc "{ruleName}"',
    USER_CREATED: "Người dùng {email} đã được tạo thành công!",
    ACTIVITY_LOG_CREATED: "Nhật ký hoạt động đã được tạo",
  },
  INFO: {
    EMAIL_REQUIRED: "Email là bắt buộc",
    PASSWORD_REQUIRED: "Mật khẩu là bắt buộc",
    NAME_REQUIRED: "Tên nhóm là bắt buộc",
    GROUP_NAME_REQUIRED: "Tên nhóm là bắt buộc",
    ID_REQUIRED: "ID là bắt buộc",
    RULE_NAME_REQUIRED: "Tên quy tắc là bắt buộc",
    RULE_POINTS_REQUIRED: "Điểm là bắt buộc",
    RULE_CRITERIA_REQUIRED: "Tiêu chí là bắt buộc",
  },
};
