# Security Specification — MicroCaaS Hub

## 1. Data Invariants
- `documents`: Must have a valid `ownerId` matching `request.auth.uid`. No public read.
- `nfeMonitoredClients`: Must have `ownerId` matching `request.auth.uid`. Certificate data must be protected.
- `trackingEvents`: Always additive (create only). `userId` must match `request.auth.uid` or be 'anonymous' (with rate limiting if possible, but rules only block identity spoofing).
- `userMetrics`: Read-only for users (system updates it via server/admin).

## 2. The "Dirty Dozen" Payloads (Deny Cases)
1. Creating a document for another user: `{ ownerId: 'victim_uid', ... }` (Identiy Spoofing)
2. Updating a `status` field in `nfeMonitoredClients` to 'premium' without permission.
3. Reading another user's `documents`.
4. Injecting 1MB string into `chave` field in `documents`.
5. Modifying `createdAt` field after creation.
6. Deleting `trackingEvents` to hide tracks.
7. Updating `plan` in `userPlans` directly from frontend.
8. Listing all `nfeMonitoredClients` without filter.
9. Creating a duplicate `nfeMonitoredClient` with different owner.
10. Spoofing `email_verified` (rules must check `token.email_verified`).
11. Updating `usageCount` in `nfeUsage` manually.
12. Accessing `documents` using the `list` operation without `ownerId` filter.

## 3. Implementation Patterns
- **Master Gate**: All sub-resources check parent ownership or direct ownership.
- **Validation Blueprints**: `isValidDocument()`, `isValidClient()`.
- **Identity Integrity**: `data.ownerId == request.auth.uid`.
- **Temporal Integrity**: `data.createdAt == request.time`.
- **Immortal Fields**: `incoming().ownerId == existing().ownerId`.
