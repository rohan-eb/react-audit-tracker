# Architecture Documentation

## Overview

The React Audit Tracker follows a **Storage Adapter Pattern** to provide flexibility in how audit events are stored while maintaining a consistent API for developers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      Application                         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  AuditProvider                           │
│  - Configures storage mode                              │
│  - Initializes appropriate adapter                      │
│  - Provides context to children                         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              StorageAdapter (Interface)                  │
│  - save(event): Promise<void>                           │
│  - query(options): Promise<PaginatedResult>             │
│  - clear(): Promise<void>                               │
└───────────┬──────────────────┬──────────────────────────┘
            │                  │                  │
            ▼                  ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ LocalStorage     │  │   ApiAdapter     │  │ FirebaseAdapter  │
│ Adapter          │  │ - REST API       │  │ - Cloud Firestore│
│ - Default        │  │ - Any backend    │  │ - Serverless     │
│ - Zero config    │  │ - MongoDB, etc.  │  │ - Real-time sync │
│ - Client-side    │  │ - Custom auth    │  │ - Scalable       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

## Components

### 1. AuditProvider

**Purpose:** Main configuration component that wraps the application.

**Responsibilities:**
- Accept configuration (mode, apiConfig, etc.)
- Initialize the appropriate storage adapter
- Provide audit context to children
- Manage loading and error states

**Props:**
```typescript
interface AuditProviderProps {
  mode?: 'local' | 'api';
  apiConfig?: ApiConfig;
  storageKey?: string;
  maxLocalEvents?: number;
  children: React.ReactNode;
}
```

### 2. useAudit Hook

**Purpose:** Provide access to audit functionality from any component.

**Returns:**
```typescript
interface AuditContextValue {
  track: (event) => Promise<void>;
  query: (options?) => Promise<PaginatedResult>;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
}
```

**Usage:**
```typescript
const { track, query, loading, error } = useAudit();
```

### 3. StorageAdapter Interface

**Purpose:** Abstract interface for different storage implementations.

**Methods:**
```typescript
interface StorageAdapter {
  save(event: AuditEvent): Promise<void>;
  query(options?: QueryOptions): Promise<PaginatedResult<AuditEvent>>;
  clear?(): Promise<void>;
}
```

### 4. LocalStorageAdapter

**Purpose:** Default adapter that stores events in browser localStorage.

**Features:**
- Zero configuration required
- Automatic event rotation (max events limit)
- Client-side filtering, sorting, and pagination
- Works offline

**Implementation:**
- Stores events as JSON array in localStorage
- Generates unique IDs and timestamps
- Enforces max events limit (default: 1000)
- Provides in-memory filtering and sorting

### 5. ApiAdapter

**Purpose:** Adapter for external storage (REST API, databases, etc.).

**Features:**
- Configurable endpoints
- Custom headers support
- Timeout configuration
- Works with any backend (Node.js, Python, Go, etc.)

**Implementation:**
- Sends POST requests to create endpoint
- Sends GET requests to list endpoint with query parameters
- Delegates filtering, sorting, and pagination to backend

### 6. FirebaseAdapter

**Purpose:** Adapter for Firebase Cloud Firestore (serverless, real-time).

**Features:**
- Zero backend infrastructure needed
- Real-time data synchronization
- Automatic scaling
- Built-in security rules
- Offline support (optional)

**Implementation:**
- Uses Firebase SDK to initialize Firestore
- Saves audit events to specified collection
- Supports both flat and nested config structures
- Lazy initialization for optimal bundle size
- Dynamic imports to avoid bundling Firebase when not used

**Configuration:**
```typescript
{
  config: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  },
  collectionName?: string; // defaults to 'audit_events'
}
```

### 7. AuditTable Component

**Purpose:** Ready-to-use table component for displaying audit logs.

**Features:**
- Automatic data fetching
- Pagination controls
- Sortable columns
- Filter controls
- Search functionality
- Responsive design

