/**
 * Translation Key Reference and Validation
 * This file provides TypeScript types for translation keys to ensure type safety
 * and help with IDE autocompletion.
 */

// Main translation categories
export interface TranslationCategories {
  ACTIONS: ActionKeys
  LABELS: LabelKeys
  MESSAGES: MessageKeys
  COMPONENTS: ComponentKeys
  VALIDATION: ValidationKeys
  NAV: NavKeys
  USER_ROLES: UserRoleKeys
  GROUP_ROLES: GroupRoleKeys
  PERIODS: PeriodKeys
  PLACEHOLDERS: PlaceholderKeys
  PAGE_TITLES: PageTitleKeys
  DESCRIPTIONS: DescriptionKeys
  SCORE_RECORDING: ScoreRecordingKeys
  USER_ACCOUNT: UserAccountKeys
  ADMIN_USERS: AdminUsersKeys
  ACTIVITY_TYPES: ActivityTypeKeys
  USER_MANAGEMENT: UserManagementKeys
  DASHBOARD: DashboardKeys
  GROUPS_PAGE: GroupsPageKeys
  SIGNIN: SigninKeys
  APP_HEADER: AppHeaderKeys
  API: ApiKeys
}

// Action keys
export interface ActionKeys {
  CREATE: string
  EDIT: string
  DELETE: string
  SAVE: string
  CANCEL: string
  SUBMIT: string
  CONFIRM: string
  CLOSE: string
  ADD: string
  REMOVE: string
  UPDATE: string
  RELOAD: string
  EXPORT: string
  DOWNLOAD: string
  UPLOAD: string
  SEARCH: string
  FILTER: string
  RESET: string
  BACK: string
  NEXT: string
  VIEW: string
  MANAGE: string
  TRANSFER: string
  PREVIOUS: string
  DETAILS: string
  CHOOSE: string
  HIDE: string
  CLEAR_ALL: string
  TRY_AGAIN: string
  PREVIOUS_PAGE: string
  NEXT_PAGE: string
  CHECKING_AUTHENTICATION: string
  LOADING_DASHBOARD: string
  LOADING_GROUP_INFO: string
  LOADING_SCORE_DATA: string
  LOADING_GROUP_RULES: string
  LOADING_GROUP_MEMBERS: string
  LOADING_ANALYTICS: string
  LOADING_SETTINGS: string
  LOADING_PROFILE: string
  LOADING_USERS: string
  LOADING_USER_LIST: string
  SAVING: string
  SAVE_CHANGES: string
  SHOW_PASSWORD: string
  HIDE_PASSWORD: string
  SHOW: string
  TOGGLE_SHOW: string
  TOGGLE_HIDE: string
  APPLY_FILTER: string
  LOADING_ACTIVITIES: string
  LOADING_USER_LIST_SEARCH: string
  ACCOUNT_PROFILE: string
  MANAGE_ACCOUNT_INFO: string
  PROFILE_INFORMATION: string
  UPDATE_PERSONAL_INFO: string
  EDIT_PROFILE: string
  YOUR_STATISTICS: string
  ACTIVITY_OVERVIEW: string
  TOTAL_GROUPS_LABEL: string
  SCORE_RECORDS_LABEL: string
  TOTAL_POINTS_LABEL: string
  UNKNOWN: string
  NOT_SET: string
  VERIFIED: string
}

// Label keys
export interface LabelKeys {
  EMAIL: string
  PASSWORD: string
  NAME: string
  DESCRIPTION: string
  POINTS: string
  NOTES: string
  DATE: string
  TIME: string
  STATUS: string
  ROLE: string
  MEMBER: string
  MEMBERS: string
  GROUP: string
  GROUPS: string
  RULE: string
  RULES: string
  SCORE: string
  SCORES: string
  TOTAL: string
  AVERAGE: string
  COUNT: string
  CREATED_AT: string
  UPDATED_AT: string
  ACTIVE: string
  INACTIVE: string
  YOUR_GROUPS: string
  CREATE_GROUP: string
  ALL_GROUPS: string
  ACTIVE_ONLY: string
  INACTIVE_ONLY: string
  TOTAL_GROUPS: string
  TOTAL_MEMBERS: string
  FILTER_BY_STATUS: string
  CREATED_BY: string
  CREATED: string
  VIEW_DETAILS: string
  THIS_PAGE: string
  CURRENT_PAGE: string
  YOUR_ROLE: string
  VIEW_PERMISSIONS: string
  ACTION_TYPE: string
  START_DATE: string
  END_DATE: string
  PAGINATION_PREVIOUS: string
  PAGINATION_NEXT: string
  FILTERS: string
  CLEAR_ALL: string
  TOTAL_GROUPS_DISPLAY: string
}

