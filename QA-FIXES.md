# QA fixes — 4 root issues

This package fixes the four root issues identified in the 3 Sep 2026 Admin QA report.

1. Firestore undefined-field failures (Orders + Salable Products): all shared CRUD writes now recursively remove `undefined` values before Firestore writes. Orders therefore omit an absent delivery address, and optional Salable Product fields are safely omitted.
2. CMS persistence: Our Journey uses a deterministic merge write for existing content; Navigation uses controlled form state; Site Settings uses the shared merge-write helper with visible error handling.
3. Delivery Users: Add Delivery User now has an explicit create mode instead of relying on the edit selection state.
4. Audit Log: shared CRUD writes create audit events; transaction-based stock, harvest, order, delivery and packaging operations also create audit events. Audit failures never invalidate a successful business write.

The package intentionally does not include production Firebase environment values. Keep the existing GitHub repository/package-lock and run `npm install` only if package.json changed or the lock is missing.
