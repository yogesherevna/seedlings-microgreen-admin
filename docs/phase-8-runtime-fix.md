# Phase 8 Runtime Fix

Fixed the AdminLTE React sidebar menu model.

The previous `menu.ts` used custom `{ label, path, children }` objects. The official
`@adminlte/react` DashboardLayout expects `MenuNode[]`, using:
- `type: "item"` + `text` + `href`
- `type: "group"` + `text` + `children`

This caused the runtime `undefined.some` error inside DashboardLayout.

All placeholder "Soon" badges remain removed.
