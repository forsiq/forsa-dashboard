/**
 * User Form Page
 *
 * Form for creating or editing a user
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useGetUser, useCreateUser, useUpdateUser } from '../api';

import { useLanguage } from '@core/contexts/LanguageContext';
import { useToast } from '@core/contexts/ToastContext';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const toast = useToast();

  const isEdit = !!id;

  // Query existing user if editing
  const { data: user, isLoading: isLoadingUser } = useGetUser(id || '', isEdit);

  // Mutations
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  // Form state
  const [formData, setFormData] = useState({
    userName: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'user' as 'admin' | 'manager' | 'user',
    password: '',
    isActive: true,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user data into form when editing
  useEffect(() => {
    if (user && isEdit) {
      setFormData({
        userName: user.userName || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        password: '',
        isActive: user.isActive ?? true,
      });
    }
  }, [user, isEdit]);

  // Handle input change
  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username
    if (!formData.userName.trim()) {
      newErrors.userName = t('user.validation.username_required');
    } else if (formData.userName.length < 3) {
      newErrors.userName = t('user.validation.username_too_short');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userName)) {
      newErrors.userName = t('user.validation.username_invalid');
    }

    // Full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('user.validation.full_name_required');
    }

    // Email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('user.validation.email_invalid');
    }

    // Password (only for new users)
    if (!isEdit && !formData.password) {
      newErrors.password = t('user.validation.password_required');
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = t('user.validation.password_too_short');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('user.validation.fix_errors'));
      return;
    }

    try {
      if (isEdit) {
        // Update - only include password if provided
        const updateData: any = {
          id: parseInt(id!),
          userName: formData.userName,
          fullName: formData.fullName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          role: formData.role,
          isActive: formData.isActive,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateMutation.mutateAsync(updateData);
        toast.success(t('user.update_success'));
      } else {
        // Create
        await createMutation.mutateAsync({
          userName: formData.userName,
          fullName: formData.fullName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          role: formData.role,
          password: formData.password,
          isActive: formData.isActive,
        });
        toast.success(t('user.create_success'));
      }
      navigate('/users');
    } catch (error: any) {
      toast.error(error.message || (isEdit ? t('user.update_failed') : t('user.create_failed')));
    }
  };

  // Loading state for existing user
  if (isEdit && isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      {/* Page Header */}
      <PageHeader
        title={isEdit ? t('user.edit') : t('user.add')}
        description={isEdit ? user?.fullName : t('user.add_subtitle')}
        showBackButton
        backHref="/users"
      />

      <form onSubmit={handleSubmit}>
        <AmberCard className="p-6">
          <div className="space-y-6">
            {/* Username */}
            <AmberInput
              label={t('user.username')}
              required
              value={formData.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
              placeholder={t('user.username_placeholder')}
              error={errors.userName}
            />

            {/* Full Name */}
            <AmberInput
              label={t('user.full_name')}
              required
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder={t('user.full_name_placeholder')}
              error={errors.fullName}
            />

            {/* Email */}
            <AmberInput
              label={t('user.email')}
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder={t('user.email_placeholder')}
              error={errors.email}
            />

            {/* Phone */}
            <AmberInput
              label={t('user.phone')}
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder={t('user.phone_placeholder')}
            />

            {/* Role */}
            <AmberDropdown 
              label={t('user.role')}
              options={[
                { label: t('user.role.user'), value: 'user' },
                { label: t('user.role.manager'), value: 'manager' },
                { label: t('user.role.admin'), value: 'admin' },
              ]}
              value={formData.role}
              onChange={(val) => handleChange('role', val)}
            />

            {/* Password */}
            <AmberInput
              label={t('user.password')}
              required={!isEdit}
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={isEdit ? t('user.password_leave_blank') : t('user.password_placeholder')}
              error={errors.password}
            />

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  {t('user.is_active')}
                </label>
                <p className="text-xs text-zinc-500">{t('user.is_active_description')}</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('isActive', !formData.isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isActive ? 'bg-blue-600' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/5">
            <AmberButton
              type="button"
              variant="outline"
              onClick={() => navigate('/users')}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {t('common.cancel')}
            </AmberButton>
            <AmberButton
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="gap-2"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <ArrowLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                  {isEdit ? t('user.update') : t('user.create')}
                </>
              )}
            </AmberButton>
          </div>
        </AmberCard>
      </form>
    </div>
  );
}

export default UserFormPage;
