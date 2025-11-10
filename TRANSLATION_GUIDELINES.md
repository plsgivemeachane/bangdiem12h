# Vietnamese Translation System Guidelines

## Overview

This document provides guidelines for using the Vietnamese translation system in the BangDiemLop application. The translation system centralizes all Vietnamese strings in `src/lib/translations.ts` to ensure consistency and maintainability.

## Why Use the Translation System?

- **Consistency**: All Vietnamese text is centralized in one location
- **Maintainability**: Changes to text can be made without searching through multiple files
- **Internationalization Ready**: Makes it easier to add other languages later
- **Developer Experience**: Clear patterns and type safety
- **Quality Assurance**: Centralized validation and testing

## Core Principles

### 1. Never Use Hardcoded Vietnamese Strings
❌ **DON'T:**
```typescript
toast.success('Đăng xuất thành công')
<Button>Ghi điểm</Button>
```

✅ **DO:**
```typescript
import { USER_ACCOUNT, SCORE_RECORDING } from '@/lib/translations'

toast.success(USER_ACCOUNT.TOAST_SUCCESS)
<Button>{SCORE_RECORDING.BUTTON_SAVE}</Button>
```

### 2. Import Translation Constants
Always import the necessary translation constants at the top of your component file:

```typescript
import { ACTIONS, LABELS, MESSAGES, COMPONENTS } from '@/lib/translations'
```

### 3. Use Semantic Naming
Translation keys should be semantic and descriptive:

```typescript
// Good
SCORE_RECORDING.BUTTON_SAVE
MESSAGES.SUCCESS.CREATED
VALIDATION.EMAIL_REQUIRED

// Avoid
COMPONENTS.TEXT1
GENERAL.LABEL_A
```

## Translation Structure

The translation file is organized into logical categories:

### Main Categories
- `ACTIONS` - Action verbs (Tạo, Chỉnh sửa, Xóa, etc.)
- `LABELS` - Common labels (Tên, Mô tả, Điểm, etc.)
- `MESSAGES` - Success, error, and confirmation messages
- `COMPONENTS` - Component-specific translations
- `VALIDATION` - Form validation messages
- `NAV` - Navigation items
- `USER_ROLES` - Role labels
- `GROUP_ROLES` - Group role labels

### Component-Specific Categories
- `SCORE_RECORDING` - Score recording modal
- `USER_ACCOUNT` - User account menu
- `ADMIN_USERS` - Admin user management
- `MEMBER_INVITE` - Member invitation functionality

### API Messages
- `API.ERROR` - API error messages
- `API.SUCCESS` - API success messages
- `API.INFO` - API informational messages

## Common Patterns

### Toast Messages
```typescript
// Success
toast.success(MESSAGES.SUCCESS.CREATED)

// Error with fallback
toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.SOMETHING_WENT_WRONG)
```

### Button Labels
```typescript
<Button>{ACTIONS.SAVE}</Button>
<Button variant="outline">{ACTIONS.CANCEL}</Button>
```

### Form Labels
```typescript
<Label>{LABELS.NAME} *</Label>
<Input placeholder={PLACEHOLDERS.ENTER_NAME} />
```

### Confirmation Dialogs
```typescript
const confirmMessage = MESSAGES.CONFIRM.DELETE
if (window.confirm(confirmMessage)) {
  // proceed with action
}
```

### Dynamic Content
For content that includes variables, use string replacement:
```typescript
const successMessage = API.SUCCESS.SCORE_RECORDED
  .replace('{points}', scoreRecord.points.toString())
  .replace('{userName}', userName)
  .replace('{ruleName}', ruleName)

toast.success(successMessage)
```

## Type Safety

The translation system provides TypeScript support:

```typescript
import { ACTIONS } from '@/lib/translations'

// TypeScript will provide autocompletion
ACTIONS.SAVE // ✓
ACTIONS.INVALID_KEY // ✗ TypeScript error
```

## Adding New Translations

### Step 1: Add to translations.ts
Add your translation key to the appropriate category in `src/lib/translations.ts`:

```typescript
export const COMPONENTS = {
  YOUR_COMPONENT: {
    TITLE: 'Your Component Title',
    DESCRIPTION: 'Your component description',
    BUTTON_SAVE: 'Save',
    // ... more keys
  }
}
```

