export const ar: Record<string, string> = {
  // Boot / Loading states
  "boot.loading": "...جاري تحميل النظام",
  "boot.initializing": "...جاري تهيئة النظام",

  // Auth Guard
  "auth_guard.authenticating": "...جاري المصادقة",
  "auth_guard.session_expired": "...انتهت الجلسة",

  // Critical Nodes
  "critical.title": "العقد الحرجة",
  "critical.ended": "منتهي",
  "critical.empty": "لا توجد مزادات حرجة",
  "critical.all_safe": "جميع المزادات لديها أكثر من 60 دقيقة متبقية",
  "critical.ending_soon": "تنتهي قريباً",
  "critical.extend_title": "تمديد المزاد",
  "critical.extend_message": "تمديد \"{{title}}\" بمقدار 15 دقيقة؟",
  "critical.extend_button": "تمديد 15 د",
  "critical.end_title": "إنهاء المزاد",
  "critical.end_message": "إنهاء \"{{title}}\" الآن؟ لا يمكن التراجع عن هذا الإجراء.",
  "critical.end_now": "إنهاء الآن",
  "critical.bids": "مزايدات",
  "critical.end": "إنهاء",

  // Bid Ticker
  "bid_ticker.anonymous": "مجهول",

  // Settings Form
  "settings.first_name": "الاسم الأول",
  "settings.last_name": "اسم العائلة",

  // Group Buying
  "group_buying.general": "عام",

  // Register Form
  "auth.register.password_mismatch_inline": "كلمات المرور غير متطابقة",

  // Forgot Password
  "auth.forgot.title": "إعادة تعيين كلمة المرور",
  "auth.forgot.subtitle": "استعادة حسابك",
  "auth.forgot.email": "البريد الإلكتروني",
  "auth.forgot.email_placeholder": "your@email.com",
  "auth.forgot.submit": "إرسال رابط إعادة التعيين",
  "auth.forgot.instructions": "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
  "auth.forgot.success_title": "تم إرسال البريد",
  "auth.forgot.success_desc": "تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور.",
  "auth.forgot.back_to_login": "العودة لتسجيل الدخول",
  "auth.forgot.error_empty": "يرجى إدخال بريدك الإلكتروني",

  // Password Strength
  "auth.password.weak": "ضعيفة",
  "auth.password.fair": "متوسطة",
  "auth.password.strong": "قوية",

  // Common overrides (simpler than core-ui defaults)
  "common.all_protocols": "الكل",
  "common.all": "الكل",

  // Auction overrides - simplify confusing "protocol" terminology
  "auction.table.protocol_duration": "المدة",
  "auction.config.state_protocol": "الحالة",
  "auction.config.protocol_identifier_search": "بحث بالمعـرّف أو العنوان",

  // Auction Lifecycle
  "auction.lifecycle.start": "بدء",
  "auction.lifecycle.pause": "إيقاف مؤقت",
  "auction.lifecycle.resume": "استئناف",
  "auction.lifecycle.end": "إنهاء",
  "auction.lifecycle.cancel": "إلغاء",
  "auction.lifecycle.paused": "متوقف مؤقتاً",
  "auction.lifecycle.cancelled": "ملغي",
  "auction.lifecycle.active": "نشط",
  "auction.lifecycle.ended": "منتهي",
  "auction.lifecycle.sold": "مباع",
  "auction.lifecycle.draft": "مسودة",
  "auction.lifecycle.scheduled": "مجدول",
  "auction.lifecycle.start_title": "بدء المزاد",
  "auction.lifecycle.start_confirm": "هل أنت متأكد من بدء هذا المزاد؟",
  "auction.lifecycle.pause_title": "إيقاف المزاد مؤقتاً",
  "auction.lifecycle.pause_confirm": "هل أنت متأكد من إيقاف هذا المزاد مؤقتاً؟",
  "auction.lifecycle.resume_title": "استئناف المزاد",
  "auction.lifecycle.resume_confirm": "هل أنت متأكد من استئناف هذا المزاد؟",
  "auction.lifecycle.end_title": "إنهاء المزاد",
  "auction.lifecycle.end_confirm": "هل أنت متأكد من إنهاء هذا المزاد؟",
  "auction.lifecycle.cancel_title": "إلغاء المزاد",
  "auction.lifecycle.cancel_confirm": "هل أنت متأكد من إلغاء هذا المزاد؟ لا يمكن التراجع عن هذا الإجراء.",
  "auction.lifecycle.buy_now_title": "شراء الآن",
  "auction.lifecycle.buy_now_confirm": "هل أنت متأكد من شراء هذا المزاد؟",

  // Sidebar service labels
  "service.sidebar.general.name": "عام",
  "service.sidebar.operations.name": "العمليات",
  "service.sidebar.auctions.name": "المزادات",
  "service.sidebar.inventory.name": "المخزون",
  "service.sidebar.sales.name": "المبيعات",
  "service.sidebar.reports.name": "التقارير",
  "service.sidebar.customers.name": "العملاء",
  "service.sidebar.catalog.name": "الكتالوج",
  "service.sidebar.orders.name": "الطلبات",
  "service.sidebar.dashboards.name": "لوحات التحكم",
  "service.sidebar.settings.name": "الإعدادات",

  // Customer page
  "customer.independent": "مشغل مستقل",
  "customer.market_intelligence": "المعلومات التجارية",
  "customer.bids_count": "عدد المزايدات",
  "customer.total_spent": "إجمالي الإنفاق",
  "customer.reliability": "مؤشر الموثوقية",
  "customer.actions": "إجراءات",
  "customer.view_audit_logs": "عرض سجل النشاط",
  "customer.transaction_snapshot": "لقطة المعاملات",
  "customer.modify_identity": "تعديل البيانات",
  "customer.error_not_found": "العميل غير موجود",
  "customer.back_to_list": "العودة للقائمة",
  "customer.registered": "تاريخ التسجيل",
  "customer.timezone": "المنطقة الزمنية",
  "customer.email": "البريد الإلكتروني",
  "customer.phone": "رقم الهاتف",
  "customer.street": "الشارع",
  "customer.city": "المدينة",
  "customer.country": "الدولة",
};
