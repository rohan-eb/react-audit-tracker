import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  AuditProviderConfig,
  AuditContextValue,
  AuditEvent,
  QueryOptions,
  PaginatedResult,
  StorageAdapter,
} from '../types';
import { LocalStorageAdapter, ApiAdapter, FirebaseAdapter } from '../adapters';

/**
 * Audit context
 */
const AuditContext = createContext<AuditContextValue | null>(null);

/**
 * Provider props
 */
interface AuditProviderProps extends AuditProviderConfig {
  children: React.ReactNode;
}

/**
 * AuditProvider component
 * Main provider that configures the audit system
 */
export const AuditProvider: React.FC<AuditProviderProps> = ({
  children,
  mode = 'local',
  apiConfig,
  firebaseConfig,
  storageKey = 'audit_events',
  maxLocalEvents = 1000,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Initialize storage adapter based on mode
   */
  const adapter: StorageAdapter = useMemo(() => {
    if (mode === 'api') {
      if (!apiConfig) {
        throw new Error('apiConfig is required when mode is "api"');
      }
      return new ApiAdapter(apiConfig);
    }
    if (mode === 'firebase') {
      if (!firebaseConfig) {
        throw new Error('firebaseConfig is required when mode is "firebase"');
      }
      return new FirebaseAdapter(firebaseConfig);
    }
    return new LocalStorageAdapter(storageKey, maxLocalEvents);
  }, [mode, apiConfig, firebaseConfig, storageKey, maxLocalEvents]);

  /**
   * Track an audit event
   */
  const track = useCallback(
    async (event: Omit<AuditEvent, 'id' | 'timestamp'>) => {
      setLoading(true);
      setError(null);
      
      try {
        await adapter.save(event as AuditEvent);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to track audit event');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [adapter, mode]
  );

  /**
   * Query audit events
   */
  const query = useCallback(
    async (options?: QueryOptions): Promise<PaginatedResult<AuditEvent>> => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await adapter.query(options);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to query audit events');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [adapter]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: AuditContextValue = useMemo(
    () => ({
      track,
      query,
      loading,
      error,
      clearError,
    }),
    [track, query, loading, error, clearError]
  );

  return (
    <AuditContext.Provider value={contextValue}>
      {children}
    </AuditContext.Provider>
  );
};

/**
 * useAudit hook
 * Hook to access audit functionality
 */
export const useAudit = (): AuditContextValue => {
  const context = useContext(AuditContext);
  
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  
  return context;
};
