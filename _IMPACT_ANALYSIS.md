# Impact Analysis: Global Admin Permissions in Score Records API

## Regression Risks
- **False Positives**: If `isGlobalAdmin` is implemented incorrectly, regular users might get admin access. (Low risk if using the existing helper).
- **Existing Admin Access**: Ensure that existing Group Admins/Owners still have access. The logic should be an OR condition.

## Backward Compatibility
- **API Contract**: The API response format remains the same.
- **Permissions**: This change expands permissions to Global Admins. It does not restrict existing permissions.

## Validation Strategy
- **Manual Verification**:
  - Test with a Global Admin account (who is NOT a group member).
  - Test with a Group Owner/Admin account.
  - Test with a regular Group Member (should fail).
  - Test with a non-member (should fail).
- **Code Review**: Verify that the `isGlobalAdmin` check is placed *before* or *in parallel with* the group membership check.
