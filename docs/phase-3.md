# Phase 3 — Complete AdminLTE 4 UI Foundation

This phase does not add a new business domain. It replaces the previous hand-built Admin shell with the AdminLTE 4 React/Next.js integration.

## Included

- `@adminlte/react` official React/Next.js integration (v0.6.x)
- `DashboardLayout` shell
- Responsive AdminLTE sidebar
- Working hamburger/sidebar toggle
- Desktop collapse and mobile off-canvas behavior
- Sidebar overlay
- Typed menu model
- Topbar and user/logout action
- Footer
- Light/dark mode toggle
- AdminLTE `AppContent` and dashboard widgets
- AdminLTE login layout
- Bootstrap 5.3 JavaScript
- Bootstrap Icons
- Existing Firebase authentication retained
- Existing Products and Inventory retained
- Products/Inventory remain cumulative from Phase 2

## Business boundary

No Orders, Customers, Delivery, CMS, Notifications or Reports business implementation is added in this phase.

## Official basis

The implementation follows the AdminLTE React documentation: `DashboardLayout` provides the shell, `AppContent` provides page headers/breadcrumbs, and the React package provides the responsive sidebar state and layout providers.


## Runtime fix

The React AdminLTE `MenuNode` badge API uses `badge` as a string/number and `badgeColor` as the Bootstrap theme. Do not pass an object such as `{ text, color }` as `badge`; React would attempt to render that object and throw a runtime error.
