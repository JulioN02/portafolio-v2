# Delta: Delete Message UI

## Domain

Contact forms admin inbox — delete action from list item, detail panel, and standalone detail page.

## ADDED Requirements

### Requirement: Delete Button on List Item

Each message row in `ContactMessageList` MUST show a delete icon button that triggers `ConfirmDeleteModal`. Confirming MUST call `useDelete().mutate(id)`, close the modal, and refetch the list.

#### Scenario: Delete from list item opens confirmation

- GIVEN user is on the inbox page with messages displayed
- WHEN user clicks the delete icon on a list item
- THEN a `ConfirmDeleteModal` appears asking to confirm deletion of that message
- AND the modal shows the sender name as the entity to delete

#### Scenario: Confirm delete removes message

- GIVEN the confirm modal is open for a message
- WHEN user clicks "Eliminar" (Delete)
- THEN `DELETE /api/contact/:id` is called
- AND the modal closes
- AND the message is removed from the list
- AND any open detail panel for that message is cleared

#### Scenario: Cancel delete closes modal

- GIVEN the confirm modal is open
- WHEN user clicks "Cancelar" (Cancel) or clicks outside the modal
- THEN the modal closes
- AND no delete request is made
- AND the list remains unchanged

### Requirement: Delete Button in Detail Panel (Desktop)

The detail panel in the two-panel layout MUST show a delete button in the header action area (next to archive). Clicking MUST open `ConfirmDeleteModal`.

#### Scenario: Delete from detail panel

- GIVEN user views a message in the right detail panel
- WHEN user clicks the delete icon/button in the header
- THEN `ConfirmDeleteModal` opens
- WHEN confirmed
- THEN `DELETE /api/contact/:id` is called
- AND the detail panel returns to empty state ("Selecciona un mensaje")
- AND the message is removed from the list

### Requirement: Delete Button in Standalone Detail Page (Mobile)

The standalone `ContactMessageDetail` page (route `/contact-messages/:id`) MUST show a delete button in the header action area. Confirming SHOULD navigate back to the inbox list after successful deletion.

#### Scenario: Delete from standalone detail page

- GIVEN user is on `/contact-messages/:id` viewing a message
- WHEN user clicks the delete button and confirms
- THEN `DELETE /api/contact/:id` is called
- AND the user is redirected to `/contact-messages`
- AND the deleted message is no longer in the list

### Requirement: Error Handling on Delete

If `DELETE /api/contact/:id` fails (network error, 404, 500), the system MUST display the existing error state (via `useDelete` mutation's `onError`) and keep the confirm modal open for retry.

#### Scenario: Delete fails with error

- GIVEN the confirm modal is open and the user confirms deletion
- WHEN the API returns an error (e.g., 500)
- THEN the modal shows an error message or remains open
- AND the user can retry or cancel
- AND the list is NOT modified

### Requirement: Reuse Existing ConfirmDeleteModal

The delete flow MUST reuse the existing `ConfirmDeleteModal` component. No new modal component SHALL be created.

#### Scenario: ConfirmDeleteModal used for delete

- GIVEN the user clicks delete on any message
- WHEN `ConfirmDeleteModal` renders
- THEN it receives `entityName` as the message sender's name
- AND `onConfirm` calls `useDelete().mutate(id)`
- AND `isLoading` reflects the mutation's `isPending` state
