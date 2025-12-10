// Main exports
export { AuditProvider, useAudit } from './context';
export { AuditTable } from './components';

// Hook exports
export { useAutoAudit } from './hooks';

// HOC exports
export { withAudit } from './hoc';

// Type exports
export type {
  AuditEvent,
  StorageMode,
  ApiConfig,
  AuditProviderConfig,
  AuditFilter,
  PaginationOptions,
  SortOptions,
  QueryOptions,
  PaginatedResult,
  StorageAdapter,
  AuditContextValue,
  ColumnConfig,
  AuditTableProps,
} from './types';

// Adapter exports (for advanced use cases)
export { LocalStorageAdapter, ApiAdapter, FirebaseAdapter } from './adapters';
export type { FirebaseConfig } from './adapters/FirebaseAdapter';