// Message keys
export interface MessageKeys {
  SUCCESS: {
    CREATED: string
    UPDATED: string
    DELETED: string
    SAVED: string
    SIGNED_IN: string
    SIGNED_OUT: string
  }
  ERROR: {
    FAILED_TO_LOAD: string
    FAILED_TO_CREATE: string
    FAILED_TO_UPDATE: string
    FAILED_TO_DELETE: string
    ACCESS_DENIED: string
    INVALID_INPUT: string
    REQUIRED_FIELD: string
    SOMETHING_WENT_WRONG: string
    NAME_REQUIRED: string
    ACTIVITY_LOGS_LOAD_FAILED: string
  }
  CONFIRM: {
    DELETE: string
    LEAVE: string
    TRANSFER_OWNERSHIP: string
  }
  OWNER_TRANSFER: {
    NO_ELIGIBLE_MEMBERS: string
    TRANSFER_OWNERSHIP: string
    TRANSFER_DESCRIPTION: string
    SELECT_NEW_OWNER: string
    TRANSFER_SUMMARY: string
    NEW_OWNER: string
    YOUR_NEW_ROLE: string
    CONFIRMATION_TEXT: string
    THIS_ACTION_PERMANENT: string
    PERMANENT_DESCRIPTION: string
  }
}

// Component keys
export interface ComponentKeys {
  GROUP_FORM: {
    TITLE_CREATE: string
    TITLE_EDIT: string
    DESCRIPTION_CREATE: string
    DESCRIPTION_EDIT: string
    LABEL_NAME: string
    LABEL_DESCRIPTION: string
    PLACEHOLDER_NAME: string
    PLACEHOLDER_DESCRIPTION: string
    DESCRIPTION_NAME: string
    DESCRIPTION_DESCRIPTION: string
    BUTTON_CREATE: string
    BUTTON_UPDATE: string
    BUTTON_CANCEL: string
    ERROR_ID_REQUIRED: string
    LOG_PREFIX: string
  }
  RULE_CREATION: {
    TITLE_CREATE: string
    TITLE_EDIT: string
    DESCRIPTION: string
    SECTION_BASIC_INFO: string
    LABEL_RULE_NAME: string
    LABEL_POINTS: string
    LABEL_DESCRIPTION: string
    PLACEHOLDER_NAME: string
    PLACEHOLDER_POINTS: string
    PLACEHOLDER_DESCRIPTION: string
    DESCRIPTION_POINTS: string
    SECTION_SCORING_CRITERIA: string
    CRITERIA_MANUAL: string
    CRITERIA_AUTOMATIC: string
    BADGE_MANUAL: string
    BADGE_AUTOMATIC: string
    DESCRIPTION_MANUAL: string
    DESCRIPTION_AUTOMATIC: string
    LABEL_CONDITIONS: string
    BUTTON_ADD_CONDITION: string
    PLACEHOLDER_FIELD: string
    PLACEHOLDER_VALUE: string
    OPERATOR_EQUALS: string
    OPERATOR_NOT_EQUALS: string
    OPERATOR_GREATER_THAN: string
    OPERATOR_LESS_THAN: string
    OPERATOR_CONTAINS: string
    NO_CONDITIONS: string
    MANUAL_DESCRIPTION: string
    BUTTON_CREATE: string
    BUTTON_UPDATE: string
    BUTTON_CANCEL: string
    LOADING: string
    ERROR_NAME_REQUIRED: string
    ERROR_INVALID_POINTS: string
    SUCCESS_CREATED: string
    SUCCESS_UPDATED: string
    ERROR_CREATE: string
    ERROR_UPDATE: string
    AUTO_ADD_TO_GROUPS_CHECKBOX: string
    AUTO_ADD_TO_GROUPS_DESCRIPTION: string
  }
  MEMBER_INVITE: {
    TITLE: string
    DESCRIPTION: string
    LABEL_EMAIL: string
    LABEL_ROLE: string
    PLACEHOLDER_SEARCH: string
    PLACEHOLDER_SEARCH_INPUT: string
    DESCRIPTION_EMAIL: string
    PLACEHOLDER_ROLE: string
    DESCRIPTION_ROLE: string
    BUTTON_ADD: string
    BUTTON_CANCEL: string
    LOADING_USERS: string
    LOADING_SEARCH: string
    NO_USERS_FOUND: string
    GROUP_HEADING_SEARCH: string
    GROUP_HEADING_ALL: string
    ERROR_SEARCH: string
    SUCCESS_ADDED: string
    ERROR_ADD: string
    ERROR_PREFIX: string
    MANAGEMENT_TITLE: string
    MANAGEMENT_DESCRIPTION: string
    NO_MEMBERS: string
    JOINED_DATE: string
    CONFIRM_REMOVE: string
    BUTTON_REMOVE: string
    BUTTON_CLOSE: string
    SUCCESS_ROLE_UPDATE: string
    SUCCESS_MEMBER_REMOVED: string
    ERROR_ROLE_UPDATE: string
    ERROR_MEMBER_REMOVED: string
    ERROR_PREFIX_ROLE: string
    ERROR_PREFIX_REMOVE: string
  }
}

