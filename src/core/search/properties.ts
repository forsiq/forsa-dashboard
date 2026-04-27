import type { SearchPropertyDefinition } from './definition';

export function createUsersSearchProperties(
  projectUsernames: string[],
  isArabic = false,
): SearchPropertyDefinition[] {
  return [
    {
      key: 'role',
      aliases: ['الدور'],
      label: 'Role',
      displayKey: isArabic ? 'الدور' : 'role',
      values: ['admin', 'manager', 'user', 'staff', 'customer'],
    },
    {
      key: 'status',
      aliases: ['الحالة'],
      label: 'Status',
      displayKey: isArabic ? 'الحالة' : 'status',
      values: ['active', 'inactive'],
    },
    {
      key: 'hasProjects',
      aliases: ['projects', 'لديه_مشاريع', 'مشاريع'],
      label: 'Has Projects',
      displayKey: isArabic ? 'مشاريع' : 'hasProjects',
      values: ['yes', 'no'],
    },
    {
      key: 'project',
      aliases: ['projectUsername', 'المشروع'],
      label: 'Project',
      displayKey: isArabic ? 'المشروع' : 'project',
      values: projectUsernames,
    },
  ];
}

export function createProjectsSearchProperties(isArabic = false): SearchPropertyDefinition[] {
  return [
    { key: 'title', aliases: ['العنوان'], label: 'Title', displayKey: isArabic ? 'العنوان' : 'title' },
    { key: 'username', aliases: ['اسم_المستخدم'], label: 'Username', displayKey: isArabic ? 'اسم_المستخدم' : 'username' },
    { key: 'id', aliases: ['المعرف'], label: 'ID', displayKey: isArabic ? 'المعرف' : 'id' },
  ];
}

export function createFlexAuthUsersSearchProperties(isArabic = false): SearchPropertyDefinition[] {
  return [
    {
      key: 'role',
      aliases: ['الدور'],
      label: 'Role',
      displayKey: isArabic ? 'الدور' : 'role',
      values: ['customer', 'driver', 'staff', 'admin'],
    },
    {
      key: 'status',
      aliases: ['الحالة'],
      label: 'Status',
      displayKey: isArabic ? 'الحالة' : 'status',
      values: ['active', 'inactive', 'suspended'],
    },
    { key: 'phone', aliases: ['الهاتف'], label: 'Phone', displayKey: isArabic ? 'الهاتف' : 'phone' },
    { key: 'name', aliases: ['الاسم'], label: 'Name', displayKey: isArabic ? 'الاسم' : 'name' },
  ];
}