**Props:**
```typescript
interface AuditTableProps {
  columns?: ColumnConfig[];
  pageSize?: number;
  showFilters?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
```

## Data Flow

### Tracking an Event

```
User Action (e.g., button click)
    ↓
track({ action, entity, ... })
    ↓
AuditProvider (context)
    ↓
StorageAdapter.save(event)
    ↓
├─ LocalStorageAdapter → localStorage.setItem()
└─ ApiAdapter → fetch(POST /api/audit-logs)
    ↓
Success/Error feedback
```

### Querying Events

```
Component renders (e.g., AuditTable)
    ↓
query({ filter, pagination, sort })
    ↓
AuditProvider (context)
    ↓
StorageAdapter.query(options)
    ↓
├─ LocalStorageAdapter → localStorage.getItem() + filter/sort/paginate
└─ ApiAdapter → fetch(GET /api/audit-logs?filter=...&page=...)
    ↓
PaginatedResult<AuditEvent[]>
    ↓
Render table with data
```

## Key Design Decisions

### 1. Storage Adapter Pattern

**Why:** Allows switching storage backends without changing application code.

**Benefits:**
- Single API for all storage types
- Easy to test (mock adapters)
- Extensible for new storage types

### 2. Zero Config Default

**Why:** LocalStorage as default enables immediate usage without backend.

**Benefits:**
- Fast prototyping
- Works in demos and MVPs
- No backend dependency during development

### 3. Configuration-Based Switching

**Why:** Switching storage should only require changing provider props.

**Benefits:**
- No code changes in application
- Easy to switch environments (dev/staging/prod)
- Simplified deployment

### 4. Provider-Based Architecture

**Why:** React Context provides clean dependency injection.

**Benefits:**
- No prop drilling
- Single source of truth
- Scoped configurations (multiple providers)

### 5. TypeScript First

**Why:** Strong typing improves DX and reduces errors.

**Benefits:**
- Autocomplete in IDEs
- Type safety at compile time
- Self-documenting API

## Extension Points

### Custom Adapters

Developers can create custom adapters by implementing the `StorageAdapter` interface:

```typescript
import { StorageAdapter, AuditEvent, QueryOptions, PaginatedResult } from 'react-audit-tracker';

class CustomAdapter implements StorageAdapter {
  async save(event: AuditEvent): Promise<void> {
    // Custom implementation
  }

  async query(options?: QueryOptions): Promise<PaginatedResult<AuditEvent>> {
    // Custom implementation
  }
}

// Usage
<AuditProvider adapter={new CustomAdapter()}>
  <App />
</AuditProvider>
```

### Custom Columns

Developers can customize table display:

```typescript
const customColumns: ColumnConfig[] = [
  {
    key: 'timestamp',
    label: 'Date',
    render: (value) => formatDate(value),
    sortable: true,
  },
  // More columns...
];

<AuditTable columns={customColumns} />
```

## Performance Considerations

### LocalStorage Adapter
- **Limit:** 5-10MB browser limit
- **Solution:** Auto-rotate events (maxLocalEvents config)
- **Best for:** Small to medium-sized applications

### API Adapter
- **Limit:** Network latency
- **Solution:** Implement caching, debouncing
- **Best for:** Enterprise applications with dedicated backend

## Security Considerations

1. **Authentication:** Pass auth tokens via apiConfig.headers
2. **Authorization:** Backend should validate user permissions
3. **Data Sanitization:** Backend should sanitize/validate events
4. **HTTPS:** Always use HTTPS for API endpoints
5. **Rate Limiting:** Backend should implement rate limiting

## Testing Strategy

### Unit Tests
- Test each adapter independently
- Mock fetch for ApiAdapter
- Mock localStorage for LocalStorageAdapter

### Integration Tests
- Test AuditProvider with different configs
- Test useAudit hook functionality
- Test AuditTable rendering and interactions

### E2E Tests
- Test complete user flows
- Test error scenarios
- Test with real backend (staging)