// Validation keys
export interface ValidationKeys {
  GROUP: {
    NAME_REQUIRED: string
    NAME_TOO_LONG: string
    DESCRIPTION_TOO_LONG: string
  }
  MEMBER: {
    EMAIL_REQUIRED: string
    EMAIL_INVALID: string
    ROLE_REQUIRED: string
  }
  USER: {
    EMAIL_PASSWORD_REQUIRED: string
    PASSWORD_MISMATCH: string
    PASSWORD_INSUFFICIENT: string
  }
}

// Score Recording keys
export interface ScoreRecordingKeys {
  TITLE: string
  DESCRIPTION: string
  LABEL_MEMBER: string
  PLACEHOLDER_MEMBER: string
  HELPER_MEMBER: string
  LABEL_RULE: string
  PLACEHOLDER_RULE: string
  NO_ACTIVE_RULES: string
  BADGE_POINTS: string
  OVERRIDE_CHECKBOX: string
  LABEL_POINTS: string
  UNIT_POINTS: string
  WARNING_DIFFERENT: string
  LABEL_DATE: string
  LABEL_NOTES: string
  PLACEHOLDER_NOTES: string
  CHARACTER_COUNT: string
  BUTTON_CANCEL: string
  BUTTON_LOADING: string
  BUTTON_SAVE: string
  VALIDATION: {
    SELECT_MEMBER: string
    SELECT_RULE: string
    VALID_POINTS: string
    POINTS_GREATER_THAN_ZERO: string
  }
  MESSAGES: {
    SUCCESS: string
    ERROR_LOG_PREFIX: string
    ERROR_GENERAL: string
    CONFIRM_OVERRIDE: string
  }
}

// User Account keys
export interface UserAccountKeys {
  USER_ALT: string
  USER_FALLBACK: string
  MENU_PROFILE: string
  MENU_SETTINGS: string
  MENU_ACTIVITY_LOGS: string
  MENU_SIGN_OUT: string
  TOAST_SUCCESS: string
  TOAST_ERROR: string
  ERROR_LOG_PREFIX: string
}

