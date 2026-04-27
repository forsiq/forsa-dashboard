// Flex Auth feature translations (English)
export const flexAuth = {
  // Page titles
  "flex_auth.title": "Flex Auth",
  "flex_auth.subtitle": "Per-Project Auth Configuration",
  "flex_auth.overview": "Overview",
  "flex_auth.select_project": "Select Project",
  "flex_auth.select_project_description": "Choose a project to manage its authentication settings",
  "flex_auth.project_search_label": "Find project",
  "flex_auth.autocomplete_placeholder": "Search by ID, name, @username, or login method…",
  "flex_auth.autocomplete_no_results": "No matching projects",
  "flex_auth.autocomplete_try_different": "Try a different search term.",
  "flex_auth.config": "Auth Configuration",
  "flex_auth.users": "Project Users",
  "flex_auth.no_project_selected": "No project selected",
  "flex_auth.service_name": "Flex Authentication",
  "flex_auth.switch_project": "Switch Project",

  // Overview page
  "flex_auth.overview.title": "Flex Authentication Service",
  "flex_auth.overview.subtitle": "Manage authentication, security, and users across all your projects from a single location.",

  // Dashboard
  "flex_auth.dashboard_subtitle": "Project authentication overview",
  "flex_auth.config_summary": "Configuration Summary",
  "flex_auth.config_description": "Manage login methods, OTP settings, and security",
  "flex_auth.users_description": "View and manage registered users",
  "flex_auth.project": "Project",

  // Stats
  "flex_auth.stats.total": "Total Users",
  "flex_auth.stats.active": "Active Now", 
  "flex_auth.stats.inactive": "Inactive",
  "flex_auth.stats.suspended": "Suspended",
  "flex_auth.stats.admins": "Admins",
  "flex_auth.stats.verified": "Verified",
  "flex_auth.stats.total_projects": "Total Projects",
  "flex_auth.stats.active_users": "Active Users",
  "flex_auth.stats.uptime": "Uptime",
  "flex_auth.stats.regions": "Regions",

  // Management
  "flex_auth.management.title": "Service Management",
  "flex_auth.management.subtitle": "Quick access to core Flex Auth management features.",

  // Actions
  "flex_auth.actions.projects": "Project Selection",
  "flex_auth.actions.projects_desc": "Manage per-project auth.",
  "flex_auth.actions.init": "Initialization",
  "flex_auth.actions.init_desc": "Setup new auth instances.",

  // Status / Health
  "flex_auth.status.title": "System Health",
  "flex_auth.status.all_good": "All Systems Operational",
  "flex_auth.status.core_api": "Core API",
  "flex_auth.status.database": "Database Cluster",
  "flex_auth.status.cache": "Cache (Redis)",
  "flex_auth.status.email": "Email Gateway",
  "flex_auth.status.online": "Online",
  "flex_auth.status.standby": "Standby",

  // Features
  "flex_auth.features.user_management": "User Management",
  "flex_auth.features.user_management_desc": "Register, verify, and manage users per project with flexible auth methods.",
  "flex_auth.features.security": "Security",
  "flex_auth.features.security_desc": "JWT tokens, OTP verification, rate limiting, and role-based access control.",
  "flex_auth.features.api_keys": "API Keys",
  "flex_auth.features.api_keys_desc": "Manage service-to-service API keys for developer platform access.",
  "flex_auth.features.realtime": "Real-time",
  "flex_auth.features.realtime_desc": "WebSocket support for live authentication events and session management.",

  // Error & Status
  "flex_auth.error_loading": "Failed to load data",
  "flex_auth.no_projects": "No projects with Flex Auth",
  "flex_auth.no_projects_advice": "Projects that register users through Flex Auth will appear here. You can enable Flex Auth for any project by configuring it.",

  // Seed Users page
  "flex_auth.seed_users": "Seed Users",
  "flex_auth.seed_users_subtitle": "Test & development users",
  "flex_auth.seed_users_description": "Create and manage test/seed users",
  "flex_auth.create_seed_user": "Create Seed User",
  "flex_auth.no_seed_users": "No seed users yet",

  // Config form
  "flex_auth.login_methods": "Login Methods",
  "flex_auth.login_methods_description": "Choose which methods users can use to log in",
  "flex_auth.primary_method": "Primary Login Method",
  "flex_auth.required_fields": "Required Fields",
  "flex_auth.optional_fields": "Optional Fields",
  "flex_auth.phone_verification": "Phone Verification Required",
  "flex_auth.otp_verification": "OTP Verification Required",
  "flex_auth.otp_settings": "OTP Settings",
  "flex_auth.otp_channel": "OTP Channel",
  "flex_auth.otp_expiry": "OTP Expiry (minutes)",
  "flex_auth.otp_require_login": "Require OTP on Login",
  "flex_auth.otp_require_register": "Require OTP on Register",
  "flex_auth.allow_registration": "Allow Registration",
  "flex_auth.allow_password": "Allow Password Login",
  "flex_auth.password_min_length": "Minimum Password Length",
  "flex_auth.session_lifetime": "Session Lifetime (minutes)",
  "flex_auth.refresh_token_days": "Refresh Token Lifetime (days)",
  "flex_auth.uniqueness_scope": "Uniqueness Scope",
  "flex_auth.scope_project": "Per Project",
  "flex_auth.scope_global": "Global",

  // Users page
  "flex_auth.users_title": "Project Users",
  "flex_auth.users_subtitle": "Manage users for this project",
  "flex_auth.search_users": "Search users...",
  "flex_auth.add_seed_user": "Add Seed User",
  "flex_auth.no_users": "No users found for this project",
  "flex_auth.phone_verified": "Phone Verified",
  "flex_auth.email_verified": "Email Verified",
  "flex_auth.last_login": "Last Login",
  "flex_auth.login_count": "Login Count",
  "flex_auth.seed_user_created": "Seed user created successfully",
  "flex_auth.seed_user_failed": "Failed to create seed user",

  // Config actions
  "flex_auth.config_saved": "Configuration saved successfully",
  "flex_auth.config_save_failed": "Failed to save configuration",
  "flex_auth.config_loaded": "Configuration loaded",
  "flex_auth.config_load_failed": "Failed to load configuration",
  "flex_auth.no_config": "No configuration found, using defaults",

  // Method labels
  "flex_auth.method.phone": "Phone + Password",
  "flex_auth.method.otp": "Phone + OTP",
  "flex_auth.method.email": "Email + Password",
  "flex_auth.method.username": "Username + Password",

  // Sidebar Navigation
  "flex_auth.sidebar.overview": "Overview",
  "flex_auth.sidebar.projects_select": "Project Selection",
  "flex_auth.sidebar.switch_project": "All projects",
  "flex_auth.sidebar.initialization": "Initialization",
  "flex_auth.sidebar.seed_users": "Seed users",
  "flex_auth.sidebar.all_users": "All users",
  "flex_auth.sidebar.config": "Configuration",
  "flex_auth.sidebar.service_management": "Service overview",

  // OTP Management
  "flex_auth.sidebar.otp_management": "OTP Management",
  "flex_auth.otp.title": "OTP Management",
  "flex_auth.otp.total_sent": "Total OTPs Sent",
  "flex_auth.otp.phones_tracked": "Phones Tracked",
  "flex_auth.otp.locked_phones": "Locked Phones",
  "flex_auth.otp.failed_logins": "Failed Logins",
  "flex_auth.otp.all_time": "All time",
  "flex_auth.otp.unique_phones": "Unique numbers",
  "flex_auth.otp.rate_limited": "Rate limited",
  "flex_auth.otp.suspicious_attempts": "Suspicious attempts",
  "flex_auth.otp.rate_limits": "OTP Rate Limits",
  "flex_auth.otp.search_phone": "Search phone...",
  "flex_auth.otp.show_all": "Show All",
  "flex_auth.otp.locked_only": "Locked Only",
  "flex_auth.otp.no_records": "No rate limit records found",
  "flex_auth.otp.phone": "Phone",
  "flex_auth.otp.send_count": "Sends",
  "flex_auth.otp.last_sent": "Last Sent",
  "flex_auth.otp.otp_status": "OTP Status",
  "flex_auth.otp.locked": "Locked",
  "flex_auth.otp.available": "Available",
  "flex_auth.otp.failed_logins_col": "Failed Logins",
  "flex_auth.otp.unlock": "Unlock",
  "flex_auth.otp.unlock_confirm_title": "Unlock Phone",
  "flex_auth.otp.unlock_confirm_message": "Are you sure you want to unlock",
  "flex_auth.otp.unlock_success": "unlocked successfully",
  "flex_auth.otp.unlock_error": "Failed to unlock phone",
  "flex_auth.otp.quick_send": "Quick Send OTP",
  "flex_auth.otp.send_otp": "Send OTP",
  "flex_auth.otp.send_error": "Failed to send OTP",
  "flex_auth.otp.otp_code": "OTP Code",
  "flex_auth.otp.seed_user": "Seed User",
  "flex_auth.otp.providers": "OTP Providers",
  "flex_auth.otp.config_summary": "OTP Config",
  "flex_auth.otp.channel": "Channel",
  "flex_auth.otp.expiry": "Expiry",
  "flex_auth.otp.login_required": "On Login",

  "flex_auth.otp.error_stats": "Failed to load OTP statistics",
  "flex_auth.otp.error_rate_limits": "Failed to load rate limit records",

  "flex_auth.project_switcher.label": "Active Flex Auth project",
  "flex_auth.project_switcher.browse": "Browse projects…",
  "flex_auth.project_switcher.hint":
    "Choosing a project opens its tools in the sidebar (dashboard, users, config). You can switch anytime.",
  "flex_auth.project_switcher.pick_hint": "Open the list to select a project",
  "flex_auth.project_switcher.active_hint": "Flex Auth enabled for this project",

  // Init page
  "flex_auth.init.title": "Initialize Flex Auth Instance",
  "flex_auth.init.subtitle": "Deploy a new authentication gateway for your project.",
  "flex_auth.init.success": "Flex Auth instance initialized successfully!",
  "flex_auth.init.step.configure": "Configure",
  "flex_auth.init.step.security": "Security",
  "flex_auth.init.step.deploy": "Deploy",
  "flex_auth.init.project_details": "Project Details",
  "flex_auth.init.project_id": "Project ID",
  "flex_auth.init.project_name": "Project Name",
  "flex_auth.init.continue_security": "Continue to Security",
  "flex_auth.init.security_settings": "Security Settings",
  "flex_auth.init.encryption_key": "Encryption Master Key",
  "flex_auth.init.enter_secure_key": "Enter a secure key",
  "flex_auth.init.deployment_region": "Deployment Region",
  "flex_auth.init.review_deploy": "Review & Deploy",
  "flex_auth.init.deployment_summary": "Deployment Summary",
  "flex_auth.init.project": "Project",
  "flex_auth.init.database": "Database",
  "flex_auth.init.region": "Region",
  "flex_auth.init.initialize_service": "Initialize Service",
  "flex_auth.init.deployed": "System Deployed",
  "flex_auth.init.deployed_desc": "Flex Auth instance for {name} has been initialized and is ready for use.",
  "flex_auth.init.go_to_dashboard": "Go to Dashboard",
  "flex_auth.init.region_bahrain": "Bahrain (me-south-1)",
  "flex_auth.init.region_virginia": "N. Virginia (us-east-1)",
  "flex_auth.init.region_frankfurt": "Frankfurt (eu-central-1)",
  "flex_auth.init.region_fixed_note":
    "Flex Auth for this platform is deployed only in AWS Frankfurt (eu-central-1). Region cannot be changed.",
  "flex_auth.init.search_project": "Search by name or ID...",
  "flex_auth.init.no_projects_found": "No projects found",
  "flex_auth.init.project_selected": "Project selected",
  "flex_auth.init.error": "Failed to initialize Flex Auth",

  // Roles (for seed users)
  "flex_auth.role.customer": "Customer",
  "flex_auth.role.driver": "Driver",
  "flex_auth.role.staff": "Staff",
  "flex_auth.role.admin": "Admin",

  // OTP Channels
  "flex_auth.channel.whatsapp": "WhatsApp",
  "flex_auth.channel.sms": "SMS",

  // Column labels
  "flex_auth.column.phone": "Phone",
  "flex_auth.column.name": "Name",
  "flex_auth.column.role": "Role",
  "flex_auth.column.status": "Status",
  "flex_auth.column.verified": "Verified",
  "flex_auth.column.created": "Created",

  // Form placeholders
  "flex_auth.placeholder.phone": "Phone (e.g. +9647500000001)",
  "flex_auth.placeholder.password": "Password (default: 123456)",
  "flex_auth.placeholder.first_name": "First Name",
  "flex_auth.placeholder.last_name": "Last Name",
  "flex_auth.placeholder.seed_phone": "Enter phone number for seed user",

  // Actions
  "flex_auth.creating": "Creating...",
  "flex_auth.config_btn": "Config",
  "flex_auth.click_add_seed": "Click \"Add Seed User\" to create one",
  "flex_auth.user_status_updated": "User status updated",
  "flex_auth.user_status_failed": "Failed to update status",
  "flex_auth.phone_required": "Phone number is required",
  "flex_auth.seed_create_failed": "Failed to create seed user",

  // Init tooltips
  "flex_auth.init.encryption_key_tooltip": "Master key used to encrypt sensitive data like passwords and tokens. Keep it safe and do not share it.",
  "flex_auth.init.region_tooltip": "All Flex Auth instances are deployed in AWS Frankfurt (eu-central-1) for compliance and latency reasons.",

  // User management actions
  "flex_auth.action.view_details": "View Details",
  "flex_auth.action.toggle_status": "Toggle Status",
  "flex_auth.action.delete_user": "Delete User",
  "flex_auth.action.reset_password": "Reset Password",
  "flex_auth.action.send_otp": "Send OTP Verification",
  "flex_auth.action.activate_user": "Activate User",
  "flex_auth.action.deactivate_user": "Deactivate User",

  // User search autocomplete
  "flex_auth.user_search_placeholder": "Search users by phone, name, or ID...",

  // Filter labels
  "flex_auth.filter.role": "Role",
  "flex_auth.filter.status": "Status",
  "flex_auth.filter.all_roles": "All Roles",
  "flex_auth.filter.all_statuses": "All Statuses",

  // Common sidebar
  "sidebar.system": "System",
  "sidebar.back_portal": "Back to Portal",
} as const;
