/**
 * useProjectServices - Fetches services subscribed to a project from the API.
 *
 * Falls back to the local config/services.ts when the API is unreachable,
 * so the portal always shows something useful.
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../services/ApiClientFactory';
import { getEnabledServices, resolveServiceIcon } from '@config/services';
import type { Service } from '@config/services';

// ---------------------------------------------------------------------------
// Types matching the backend ProjectServiceSerializer
// ---------------------------------------------------------------------------

export interface ApiService {
  id: number;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  type: 'internal' | 'external';
  url: string;
  route: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

export interface ApiProjectService {
  id: number;
  project_id: number;
  project_title: string;
  service_id: number;
  service_details: ApiService;
  is_enabled: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProjectServiceItem {
  id: string;          // service.name (e.g. 'flex-auth')
  name: string;        // display_name from API or t() key
  description: string; // from API or translation key
  icon: string;
  type: 'internal' | 'external';
  url?: string;
  route?: string;
  enabled: boolean;
  color?: string;
  /** Raw API data for advanced consumers */
  _raw?: ApiProjectService;
}

export interface UseProjectServicesReturn {
  services: ProjectServiceItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  /** Whether we are using the fallback local config */
  isFallback: boolean;
}

import { getApiOrigin } from '../lib/apiBaseUrl';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Base path to project-service feature endpoints (absolute from origin) */
const PROJECT_SERVICE_API_BASE = `${getApiOrigin()}/api/v1/project/project/feature`;

function getProjectId(): number {
  if (typeof window === 'undefined') return 11;
  try {
    const stored = localStorage.getItem('zv_project');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.id || 11;
    }
  } catch { /* ignore */ }
  return 11;
}

function mapApiToService(ps: ApiProjectService): ProjectServiceItem {
  const svc = ps.service_details;
  return {
    id: svc.name,
    name: svc.display_name || svc.name,
    description: svc.description || `service.${svc.name}.description`,
    icon: svc.icon || 'Circle',
    type: svc.type,
    url: svc.url || undefined,
    route: svc.route || undefined,
    enabled: ps.is_enabled,
    color: svc.color || undefined,
    _raw: ps,
  };
}

function localServicesAsFallback(): ProjectServiceItem[] {
  return getEnabledServices().map((s: Service) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    icon: typeof s.icon === 'string' ? s.icon : 'Circle',
    type: s.type,
    url: s.url,
    route: s.route,
    enabled: s.enabled,
    color: s.color,
  }));
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProjectServices(projectId?: number): UseProjectServicesReturn {
  const [services, setServices] = useState<ProjectServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const pid = projectId ?? getProjectId();

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const client = createClient();
      const response = await client.get<ApiProjectService[]>(
        `${PROJECT_SERVICE_API_BASE}/projects/${pid}/services/`
      );

      const data = response.data as unknown as ApiProjectService[];

      if (Array.isArray(data) && data.length > 0) {
        const mapped = data
          .filter(ps => ps.is_enabled && ps.service_details?.is_active)
          .map(mapApiToService);
        setServices(mapped);
        setIsFallback(false);
      } else {
        // API returned empty — use fallback
        setServices(localServicesAsFallback());
        setIsFallback(true);
      }
    } catch (err: any) {
      console.warn('[useProjectServices] API fetch failed, using fallback:', err?.message);
      setServices(localServicesAsFallback());
      setError(err?.message || 'Failed to fetch services');
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, [pid]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, isLoading, error, refetch: fetchServices, isFallback };
}

// Re-export resolveServiceIcon for convenience
export { resolveServiceIcon };