// Admin Users keys
export interface AdminUsersKeys {
  PAGE_TITLE: string
  PAGE_DESCRIPTION: string
  BUTTON_CREATE_USER: string
  TOOLTIP_CREATE_USER: string
  STATS: {
    TOTAL_USERS: string
    ADMINISTRATORS: string
    REGULAR_USERS: string
  }
  FILTERS: {
    TITLE: string
    SEARCH_PLACEHOLDER: string
    TOOLTIP_SEARCH: string
    ROLE_FILTER: string
    ALL_ROLES: string
    ADMIN_ROLE: string
    USER_ROLE: string
  }
  USERS_TABLE: {
    TITLE: string
    DESCRIPTION: string
    HEADERS: {
      NAME: string
      EMAIL: string
      ROLE: string
      CREATED_DATE: string
      STATS: string
      ACTIONS: string
    }
    TOOLTIPS: {
      EDIT_ROLE: string
      CANNOT_EDIT_OWN_ROLE: string
      RESET_PASSWORD: string
      DELETE_USER: string
      CANNOT_DELETE_OWN_ACCOUNT: string
    }
  }
  PAGINATION: {
    PAGE_INFO: string
    PREVIOUS: string
    NEXT: string
    TOOLTIP_PREVIOUS: string
    TOOLTIP_NEXT: string
  }
  LOADING: {
    LOADING_USERS: string
  }
  DIALOGS: {
    DELETE: {
      TITLE: string
      DESCRIPTION: string
      BUTTON_CANCEL: string
      BUTTON_DELETE: string
    }
    UPDATE_ROLE: {
      TITLE: string
      DESCRIPTION: string
      CURRENT_ROLE: string
      NEW_ROLE: string
      ROLE_PLACEHOLDER: string
      BUTTON_CANCEL: string
      BUTTON_UPDATE: string
    }
    RESET_PASSWORD: {
      TITLE: string
      DESCRIPTION: string
      NEW_PASSWORD: string
      PASSWORD_PLACEHOLDER: string
      TOGGLE_SHOW: string
      TOGGLE_HIDE: string
      PASSWORD_REQUIREMENTS: string
      BUTTON_CANCEL: string
      BUTTON_RESET: string
    }
  }
  TOOLTIPS: {
    STATS_GROUPS: string
    STATS_MEMBERSHIPS: string
    STATS_SCORES: string
  }
  FORMATS: {
    NO_DATA: string
  }
  VALIDATION: {
    ACCESS_DENIED: string
  }
  MESSAGES: {
    SUCCESS: {
      USER_DELETED: string
      ROLE_UPDATED: string
      PASSWORD_RESET: string
    }
    ERROR: {
      LOAD_USERS_FAILED: string
      DELETE_USER_FAILED: string
      UPDATE_ROLE_FAILED: string
      RESET_PASSWORD_FAILED: string
      TOAST: {
        LOAD_USERS_FAILED: string
        DELETE_USER_FAILED: string
        UPDATE_ROLE_FAILED: string
        RESET_PASSWORD_FAILED: string
      }
    }
  }
}

// Additional key interfaces (simplified for brevity)
export interface NavKeys { [key: string]: string }
export interface UserRoleKeys { [key: string]: string }
export interface GroupRoleKeys { [key: string]: string }
export interface PeriodKeys { [key: string]: string }
export interface PlaceholderKeys { [key: string]: string }
export interface PageTitleKeys { [key: string]: string }
export interface DescriptionKeys { [key: string]: string }
export interface ActivityTypeKeys { [key: string]: string }
export interface UserManagementKeys { [key: string]: any }
export interface DashboardKeys { [key: string]: any }
export interface GroupsPageKeys { [key: string]: any }
export interface SigninKeys { [key: string]: any }
export interface AppHeaderKeys { [key: string]: string }
export interface ApiKeys { [key: string]: any }

/**
 * Helper function to validate translation key exists
 */
export function validateTranslationKey(category: keyof TranslationCategories, key: string): boolean {
  // This would be implemented with actual validation logic
  // For now, it's a placeholder for type checking
  return true
}

/**
 * Type for accessing translation values
 */
export type TranslationValue = {
  [K in keyof TranslationCategories]: TranslationCategories[K]
}[keyof TranslationCategories]

/**
 * Helper for string replacement in translations
 */
export function replaceVariables(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match
  })
}