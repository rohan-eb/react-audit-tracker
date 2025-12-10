import { ComponentType } from 'react';
import { useAutoAudit } from '../hooks/useAutoAudit';

interface WithAuditConfig {
  entity: string;
  module?: string;
  getUserContext?: () => {
    userId?: string;
    userName?: string;
    userEmail?: string;
  };
}

/**
 * HOC that injects audit tracking capabilities into a component
 * @param Component - Component to wrap
 * @param config - Audit configuration
 * @returns Wrapped component with audit props
 */
export function withAudit<P extends object>(
  Component: ComponentType<P & { audit: ReturnType<typeof useAutoAudit> }>,
  config: WithAuditConfig
) {
  return function WithAuditComponent(props: P) {
    const audit = useAutoAudit(config);
    
    return <Component {...props} audit={audit} />;
  };
}
