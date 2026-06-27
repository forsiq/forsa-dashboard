/** Shipping Hooks - React Query + useMutationContext (Al-Waseet). */
import { useQuery, useMutation } from '@tanstack/react-query';
import { useMutationContext } from '@core/hooks/useMutationContext';
import * as api from '../api/shipping';
import { shippingKeys } from '../api/shipping';
import type {
  ShippingProviderConfig,
  ShippingProviderName,
  ShippingEnvironment,
  UpsertProviderInput,
  TestConnectionInput,
  CreateShipmentInput,
  ShipmentFilters,
  ShippingReferenceItem,
} from '../types';

export { shippingKeys };

/* ------------------------------------------------------------------ */
/* Providers                                                           */
/* ------------------------------------------------------------------ */

export const useProviders = () => {
  return useQuery<ShippingProviderConfig[]>({
    queryKey: shippingKeys.providers(),
    queryFn: api.getProviders,
  });
};

export const useUpsertProvider = () => {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: (input: UpsertProviderInput) => api.upsertProvider(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.providers() });
      toast.success(t('shipping.credentials_saved'));
    },
    onError: (error: unknown) => {
      toast.error(t('shipping.credentials_save_failed') + ': ' + getErrorDetail(error), 6000);
    },
  });
};

export const useToggleProvider = () => {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: ({
      providerName,
      isActive,
      environment,
    }: {
      providerName: ShippingProviderName;
      isActive: boolean;
      environment?: ShippingEnvironment;
    }) => api.setProviderEnabled(providerName, isActive, environment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.providers() });
    },
    onError: (error: unknown) => {
      toast.error(t('shipping.credentials_save_failed') + ': ' + getErrorDetail(error), 6000);
    },
  });
};

export const useTestConnection = () => {
  const { toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: (input: TestConnectionInput) => api.testConnection(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('shipping.test_success'));
      } else {
        toast.error(result.message || t('shipping.test_failed'), 6000);
      }
    },
    onError: (error: unknown) => {
      toast.error(t('shipping.test_failed') + ': ' + getErrorDetail(error), 6000);
    },
  });
};

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */

export const useCities = () => {
  return useQuery<ShippingReferenceItem[]>({
    queryKey: shippingKeys.cities(),
    queryFn: api.getCities,
  });
};

export const useRegions = (cityId: string | undefined) => {
  return useQuery<ShippingReferenceItem[]>({
    queryKey: shippingKeys.regions(cityId),
    queryFn: () => api.getRegions(cityId || ''),
    enabled: !!cityId,
  });
};

export const usePackageSizes = () => {
  return useQuery<ShippingReferenceItem[]>({
    queryKey: shippingKeys.packageSizes(),
    queryFn: api.getPackageSizes,
  });
};

export const useSyncReference = () => {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: (providerName?: ShippingProviderName) => api.syncReference(providerName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.cities() });
      queryClient.invalidateQueries({ queryKey: ['shipping', 'regions'] });
      queryClient.invalidateQueries({ queryKey: shippingKeys.packageSizes() });
      toast.success(t('shipping.sync_reference_success'));
    },
    onError: (error: unknown) => {
      toast.error(t('shipping.sync_reference_failed') + ': ' + getErrorDetail(error), 6000);
    },
  });
};

/* ------------------------------------------------------------------ */
/* Order shipping                                                      */
/* ------------------------------------------------------------------ */

export const useOrderShipment = (orderId: string | undefined) => {
  return useQuery({
    queryKey: shippingKeys.shipmentByOrder(orderId || ''),
    queryFn: () => api.getOrderShipment(orderId || ''),
    enabled: !!orderId,
  });
};

export const useShipOrder = () => {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: (input: CreateShipmentInput) => api.shipOrder(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.shipmentByOrder(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: shippingKeys.shipments() });
      toast.success(t('shipping.create_shipment_success'));
    },
    onError: (error: unknown) => {
      toast.error(t('shipping.create_shipment_failed') + ': ' + getErrorDetail(error), 6000);
    },
  });
};

export const useSyncNow = () => {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: (orderId?: string) => api.syncNow(orderId),
    onSuccess: (_data, variables) => {
      if (variables) {
        queryClient.invalidateQueries({ queryKey: shippingKeys.shipmentByOrder(variables) });
      }
      queryClient.invalidateQueries({ queryKey: shippingKeys.shipments() });
      toast.success(t('shipping.sync_now_success'));
    },
    onError: (error: unknown) => {
      toast.error(t('shipping.sync_now_failed') + ': ' + getErrorDetail(error), 6000);
    },
  });
};

/* ------------------------------------------------------------------ */
/* Shipment list (management page)                                     */
/* ------------------------------------------------------------------ */

export const useShipments = (filters: ShipmentFilters) => {
  return useQuery({
    queryKey: shippingKeys.shipmentList(filters),
    queryFn: () => api.getShipments(filters),
  });
};
