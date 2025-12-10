# Integration Guide

This guide will help you integrate audit tracking into your React application step-by-step.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Tracking User Actions](#tracking-user-actions)
3. [Creating a Custom Hook](#creating-a-custom-hook)
4. [Displaying Audit Logs](#displaying-audit-logs)
5. [Advanced: Firebase Integration](#advanced-firebase-integration)
6. [Advanced: REST API Integration](#advanced-rest-api-integration)

## Basic Setup

### 1. Install the Package

```bash
npm install @audit-tracker/react
```

### 2. Configure the Provider

Wrap your root component with `AuditProvider`:

```tsx
// src/main.tsx or src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuditProvider } from '@audit-tracker/react';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuditProvider mode="local">
      <App />
    </AuditProvider>
  </React.StrictMode>
);
```

**Storage Modes:**
- `local`: Browser localStorage (no backend needed)
- `api`: REST API backend
- `firebase`: Firebase Cloud Firestore

## Tracking User Actions

### Basic Tracking

Use the `useAudit` hook anywhere in your app:

```tsx
import { useAudit } from '@audit-tracker/react';

function MyComponent() {
  const { track } = useAudit();

  const handleAction = async () => {
    // Your business logic
    
    // Track the action
    await track({
      action: 'ITEM_CREATED',
      entity: 'Item',
      entityId: '123',
      userId: currentUser.id,
      userName: currentUser.name,
      description: 'Created a new item',
      metadata: {
        itemName: 'Example Item',
        category: 'Electronics'
      }
    });
  };

  return <button onClick={handleAction}>Create Item</button>;
}
```

### Common Action Types

```tsx
// Create
await track({
  action: 'DOCUMENT_CREATED',
  entity: 'Document',
  entityId: documentId,
  description: `Document "${title}" was created`
});

// Update
await track({
  action: 'USER_UPDATED',
  entity: 'User',
  entityId: userId,
  description: 'User profile updated',
  metadata: {
    changes: {
      email: { old: 'old@email.com', new: 'new@email.com' }
    }
  }
});

// Delete
await track({
  action: 'PRODUCT_DELETED',
  entity: 'Product',
  entityId: productId,
  description: `Product "${productName}" was deleted`
});

// Status Change
await track({
  action: 'ORDER_SHIPPED',
  entity: 'Order',
  entityId: orderId,
  description: 'Order status changed to Shipped',
  metadata: {
    oldStatus: 'Processing',
    newStatus: 'Shipped',
    trackingNumber: 'ABC123'
  }
});
```

## Creating a Custom Hook

For consistent tracking across your app, create a custom hook:

```tsx
// src/hooks/useProjectAudit.ts
import { useAudit } from '@audit-tracker/react';
import { useAuth } from './useAuth'; // Your auth hook

export function useProjectAudit() {
  const { track } = useAudit();
  const { user } = useAuth(); // Get current user

  const trackAction = async (
    action: string,
    entity: string,
    entityId: string | number,
    description: string,
    metadata?: Record<string, any>
  ) => {
    await track({
      action,
      entity,
      entityId: String(entityId),
      userId: user?.id,
      userName: user?.name,
      description,
      metadata: {
        ...metadata,
        userEmail: user?.email,
        userRole: user?.role,
      }
    });
  };

  return { trackAction };
}
```

**Usage:**

```tsx
import { useProjectAudit } from '@/hooks/useProjectAudit';

function ProductManager() {
  const { trackAction } = useProjectAudit();

  const handleDelete = async (productId: number) => {
    // Delete product
    await deleteProduct(productId);
    
    // Track the action
    await trackAction(
      'PRODUCT_DELETED',
      'Product',
      productId,
      `Product ${productId} was deleted`
    );
  };

  return <button onClick={() => handleDelete(123)}>Delete</button>;
}
```

## Displaying Audit Logs

### Basic Table

```tsx
// src/pages/AuditLogs.tsx
import { AuditTable } from '@audit-tracker/react';

export function AuditLogsPage() {
  return (
    <div className="container">
      <h1>Audit Logs</h1>
      <AuditTable />
    </div>
  );
}
```

### Custom Columns

```tsx
import { AuditTable, ColumnConfig } from '@audit-tracker/react';

const columns: ColumnConfig[] = [
  {
    key: 'timestamp',
    label: 'Date & Time',
    width: '180px',
    sortable: true,
    render: (value) => new Date(value).toLocaleString()
  },
  {
    key: 'userName',
    label: 'User',
    width: '150px',
    sortable: true
  },
  {
    key: 'action',
    label: 'Action',
    width: '200px',
    sortable: true,
    render: (value) => (
      <span className={`badge ${getActionColor(value)}`}>
        {value}
      </span>
    )
  },
  {
    key: 'description',
    label: 'Details',
    width: 'auto'
  }
];

export function CustomAuditTable() {
  return (
    <AuditTable 
      columns={columns}
      pageSize={20}
      showFilters={true}
    />
  );
}
```

## Advanced: Firebase Integration

### 1. Install Firebase SDK

```bash
npm install firebase
```

### 2. Create Firebase Configuration

```tsx
// src/config/firebase.ts
export const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

export const auditFirebaseConfig = {
  config: firebaseConfig,
  collectionName: 'audit_events'
};
```

### 3. Update Your Provider

```tsx
// src/main.tsx
import { AuditProvider } from '@audit-tracker/react';
import { auditFirebaseConfig } from './config/firebase';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuditProvider 
    mode="firebase" 
    firebaseConfig={auditFirebaseConfig}
  >
    <App />
  </AuditProvider>
);
```

### 4. Configure Firebase Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /audit_events/{eventId} {
      // Allow authenticated users to create audit events
      allow create: if request.auth != null;
      
      // Allow authenticated users to read audit events
      allow read: if request.auth != null;
      
      // Prevent updates and deletes to maintain audit integrity
      allow update, delete: if false;
    }
  }
}
```

## Advanced: REST API Integration

### 1. Configure the Provider

```tsx
// src/main.tsx
import { AuditProvider } from '@audit-tracker/react';

const apiConfig = {
  baseUrl: process.env.VITE_API_URL || 'https://api.example.com',
  endpoints: {
    create: '/api/audit-logs',
    list: '/api/audit-logs'
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuditProvider mode="api" apiConfig={apiConfig}>
    <App />
  </AuditProvider>
);
```

### 2. Backend API Requirements

Your backend should implement two endpoints:

**POST /api/audit-logs** - Create audit event
```json
{
  "action": "USER_LOGIN",
  "entity": "User",
  "entityId": "123",
  "userId": "123",
  "userName": "John Doe",
  "description": "User logged in",
  "metadata": {},
  "timestamp": 1234567890
}
```

**GET /api/audit-logs** - List audit events
Query parameters:
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10)
- `sortField` - Field to sort by (default: timestamp)
- `sortDirection` - asc or desc (default: desc)
- `action` - Filter by action
- `entity` - Filter by entity
- `userId` - Filter by user

Response format:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

### Example Node.js Backend

```javascript
// routes/audit.js
const express = require('express');
const router = express.Router();

// Create audit log
router.post('/audit-logs', async (req, res) => {
  const auditEvent = {
    ...req.body,
    timestamp: Date.now(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  };
  
  await db.collection('audit_events').insertOne(auditEvent);
  res.json({ success: true });
});

// List audit logs
router.get('/audit-logs', async (req, res) => {
  const { page = 1, pageSize = 10, sortField = 'timestamp', sortDirection = 'desc' } = req.query;
  
  const skip = (page - 1) * pageSize;
  const sort = { [sortField]: sortDirection === 'desc' ? -1 : 1 };
  
  const data = await db.collection('audit_events')
    .find()
    .sort(sort)
    .skip(skip)
    .limit(parseInt(pageSize))
    .toArray();
  
  const total = await db.collection('audit_events').countDocuments();
  
  res.json({
    data,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    totalPages: Math.ceil(total / pageSize)
  });
});

module.exports = router;
```

## Best Practices

### 1. Consistent Action Naming

Use a consistent naming convention for actions:
```tsx
// Good
'USER_CREATED', 'DOCUMENT_UPDATED', 'ORDER_DELETED'

// Avoid
'create user', 'Updated Document', 'order-deleted'
```

### 2. Include Meaningful Descriptions

```tsx
// Good
description: 'User "John Doe" updated profile email from old@email.com to new@email.com'

// Avoid
description: 'Profile updated'
```

### 3. Use Metadata for Additional Context

```tsx
metadata: {
  changes: {
    email: { from: 'old@email.com', to: 'new@email.com' },
    phone: { from: '123-456-7890', to: '098-765-4321' }
  },
  ipAddress: '192.168.1.1',
  browser: 'Chrome 120'
}
```

### 4. Error Handling

```tsx
try {
  await track({
    action: 'PAYMENT_PROCESSED',
    entity: 'Payment',
    entityId: paymentId,
    description: 'Payment processed successfully'
  });
} catch (error) {
  console.error('Failed to log audit event:', error);
  // Don't block user action if audit logging fails
}
```

### 5. Centralize Audit Logic

Create utility functions or hooks to avoid repetition:

```tsx
// src/utils/audit.ts
export const AuditActions = {
  USER: {
    LOGIN: 'USER_LOGIN',
    LOGOUT: 'USER_LOGOUT',
    CREATED: 'USER_CREATED',
    UPDATED: 'USER_UPDATED',
    DELETED: 'USER_DELETED',
  },
  DOCUMENT: {
    CREATED: 'DOCUMENT_CREATED',
    VIEWED: 'DOCUMENT_VIEWED',
    UPDATED: 'DOCUMENT_UPDATED',
    DELETED: 'DOCUMENT_DELETED',
  }
};
```

## Troubleshooting

### Events Not Appearing in Firebase

1. Check Firebase security rules allow writes
2. Verify Firebase config is correct
3. Check browser console for errors
4. Ensure Firebase SDK is installed

### Events Not Appearing in API

1. Check network tab for failed requests
2. Verify API endpoint URLs are correct
3. Check authentication headers
4. Verify backend is running and accessible

### TypeScript Errors

Make sure you have the correct types installed:
```bash
npm install @types/react @types/react-dom
```

## Need Help?

- Check [EXAMPLES.md](./EXAMPLES.md) for more code examples
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Open an issue on GitHub for bugs or feature requests
