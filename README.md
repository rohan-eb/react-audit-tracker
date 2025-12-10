# react-audit-tracker

A production-ready React audit/activity tracking package with support for localStorage, REST API, and Firebase Cloud Firestore.

## 📚 Documentation

- **[Integration Guide](./INTEGRATION_GUIDE.md)** - Step-by-step guide to integrate audit tracking into your app
- **[Examples](./EXAMPLES.md)** - Code examples for common use cases
- **[Architecture](./ARCHITECTURE.md)** - Technical details and design patterns

## Features

- 🚀 **Zero Config** - Works out-of-the-box with localStorage
- 🔌 **Pluggable** - Easily switch between localStorage, REST API, or Firebase
- 📊 **Built-in UI** - Ready-made audit table component with pagination, sorting, and filtering
- 🎯 **TypeScript** - Fully typed for excellent developer experience
- ☁️ **Cloud Ready** - Firebase Firestore support for serverless audit logs
- 🏢 **Enterprise Ready** - Scalable architecture suitable for any React application
- 🎨 **Customizable** - Configure storage, behavior, and UI via props

## Installation

```bash
npm install react-audit-tracker
# or
yarn add react-audit-tracker
```

## Quick Start (Zero Backend)

The fastest way to get started - no backend required!

### Step 1: Install the package

```bash
npm install react-audit-tracker
```

### Step 2: Wrap your app with AuditProvider

```tsx
// src/App.tsx
import { AuditProvider } from 'react-audit-tracker';

function App() {
  return (
    <AuditProvider mode="local">
      <YourApp />
    </AuditProvider>
  );
}
```

### Step 3: Track events in your components

```tsx
// src/components/MyComponent.tsx
import { useAudit } from 'react-audit-tracker';

function MyComponent() {
  const { track } = useAudit();
  
  const handleLogin = async () => {
    // Your login logic here
    
    // Track the event
    await track({
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: '123',
      userId: '123',
      userName: 'John Doe',
      description: 'User logged in successfully'
    });
  };
  
  return <button onClick={handleLogin}>Login</button>;
}
```

### Step 4: Display audit logs

```tsx
// src/pages/AuditLogs.tsx
import { AuditTable } from 'react-audit-tracker';

function AuditPage() {
  return (
    <div>
      <h1>Audit Logs</h1>
      <AuditTable />
    </div>
  );
}
```

That's it! Your audit tracking is now working with zero configuration.

## API / Database Integration

### REST API Mode

```tsx
<AuditProvider 
  mode="api"
  apiConfig={{
    baseUrl: 'https://api.example.com',
    endpoints: {
      create: '/audit-logs',
      list: '/audit-logs',
    },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }}
>
  <YourApp />
</AuditProvider>
```

### Firebase Cloud Firestore Mode

```tsx
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

<AuditProvider 
  mode="firebase"
  firebaseConfig={{
    config: firebaseConfig,
    collectionName: 'audit_events' // Optional, defaults to 'audit_events'
  }}
>
  <YourApp />
</AuditProvider>
```

**Note:** You need to install Firebase SDK as a peer dependency:
```bash
npm install firebase
```

## API Reference

### `<AuditProvider>`

Main provider component that configures the audit system.

**Props:**
- `mode`: `'local'` | `'api'` | `'firebase'` - Storage mode (default: `'local'`)
- `apiConfig?`: Configuration for API mode
  - `baseUrl`: API base URL
  - `endpoints`: Object with `create` and `list` endpoints
  - `headers?`: Custom headers (e.g., auth tokens)
  - `timeout?`: Request timeout in ms
- `firebaseConfig?`: Configuration for Firebase mode
  - `config`: Firebase app configuration object
  - `collectionName?`: Firestore collection name (default: `'audit_events'`)
- `storageKey?`: LocalStorage key name (default: `'audit_events'`)
- `maxLocalEvents?`: Max events in localStorage (default: 1000)

### `useAudit()`

Hook to access audit functionality.

**Returns:**
- `track(event)`: Function to log an audit event
- `loading`: Boolean indicating if an operation is in progress
- `error`: Error object if operation failed

### `<AuditTable>`

Pre-built table component to display audit logs.

**Props:**
- `columns?`: Array of column configurations
- `pageSize?`: Number of rows per page (default: 10)
- `showFilters?`: Show filter controls (default: true)
- `className?`: Custom CSS class

## Event Structure

```typescript
interface AuditEvent {
  action: string;           // e.g., 'USER_LOGIN', 'DOCUMENT_CREATED'
  entity: string;           // e.g., 'User', 'Document'
  entityId?: string;        // ID of the affected entity
  userId?: string;          // ID of the user performing the action
  userName?: string;        // Name of the user
  description?: string;     // Human-readable description
  metadata?: Record<string, any>; // Additional data
  timestamp?: number;       // Auto-generated if not provided
}
```

## Architecture

The package uses a **Storage Adapter Pattern**:

```
AuditProvider
    ↓
StorageAdapter (interface)
    ↓
├── LocalStorageAdapter (default, zero-config)
├── ApiAdapter (REST API / any backend)
└── FirebaseAdapter (Cloud Firestore)
```

All components (`useAudit`, `AuditTable`) work against the selected adapter, ensuring consistent behavior regardless of storage type.

## Use Cases

- **Admin Panels**: Track user actions, configuration changes
- **SaaS Applications**: Audit trail for compliance and security
- **E-commerce**: Order modifications, inventory changes
- **CMS Systems**: Content creation, editing, publishing
- **Learning Management Systems**: Student activities, course modifications
- **Healthcare Apps**: HIPAA-compliant audit logs
- **Financial Apps**: Transaction auditing, user activities

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Supports all modern React versions (16.8+)

## Peer Dependencies

```json
{
  "react": ">=16.8.0",
  "react-dom": ">=16.8.0",
  "firebase": ">=9.0.0" // Optional, only if using Firebase mode
}
```

## Next Steps

1. **Read the [Integration Guide](./INTEGRATION_GUIDE.md)** - Complete step-by-step instructions
2. **Explore [Examples](./EXAMPLES.md)** - Real-world code examples
3. **Review [Architecture](./ARCHITECTURE.md)** - Understand how it works
4. **Start with localStorage** - No backend needed to get started
5. **Upgrade to Firebase or API** - When you need cloud storage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

