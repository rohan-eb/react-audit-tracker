// Example: Display audit logs

import { AuditTable } from '@audit-tracker/react';

function AuditLogsPage() {
  return (
    <div>
      <h1>Audit Logs</h1>
      <AuditTable 
        pageSize={20}
        showFilters={true}
      />
    </div>
  );
}