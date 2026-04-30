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

  // Auction Tabs
  "auction.tabs.all": "All",
  "auction.tabs.active": "Active",
  "auction.tabs.scheduled": "Scheduled",
  "auction.tabs.draft": "Draft",
  "auction.tabs.ended": "Ended",
  "auction.tabs.paused": "Paused",
  "auction.tabs.cancelled": "Cancelled",

  // Auction Lifecycle
  "auction.lifecycle.start": "Start",
  "auction.lifecycle.pause": "Pause",
  "auction.lifecycle.resume": "Resume",
  "auction.lifecycle.end": "End",
  "auction.lifecycle.cancel": "Cancel",
  "auction.lifecycle.paused": "Paused",
  "auction.lifecycle.cancelled": "Cancelled",
  "auction.lifecycle.active": "Active",
  "auction.lifecycle.ended": "Ended",
  "auction.lifecycle.sold": "Sold",
  "auction.lifecycle.draft": "Draft",
  "auction.lifecycle.scheduled": "Scheduled",
  "auction.lifecycle.start_title": "Start Auction",
  "auction.lifecycle.start_confirm": "Are you sure you want to start this auction?",
  "auction.lifecycle.pause_title": "Pause Auction",
  "auction.lifecycle.pause_confirm": "Are you sure you want to pause this auction?",
  "auction.lifecycle.resume_title": "Resume Auction",
  "auction.lifecycle.resume_confirm": "Are you sure you want to resume this auction?",
  "auction.lifecycle.end_title": "End Auction",
  "auction.lifecycle.end_confirm": "Are you sure you want to end this auction?",
  "auction.lifecycle.cancel_title": "Cancel Auction",
  "auction.lifecycle.cancel_confirm": "Are you sure you want to cancel this auction? This action cannot be undone.",
  "auction.lifecycle.buy_now_title": "Buy Now",
  "auction.lifecycle.buy_now_confirm": "Are you sure you want to buy this auction?",

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

  // Customer page
  "customer.independent": "Independent",
  "customer.market_intelligence": "Market Intelligence",
  "customer.bids_count": "Bids Count",
  "customer.total_spent": "Total Spent",
  "customer.reliability": "Reliability Index",
  "customer.actions": "Actions",
  "customer.view_audit_logs": "View Audit Logs",
  "customer.transaction_snapshot": "Transaction Snapshot",
  "customer.modify_identity": "Edit Profile",
  "customer.error_not_found": "Customer Not Found",
  "customer.back_to_list": "Back to List",
  "customer.registered": "Registered",
  "customer.timezone": "Timezone",
  "customer.email": "Email",
  "customer.phone": "Phone",
  "customer.street": "Street",
  "customer.city": "City",
  "customer.country": "Country",
};
