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

  // Dashboard Charts
  "dash.sales_trend": "اتجاه المبيعات (30 يوماً)",
  "dash.active_days": "أيام نشطة",
  "dash.revenue": "الإيرادات",
  "dash.orders": "الطلبات",
  "dash.no_sales_data": "لا توجد بيانات مبيعات بعد",
  "dash.sales_data_hint": "ستظهر بيانات المبيعات هنا عند تقديم الطلبات",
  "dash.category_distribution": "أعلى الفئات",
  "dash.products": "المنتجات",
  "dash.no_category_data": "لا توجد بيانات فئات",
  "dash.category_data_hint": "أضف منتجات إلى الفئات لعرض التوزيع",

  // Top Auctions
  "dash.top_performing": "أعلى العناصر أداءً",
  "dash.sales": "المبيعات",

  // Auction Details
  "auction.detail.not_found_text": "المزاد غير موجود",
  "auction.detail.category": "الفئة",
  "auction.detail.winner": "الفائز",
  "auction.detail.no_winner": "لا يوجد فائز بعد",
  "auction.detail.total_bids": "إجمالي المزايدات",
  "auction.detail.loading": "...جاري التحميل",
  "auction.detail.general": "عام",

  // Auctions List
  "auction.filter.all": "الكل",

  // Group Buying
  "group_buying.general": "عام",

  // Register Form
  "auth.register.password_mismatch_inline": "كلمات المرور غير متطابقة",

  // Settings Form
  "settings.first_name": "الاسم الأول",
  "settings.last_name": "اسم العائلة",
  "settings.username": "اسم المستخدم",
  "settings.email": "البريد الإلكتروني",
  "common.save_changes": "حفظ التغييرات",

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

  // Report page labels
  "report.dashboard": "لوحة التقارير",
  "report.analytics": "التحليلات",
  "report.sales": "تقارير المبيعات",
  "report.inventory": "تقارير المخزون",
  "report.sales_overview_section": "نظرة عامة على المبيعات",
  "report.auction_performance": "أداء المزادات",
  "report.group_buying_analytics": "تحليلات الشراء الجماعي",
  "report.customer_insights": "رؤى العملاء",

  // Order & Customer titles
  "order.title": "الطلبات",
  "customer.title": "العملاء",

  // Common
  "common.cancel": "إلغاء",
  "common.save": "حفظ",
  "common.retry": "إعادة المحاولة",
  "common.error": "حدث خطأ ما",
  "common.errorTryAgain": "حدث خطأ، يرجى المحاولة مرة أخرى",
  "common.loading": "...جاري التحميل",

  // Collaborators / Team
  "collaborators.title": "الفريق",
  "collaborators.description": "إدارة أعضاء فريق المشروع",
  "collaborators.members": "أعضاء",
  "collaborators.add": "إضافة عضو",
  "collaborators.add_member": "إضافة عضو للفريق",
  "collaborators.add_member_desc": "دعوة عضو جديد لهذا المشروع",
  "collaborators.edit_member": "تعديل عضو الفريق",
  "collaborators.edit_member_desc": "تحديث دور وصلاحيات العضو",
  "collaborators.remove": "إزالة",
  "collaborators.remove_member": "إزالة عضو",
  "collaborators.remove_confirm": "هل أنت متأكد من إزالة هذا العضو؟",
  "collaborators.role": "الدور",
  "collaborators.role.admin": "مدير",
  "collaborators.role.manager": "مشرف",
  "collaborators.role.editor": "محرر",
  "collaborators.role.moderator": "مراقب",
  "collaborators.role.viewer": "مشاهد",
  "collaborators.user": "المستخدم",
  "collaborators.user_id": "مستخدم المنصة",
  "collaborators.comment": "تعليق (اختياري)",
  "collaborators.comment_placeholder": "ملاحظات عن هذا العضو...",
  "collaborators.no_comment": "لا يوجد تعليق",
  "collaborators.search_users": "البحث عن المستخدمين بالاسم أو البريد أو المعرّف...",
  "collaborators.no_users_found": "لم يتم العثور على مستخدمين",
  "collaborators.no_project": "لم يتم تحديد مشروع",
  "collaborators.select_project_first": "يرجى تحديد مشروع أولاً",
  "collaborators.team_for": "فريق",
  "collaborators.empty": "لا يوجد أعضاء في الفريق بعد",
  "collaborators.empty_desc": "أضف متعاونين لإدارة من يمكنه الوصول إلى هذا المشروع.",
  "collaborators.created": "تمت إضافة العضو بنجاح",
  "collaborators.updated": "تم تحديث العضو بنجاح",
  "collaborators.deleted": "تم إزالة العضو بنجاح",
  "collaborators.error_load": "فشل تحميل أعضاء الفريق",
  "collaborators.error_create": "فشل إضافة عضو الفريق",
  "collaborators.error_update": "فشل تحديث عضو الفريق",
  "collaborators.error_delete": "فشل إزالة عضو الفريق",
};
