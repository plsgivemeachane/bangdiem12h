# Impact Analysis

## Proposed Changes
1.  **Backend**: Modify `src/app/api/groups/route.ts` (GET handler) to include `groupRules` and nested `rule` in the Prisma query.
2.  **Frontend**: Modify `src/app/dashboard/dashboard-client.tsx` to:
    - Import and implement `ScoreRecordingModal`.
    - Add logic to identify the user's admin group.
    - Add "Add Record" button to the UI.

## Regression Risks
- **Performance**: Including `groupRules` in the `GET /api/groups` query will increase the payload size.
    - *Mitigation*: The user mentioned "1 person PER Group", suggesting a low number of groups per user. The impact should be negligible.
- **UI/UX**: The "Add Record" button might clutter the interface if not placed carefully.
    - *Mitigation*: Place it "aside" the "Nhóm của bạn" header as requested, ensuring it matches existing styling (e.g., using `Button` component).

## Backward Compatibility
- The `Group` type already supports `groupRules`.
- Existing frontend code using `groups` should not be affected by the additional data, as it simply ignores extra fields unless accessed.
- `ScoreRecordingModal` is an existing component, so we are reusing tested logic.

## Validation Strategy
1.  **Manual Verification**:
    - Log in as a user who is an ADMIN of a group.
    - Verify the "Add Record" button appears next to "Nhóm của bạn".
    - Click the button and verify `ScoreRecordingModal` opens with the correct group selected.
    - Verify the "Member" and "Rule" dropdowns in the modal are populated correctly.
    - Submit a score and verify it is recorded (toast success).
    - Log in as a regular user (not admin) and verify the button does NOT appear.
2.  **Automated Tests**:
    - None existing for this specific UI interaction. Will rely on manual verification as per "Surgical Architect" workflow.
