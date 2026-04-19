# Security Specification: CinePro Marketplace

## 1. Data Invariants
- **Identity Integrity**: Users can only create profiles where the `uid` matches their authenticated `auth.uid`. Role assignment (especially `admin` or `employee`) must be locked or verified.
- **Relational Integrity**: A booking cannot exist without a valid reference to a client and a service (location/equipment/talent).
- **Update Constraints**: 
    - Locations can only be edited by the owner.
    - Status changes to "active" for locations require admin approval logic.
    - Equipment condition evidence must be immutable once submitted.
- **Privacy**: Location `address` is only visible to `employees`, `admins`, and the `owner`.

## 2. The "Dirty Dozen" Payloads (Attacker Strategy)

1. **Identity Spoofing**: Attempt to create a user profile with a different `userId` than the authenticated session.
2. **Privilege Escalation**: Attempt to set `role: 'admin'` on a user's own profile during creation.
3. **Ghost Listing**: Attempt to create a location listing for a different owner (`ownerId` mismatch).
4. **Unauthorized Approval**: Attempt for a non-admin to update a location status from `pending` to `active`.
5. **PII Leak**: Non-employee/non-owner attempting to read a location document that contains an `address` field (if not restricted).
6. **Price Manipulation**: A client attempting to update the `totalPrice` of a booking after creation.
7. **Asset Theft**: Attempting to delete someone else's equipment listing.
8. **Invalid Metrics**: Injecting a 2MB string into the `skinTone` or `experience` field of a talent profile.
9. **Booking Hijack**: Attempting to update a booking's `clientId` to someone else.
10. **Evidence Tampering**: Attempting to modify `conditionEvidence` photos after the rental has started.
11. **ID Injection**: Using a 1KB string as an ID to exhaust storage resources.
12. **Status Short-circuit**: Manually setting a booking to `completed` without payment or timeframe passing.

## 3. Test Runner Specification (`firestore.rules.test.ts` Draft)

```typescript
// Conceptual test suite for CinePro Rules
describe('CinePro Security Rules', () => {
  it('denies user from setting themselves as admin', async () => {
    // Attempt: db.collection('users').doc('myId').set({ role: 'admin' }) as 'myId'
    // Result: EXPECT PERMISSION_DENIED
  });

  it('denies location creation with mismatched ownerId', async () => {
    // Attempt: db.collection('locations').add({ ownerId: 'otherId', ... }) as 'myId'
    // Result: EXPECT PERMISSION_DENIED
  });

  it('restricts address field read to employees/owners', async () => {
    // Attempt: db.collection('locations').doc('loc1').get() as 'randomUser'
    // If the doc contains 'address', and randomUser is not owner/employee
    // Result: EXPECT PERMISSION_DENIED (or field masking if possible, else doc deny)
  });
});
```
