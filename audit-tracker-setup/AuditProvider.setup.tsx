import { AuditProvider } from '@audit-tracker/react';

function App() {
  return (
    <AuditProvider mode="local">
      {/* Your app components */}
    </AuditProvider>
  );
}

export default App;