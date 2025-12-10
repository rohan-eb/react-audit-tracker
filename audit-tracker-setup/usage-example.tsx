// Example: Track user actions in your components

import { useAudit } from '@audit-tracker/react';

function MyComponent() {
  const { track, loading } = useAudit();

  const handleSave = async () => {
    try {
      // Your business logic here
      
      // Track the action
      await track({
        action: 'DOCUMENT_CREATED',
        entity: 'Document',
        entityId: '123',
        userId: currentUser?.id,
        userName: currentUser?.name,
        description: 'User created a new document',
        metadata: {
          fileName: 'report.pdf',
          fileSize: 1024
        }
      });
      
      console.log('Action tracked successfully!');
    } catch (error) {
      console.error('Failed to track action:', error);
    }
  };

  return (
    <button onClick={handleSave} disabled={loading}>
      Save Document
    </button>
  );
}