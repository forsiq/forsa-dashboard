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

  // Dashboard Charts
  "dash.sales_trend": "Sales Trend (30 Days)",
  "dash.active_days": "active days",
  "dash.revenue": "Revenue",
  "dash.orders": "Orders",
  "dash.no_sales_data": "No sales data yet",
  "dash.sales_data_hint": "Sales data will appear here when orders are placed",
  "dash.category_distribution": "Top Categories",
  "dash.products": "Products",
  "dash.no_category_data": "No category data",
  "dash.category_data_hint": "Add products to categories to see distribution",

  // Top Auctions
  "dash.top_performing": "Top Performing Items",
  "dash.sales": "Sales",

  // Auction Details
  "auction.detail.not_found_text": "Auction not found",
  "auction.detail.category": "Category",
  "auction.detail.winner": "Winner",
  "auction.detail.no_winner": "No winner yet",
  "auction.detail.total_bids": "Total Bids",
  "auction.detail.loading": "Loading...",
  "auction.detail.general": "General",

  // Auctions List
  "auction.filter.all": "All",

  // Group Buying
  "group_buying.general": "GENERAL",

  // Register Form
  "auth.register.password_mismatch_inline": "Passwords do not match",

  // Settings Form
  "settings.first_name": "First Name",
  "settings.last_name": "Last Name",
  "settings.username": "Username",
  "settings.email": "Email",
  "common.save_changes": "Save Changes",

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

  // Report page labels
  "report.dashboard": "Report Dashboard",
  "report.analytics": "Analytics",
  "report.sales": "Sales Reports",
  "report.inventory": "Inventory Reports",
  "report.sales_overview_section": "Sales Overview",
  "report.auction_performance": "Auction Performance",
  "report.group_buying_analytics": "Group Buying Analytics",
  "report.customer_insights": "Customer Insights",

  // Order & Customer titles
  "order.title": "Orders",
  "customer.title": "Customers",

  // Common
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.retry": "Retry",
  "common.error": "Something went wrong",
  "common.errorTryAgain": "An error occurred, please try again",
  "common.loading": "Loading...",

  // Collaborators / Team
  "collaborators.title": "Team",
  "collaborators.description": "Manage project team members",
  "collaborators.members": "members",
  "collaborators.add": "Add Member",
  "collaborators.add_member": "Add Team Member",
  "collaborators.add_member_desc": "Invite a new member to this project",
  "collaborators.edit_member": "Edit Team Member",
  "collaborators.edit_member_desc": "Update member role and permissions",
  "collaborators.remove": "Remove",
  "collaborators.remove_member": "Remove Member",
  "collaborators.remove_confirm": "Are you sure you want to remove this member?",
  "collaborators.role": "Role",
  "collaborators.role.admin": "Admin",
  "collaborators.role.manager": "Manager",
  "collaborators.role.editor": "Editor",
  "collaborators.role.moderator": "Moderator",
  "collaborators.role.viewer": "Viewer",
  "collaborators.user": "User",
  "collaborators.user_id": "Platform User",
  "collaborators.comment": "Comment (optional)",
  "collaborators.comment_placeholder": "Notes about this member...",
  "collaborators.no_comment": "No comment",
  "collaborators.search_users": "Search users by name, email, or ID...",
  "collaborators.no_users_found": "No users found",
  "collaborators.no_project": "No project selected",
  "collaborators.select_project_first": "Please select a project first",
  "collaborators.team_for": "Team",
  "collaborators.empty": "No team members yet",
  "collaborators.empty_desc": "Add collaborators to manage who can access this project.",
  "collaborators.created": "Member added successfully",
  "collaborators.updated": "Member updated successfully",
  "collaborators.deleted": "Member removed successfully",
  "collaborators.error_load": "Failed to load team members",
  "collaborators.error_create": "Failed to add team member",
  "collaborators.error_update": "Failed to update team member",
  "collaborators.error_delete": "Failed to remove team member",

  // User roles (dynamic: t(`user.role.${role}`))
  "user.role.admin": "Admin",
  "user.role.manager": "Manager",
  "user.role.user": "User",
  "user.role.customer": "Customer",
  "user.role.driver": "Driver",
  "user.role.staff": "Staff",
  "user.role.pending": "Pending",
  "user.role.moderator": "Moderator",
  "user.role.editor": "Editor",
  "user.role.viewer": "Viewer",
  "user.filter.all_roles": "All Roles",
};
