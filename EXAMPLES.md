# React Audit Tracker - Usage Examples

## 🎯 Interactive Live Demos

**Want to see these examples running live?** Try our StackBlitz demos:

- 🚀 **[Basic Demo](https://stackblitz.com/edit/vitejs-vite-ghmb2czt)** - LocalStorage examples running live
- 🔥 **[Firebase Demo](https://stackblitz.com/edit/vitejs-vite-dd7ftpnn)** - Firestore integration
- 🌐 **[API Demo](https://stackblitz.com/edit/vitejs-vite-vetcqadd)** - REST API examples

Click any demo to open a fully working environment with editable code!

---

## Example 1: Zero Config (LocalStorage Only)

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuditProvider, useAudit, AuditTable } from 'react-audit-tracker';

// Component that tracks events
function UserActions() {
  const { track } = useAudit();

  const handleLogin = async () => {
    await track({
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: 'user-123',
      userName: 'John Doe',
      description: 'User logged in successfully',
    });
  };

  const handleLogout = async () => {
    await track({
      action: 'USER_LOGOUT',
      entity: 'User',
      entityId: 'user-123',
      userName: 'John Doe',
      description: 'User logged out',
    });
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

// Component that displays audit logs
function AuditPage() {
  return (
    <div>
      <h1>Audit Logs</h1>
      <AuditTable />
    </div>
  );
}

// Main App
function App() {
  return (
    <AuditProvider mode="local">
      <div>
        <UserActions />
        <AuditPage />
      </div>
    </AuditProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

## Example 2: REST API Backend

```tsx
import React from 'react';
import { AuditProvider, useAudit, AuditTable } from 'react-audit-tracker';

// Get auth token from your auth system
const authToken = localStorage.getItem('authToken');

function App() {
  return (
    <AuditProvider
      mode="api"
      apiConfig={{
        baseUrl: 'https://api.example.com',
        endpoints: {
          create: '/api/audit-logs',
          list: '/api/audit-logs',
        },
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds
      }}
    >
      <YourApp />
    </AuditProvider>
  );
}

// Usage remains the same
function DocumentManager() {
## Example 3: Firebase Cloud Firestore

```tsx
import React from 'react';
import { AuditProvider, useAudit } from 'react-audit-tracker';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxxx"
};

function App() {
  return (
    <AuditProvider
      mode="firebase"
      firebaseConfig={{
        config: firebaseConfig,
        collectionName: 'audit_events' // Optional, defaults to 'audit_events'
      }}
    >
      <YourApp />
    </AuditProvider>
  );
}

function DocumentManager() {
  const { track } = useAudit();

  const handleDocumentCreate = async (docId: string) => {
    await track({
      action: 'DOCUMENT_CREATED',
      entity: 'Document',
      entityId: docId,
      description: `Document ${docId} was created`,
      metadata: {
        size: 1024,
        type: 'pdf',
      },
    });
  };

  return <div>...</div>;
}
```

**Note:** Install Firebase SDK:
```bash
npm install firebase
```

## Example 4: Custom Columns in AuditTable

```tsx
import React from 'react';
import { AuditTable, ColumnConfig } from 'react-audit-tracker';

const customColumns: ColumnConfig[] = [
  {
    key: 'timestamp',
    label: 'Date & Time',
    width: '200px',
    sortable: true,
    render: (value) => {
      const date = new Date(value);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
  },
  {
    key: 'action',
    label: 'Event Type',
    width: '150px',
    sortable: true,
    render: (value) => (
      <span style={{ 
        padding: '4px 8px', 
        borderRadius: '4px',
        background: value.includes('DELETE') ? '#fee' : '#efe',
      }}>
        {value}
      </span>
    ),
  },
  {
    key: 'userName',
    label: 'User',
    width: '150px',
  },
  {
    key: 'description',
    label: 'Details',
    width: 'auto',
  },
];

function CustomAuditPage() {
  return (
    <AuditTable
      columns={customColumns}
      pageSize={20}
      showFilters={true}
      className="my-custom-class"
    />
  );
}
```

## Example 5: Error Handling

```tsx
import React from 'react';
import { useAudit } from 'react-audit-tracker';

function FormWithAudit() {
  const { track, loading, error, clearError } = useAudit();

  const handleSubmit = async (formData: any) => {
    try {
      // Your form submission logic
      await submitForm(formData);
      
      // Track the event
      await track({
        action: 'FORM_SUBMITTED',
        entity: 'Form',
        entityId: formData.id,
        description: 'Form submitted successfully',
      });
    } catch (err) {
      console.error('Failed to track audit event:', err);
    }
  };

  return (
    <div>
      {error && (
        <div className="error-message">
          {error.message}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* form fields */}
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
```

## Example 6: Multiple Providers (Advanced)

```tsx
import React from 'react';
import { AuditProvider } from 'react-audit-tracker';

// Different audit systems for different parts of the app
function App() {
  return (
    <AuditProvider mode="local" storageKey="admin_audit">
      <AdminPanel />
      
      <AuditProvider mode="api" apiConfig={userApiConfig}>
        <UserDashboard />
      </AuditProvider>
    </AuditProvider>
  );
}
```

## Example 7: Tracking with Metadata

```tsx
import React from 'react';
import { useAudit } from 'react-audit-tracker';

function PaymentProcessor() {
  const { track } = useAudit();

  const processPayment = async (payment: Payment) => {
    try {
      const result = await processPaymentApi(payment);
      
      await track({
        action: 'PAYMENT_PROCESSED',
        entity: 'Payment',
        entityId: payment.id,
        userId: payment.userId,
        userName: payment.userName,
        description: `Payment of $${payment.amount} processed successfully`,
        metadata: {
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: result.status,
          transactionId: result.transactionId,
        },
      });
    } catch (error) {
      await track({
        action: 'PAYMENT_FAILED',
        entity: 'Payment',
        entityId: payment.id,
        description: `Payment failed: ${error.message}`,
        metadata: {
          amount: payment.amount,
          error: error.message,
        },
      });
    }
  };

  return <div>...</div>;
}
```

## Example 8: Programmatic Query

```tsx
import React, { useEffect, useState } from 'react';
import { useAudit, AuditEvent } from 'react-audit-tracker';

function UserActivityReport({ userId }: { userId: string }) {
  const { query } = useAudit();
  const [activities, setActivities] = useState<AuditEvent[]>([]);

  useEffect(() => {
    const fetchUserActivities = async () => {
      const result = await query({
        filter: {
          userId,
          startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
        },
        pagination: {
          page: 1,
          pageSize: 50,
        },
        sort: {
          field: 'timestamp',
          direction: 'desc',
        },
      });
      
      setActivities(result.data);
    };

    fetchUserActivities();
  }, [userId, query]);

  return (
    <div>
      <h2>User Activity (Last 7 Days)</h2>
      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            {activity.action} - {activity.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
```
