/**
 * Core Types for React Audit Tracker
 */

/**
 * Audit event structure
 */
export interface AuditEvent {
  /** Unique identifier for the event */
  id?: string;
  /** Action performed (e.g., 'USER_LOGIN', 'DOCUMENT_CREATED') */
  action: string;
  /** Entity type affected (e.g., 'User', 'Document') */
  entity: string;
  /** ID of the affected entity */
  entityId?: string;
  /** ID of the user performing the action */
  userId?: string;
  /** Name of the user performing the action */
  userName?: string;
  /** Human-readable description */
  description?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Timestamp of the event (auto-generated if not provided) */
  timestamp?: number;
  /** IP address (optional) */
  ipAddress?: string;
  /** User agent (optional) */
  userAgent?: string;
}

/**
 * Storage mode types
 */
export type StorageMode = 'local' | 'api' | 'firebase';

/**
 * API configuration for external storage
 */
export interface ApiConfig {
  /** Base URL for the API */
  baseUrl: string;
  /** API endpoints */
  endpoints: {
    /** Endpoint to create audit logs */
    create: string;
    /** Endpoint to list/retrieve audit logs */
    list: string;
  };
  /** Custom headers (e.g., authorization) */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Provider configuration
 */
export interface AuditProviderConfig {
  /** Storage mode */
  mode?: StorageMode;
  /** API configuration (required when mode is 'api') */
  apiConfig?: ApiConfig;
  /** Firebase configuration (required when mode is 'firebase') */
  firebaseConfig?: any; // FirebaseConfig from adapters
  /** LocalStorage key prefix (default: 'audit_') */
  storageKey?: string;
  /** Maximum number of events to store in localStorage (default: 1000) */
  maxLocalEvents?: number;
}

/**
 * Filter options for querying audit logs
 */
export interface AuditFilter {
  /** Filter by action */
  action?: string;
  /** Filter by entity type */
  entity?: string;
  /** Filter by entity ID */
  entityId?: string;
  /** Filter by user ID */
  userId?: string;
  /** Filter by date range (start timestamp) */
  startDate?: number;
  /** Filter by date range (end timestamp) */
  endDate?: number;
  /** Search query */
  search?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  /** Page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
}

/**
 * Sort options
 */
export interface SortOptions {
  /** Field to sort by */
  field: keyof AuditEvent;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Query options for fetching audit logs
 */
export interface QueryOptions {
  /** Filters */
  filter?: AuditFilter;
  /** Pagination */
  pagination?: PaginationOptions;
  /** Sorting */
  sort?: SortOptions;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  /** Array of items */
  data: T[];
  /** Total number of items */
  total: number;
  /** Current page */
  page: number;
  /** Page size */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Storage adapter interface
 */
export interface StorageAdapter {
  /** Save an audit event */
  save(event: AuditEvent): Promise<void>;
  /** Query audit events */
  query(options?: QueryOptions): Promise<PaginatedResult<AuditEvent>>;
  /** Clear all audit events */
  clear?(): Promise<void>;
}

/**
 * Audit context value
 */
export interface AuditContextValue {
  /** Track an audit event */
  track: (event: Omit<AuditEvent, 'id' | 'timestamp'>) => Promise<void>;
  /** Query audit events */
  query: (options?: QueryOptions) => Promise<PaginatedResult<AuditEvent>>;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Clear error */
  clearError: () => void;
}

/**
 * Column configuration for AuditTable
 */
export interface ColumnConfig {
  /** Column key */
  key: keyof AuditEvent;
  /** Column label */
  label: string;
  /** Column width */
  width?: string;
  /** Custom render function */
  render?: (value: any, record: AuditEvent) => React.ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
}

/**
 * AuditTable component props
 */
export interface AuditTableProps {
  /** Custom columns configuration */
  columns?: ColumnConfig[];
  /** Page size */
  pageSize?: number;
  /** Show filter controls */
  showFilters?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}
