# Security Specification (security_spec.md)

## 1. Data Invariants
- **User Ownership**: No user may read, write, or query another user's personal details, resumes, quality reviews, ATS scores, learning paths, or matching histories.
- **Identity Enforcement**: Document metadata fields representing ownership (such as `userId` or document path ID) must match the caller's verified `request.auth.uid`.
- **System Integrity**: Static job opportunities are system-seeded reference data. Only the server (bypassing rules via Admin SDK) can modify opportunities; standard clients have read-only access.

## 2. The "Dirty Dozen" Payloads
We construct 12 malicious payload patterns attempting to breach these properties, all of which must be strictly rejected (returning `PERMISSION_DENIED`):
1. **Malicious Resume Spoofing**: User `A` tries to write a resume document with `userId: "UserB"`.
2. **Unauthorized Resume Read**: User `A` tries to read User `B`'s resume.
3. **Ghost Score Addition**: User `A` tries to inject a high ATS score record under User `B`'s UID.
4. **Keyword Injection Over size**: Squirreling a 50MB string inside `keywordsMatched` list.
5. **Seeded Data Defacement**: Unauthenticated client trying to `delete` or `update` a record inside `jobOpportunities`.
6. **Unverified Email Writes**: Writing data with an unverified email token.
7. **Bypassing Owner Constraint on ATS Scores**: Reading ATS scores of User `B` by omitting the `where("userId", "==")` filter on the query.
8. **Shadow Field Injection**: Writing a resume with an unauthorized field `isAdmin: true`.
9. **Illegal Identity Mapping**: Modifying `userId` of an existing document to transfer ownership.
10. **State Corruption**: Inserting raw string into `qualityScore` field (type validation breach).
11. **Negative Value Poisoning**: Injecting `qualityScore: -1` or `score: 105`.
12. **Null ID Pollution**: Injecting non-alphanumeric junk characters as document ID to exhaust resources.

## 3. Test Cases (TDD Verification)
Every test scenario corresponds to rejecting these illegal operations. Security rules are designed to prevent each of these.
