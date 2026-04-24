// Authentication translations
export const auth = {
  "login.welcome": "Welcome Back",
  "login.subtitle": "Sign in to manage auctions and inventory",
  "login.email": "Email or Username",
  "login.password": "Password",
  "login.remember": "Remember Me",
  "login.forgot": "Forgot Password?",
  "login.button": "Login",
  "login.loading": "Authenticating...",
  "login.or_continue": "Or Continue With",
  "login.google": "Google",
  "login.no_account": "Don't have an account?",
  "login.create_account": "Create Account",
  "login.error.invalid": "Invalid credentials. Please check your username and password.",
  "login.error.network": "Connection failed. Please check your network or try again later.",
  "login.select_language": "Select Language",
  "login.switch_theme_light": "Switch to Light Mode",
  "login.switch_theme_dark": "Switch to Dark Mode",

  // OTP
  "auth.otp.title": "Verify OTP",
  "auth.otp.subtitle": "Enter the verification code sent to your email",
  "auth.otp.resend": "Resend Code",
  "auth.otp.resend_button": "Resend",
  "auth.otp.submit": "Verify",

  // Register
  "auth.register.title": "Create Account",
  "auth.register.subtitle": "Create an account to use the auction dashboard",
  "auth.register.username": "Username",
  "auth.register.username_placeholder": "Enter your username",
  "auth.register.email": "Email",
  "auth.register.email_placeholder": "Enter your email",
  "auth.register.password": "Password",
  "auth.register.password_placeholder": "Enter your password",
  "auth.register.confirm_password": "Confirm Password",
  "auth.register.confirm_password_placeholder": "Confirm your password",
  "auth.register.submit": "Create Account",
  "auth.register.has_account": "Already have an account?",
  "auth.register.login": "Login",
  "validation.password_too_short": "Password is too short",
  "auth.register.success_title": "Account Created",
  "auth.register.success_desc": "Your account is ready. You can sign in to the dashboard.",
  "auth.register.proceed_login": "Proceed to Login",

  "auth.brand.line1": "ZONE",
  "auth.brand.line2": "VAST",
  "auth.brand.tagline": "Auction management",
  "auth.footer.hint": "Secured connection · All rights reserved",

  // Marketing (legacy / optional)
  "auth.marketing.title": "Auctions & operations",
  "auth.marketing.subtitle": "Manage listings, bids, and inventory in one place.",
  "auth.marketing.feature1.label": "Listings & bids",
  "auth.marketing.feature1.value": "Live",
  "auth.marketing.feature2.label": "Operations",
  "auth.marketing.feature2.value": "In sync",

  // Session expired
  "auth.session_expired": "Session Expired",
  "auth.session_expired_desc": "Your current session has expired. Please log in again to continue.",
  "auth.login_again": "Login Again",
} as const;
