import type { MenuNode } from "@adminlte/react";

export const menuItems: MenuNode[] = [
  { type: "item", text: "Dashboard", href: "/", icon: "bi-speedometer2" },

  { type: "item", text: "Products", href: "/products", icon: "bi-box-seam" },
  { type: "item", text: "Salable Products", href: "/sales-products", icon: "bi-bag-check" },
  { type: "item", text: "Growing Batches", href: "/growing-batches", icon: "bi-moisture" },
  { type: "item", text: "Customers", href: "/customers", icon: "bi-people" },
  { type: "item", text: "Orders", href: "/orders", icon: "bi-cart3" },
  { type: "item", text: "Subscription & Delivery Charges", href: "/subscription-masters", icon: "bi-sliders" },
  { type: "item", text: "Delivery Operations", href: "/delivery", icon: "bi-truck" },
  { type: "item", text: "Packaging & Fulfilment", href: "/fulfilment", icon: "bi-box-seam" },

  {
    type: "group",
    text: "Website CMS",
    icon: "bi-layout-text-window",
    children: [
      { type: "item", text: "Website Pages", href: "/cms/pages", icon: "bi-file-earmark-text" },
      { type: "item", text: "Our Journey", href: "/cms/journey", icon: "bi-signpost-2" },
      { type: "item", text: "FAQ", href: "/cms/faq", icon: "bi-question-circle" },
      { type: "item", text: "Testimonials", href: "/cms/testimonials", icon: "bi-chat-quote" },
      { type: "item", text: "Blogs", href: "/cms/blogs", icon: "bi-journal-text" },
      { type: "item", text: "Hero Slider", href: "/cms/banners", icon: "bi-images" },
      { type: "item", text: "Navigation", href: "/cms/navigation", icon: "bi-list" },
      { type: "item", text: "Site Settings", href: "/cms/settings", icon: "bi-gear" },
    ],
  },

  { type: "item", text: "Reports", href: "/reports", icon: "bi-bar-chart" },
  { type: "item", text: "Production Analytics", href: "/reports/production", icon: "bi-graph-up-arrow" },
  { type: "item", text: "Customer Growth", href: "/reports/customer-growth", icon: "bi-person-up" },
  { type: "item", text: "Notifications", href: "/notifications", icon: "bi-bell" },

  {
    type: "group",
    text: "Administration",
    icon: "bi-shield-lock",
    children: [
      { type: "item", text: "Admin Users", href: "/admin-users", icon: "bi-people" },
      { type: "item", text: "Locations", href: "/locations", icon: "bi-geo-alt" },
      { type: "item", text: "Audit Log", href: "/audit-log", icon: "bi-journal-text" },
      { type: "item", text: "System Settings", href: "/settings", icon: "bi-gear" },
    ],
  },
];