### Step 2: Use in Component
```typescript
import { COMPONENTS } from '@/lib/translations'

function YourComponent() {
  return (
    <div>
      <h1>{COMPONENTS.YOUR_COMPONENT.TITLE}</h1>
      <Button>{COMPONENTS.YOUR_COMPONENT.BUTTON_SAVE}</Button>
    </div>
  )
}
```

## Best Practices

### 1. Group Related Translations
Keep related translations together in the same category:

```typescript
export const SCORE_RECORDING = {
  TITLE: 'Ghi điểm',
  BUTTON_SAVE: 'Ghi điểm',
  VALIDATION: {
    SELECT_MEMBER: 'Vui lòng chọn thành viên',
    SELECT_RULE: 'Vui lòng chọn quy tắc chấm điểm',
  }
}
```

### 2. Use Consistent Naming
Follow established naming patterns:
- `TITLE` for page/component titles
- `DESCRIPTION` for descriptions
- `BUTTON_*` for button labels
- `LABEL_*` for form labels
- `PLACEHOLDER_*` for input placeholders
- `HELP_*` for help text
- `ERROR_*` for error messages
- `SUCCESS_*` for success messages

### 3. Handle Dynamic Content
For messages that need variable substitution:
```typescript
// In translations.ts
MESSAGE_WITH_VARIABLE: 'Hello {name}, you have {count} messages'

// In component
const message = MESSAGES.MESSAGE_WITH_VARIABLE
  .replace('{name}', userName)
  .replace('{count}', messageCount.toString())
```

### 4. Provide Fallbacks
For error messages, always provide a fallback:
```typescript
toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.SOMETHING_WENT_WRONG)
```

## ESLint Integration

The project includes ESLint rules to help prevent hardcoded strings:

- `no-unescaped-entities`: Prevents unescaped characters like `<`, `>`, `{`, `}`
- Code consistency rules to encourage best practices

## File Organization

### Translation File Location
All translations are centralized in: `src/lib/translations.ts`

### Import Pattern
```typescript
// For single category
import { SCORE_RECORDING } from '@/lib/translations'

// For multiple categories
import { ACTIONS, LABELS, MESSAGES, COMPONENTS } from '@/lib/translations'

// For everything (use sparingly)
import * as TRANSLATIONS from '@/lib/translations'
```

## Common Pitfalls to Avoid

### 1. Mixed Languages
❌ Don't mix English and Vietnamese:
```typescript
<Button>Tạo {itemName}</Button>
```

✅ Use complete Vietnamese:
```typescript
<Button>{ACTIONS.CREATE} {itemName}</Button>
```

### 2. Inconsistent Spacing
❌ Don't:
```typescript
const message = 'Tên:'+ userName +'Điểm:'+ points
```

✅ Use template literals and translation keys:
```typescript
const message = `${LABELS.NAME}: ${userName} ${LABELS.POINTS}: ${points}`
```

### 3. Hardcoded in JSX
❌ Don't:
```jsx
<p>Đang tải...</p>
```

✅ Use:
```tsx
<p>{DESCRIPTIONS.LOADING}</p>
```

## Testing Translation Usage

When writing tests, you can import and test translation keys:

```typescript
import { ACTIONS, MESSAGES } from '@/lib/translations'

describe('YourComponent', () => {
  it('should display save button', () => {
    render(<YourComponent />)
    expect(screen.getByText(ACTIONS.SAVE)).toBeInTheDocument()
  })
})
```

## Migration from Hardcoded Strings

If you encounter hardcoded Vietnamese strings during development:

1. **Identify**: Find the hardcoded string
2. **Categorize**: Determine which category it belongs to
3. **Add**: Add the translation to `src/lib/translations.ts`
4. **Replace**: Replace the hardcoded string with the translation key
5. **Test**: Ensure the component still displays correctly

## Getting Help

If you need help with the translation system:

1. Check this guide first
2. Look at existing components for examples
3. Check the `src/lib/translations.ts` file for available keys
4. Ask team members for guidance

## Summary

The Vietnamese translation system is designed to:
- Centralize all Vietnamese text
- Provide type safety and consistency
- Make internationalization easier
- Improve code maintainability

By following these guidelines, we ensure that all Vietnamese text is properly managed and the application remains consistent and maintainable.