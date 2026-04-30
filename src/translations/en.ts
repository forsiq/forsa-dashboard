export const en: Record<string, string> = {
  // Boot / Loading states
  "boot.loading": "BOOTING SYSTEM...",
  "boot.initializing": "INITIALIZING SYSTEM...",

  // Auth Guard
  "auth_guard.authenticating": "AUTHENTICATING...",
  "auth_guard.session_expired": "SESSION EXPIRED...",

  // Critical Nodes
  "critical.title": "Critical Nodes",
  "critical.ended": "Ended",
  "critical.empty": "No critical auctions",
  "critical.all_safe": "All auctions have more than 60 minutes remaining",
  "critical.ending_soon": "ending soon",
  "critical.extend_title": "Extend Auction",
  "critical.extend_message": 'Extend "{{title}}" by 15 minutes?',
  "critical.extend_button": "Extend 15m",
  "critical.end_title": "End Auction",
  "critical.end_message": 'End "{{title}}" now? This cannot be undone.',
  "critical.end_now": "End Now",
  "critical.bids": "bids",
  "critical.end": "End",

  // Bid Ticker
  "bid_ticker.anonymous": "Anonymous",

  // Settings Form
  "settings.first_name": "First Name",
  "settings.last_name": "Last Name",

  // Group Buying
  "group_buying.general": "GENERAL",

  // Register Form
  "auth.register.password_mismatch_inline": "Passwords do not match",

  // Forgot Password
  "auth.forgot.title": "Reset Password",
  "auth.forgot.subtitle": "Recover your account",
  "auth.forgot.email": "Email Address",
  "auth.forgot.email_placeholder": "your@email.com",
  "auth.forgot.submit": "Send Reset Link",
  "auth.forgot.instructions": "Enter your email address and we will send you a link to reset your password.",
  "auth.forgot.success_title": "Email Sent",
  "auth.forgot.success_desc": "Check your email for a password reset link.",
  "auth.forgot.back_to_login": "Back to Login",
  "auth.forgot.error_empty": "Please enter your email address",

  // Password Strength
  "auth.password.weak": "Weak",
  "auth.password.fair": "Fair",
  "auth.password.strong": "Strong",

  // Common overrides (simpler than core-ui defaults)
  "common.all_protocols": "All",
  "common.all": "All",

  // Auction overrides - simplify confusing "protocol" terminology
  "auction.table.protocol_duration": "Duration",
  "auction.config.state_protocol": "Status",
  "auction.config.protocol_identifier_search": "Search by ID or Title",

  // Sidebar service labels (used by Sidebar component: t(`service.${sectionTitle}.name`))
  "service.sidebar.general.name": "General",
  "service.sidebar.operations.name": "Operations",
  "service.sidebar.auctions.name": "Auctions",
  "service.sidebar.inventory.name": "Inventory",
  "service.sidebar.sales.name": "Sales",
  "service.sidebar.reports.name": "Reports",
  "service.sidebar.customers.name": "Customers",
  "service.sidebar.catalog.name": "Catalog",
  "service.sidebar.orders.name": "Orders",
  "service.sidebar.dashboards.name": "Dashboards",
  "service.sidebar.settings.name": "Settings",
};
