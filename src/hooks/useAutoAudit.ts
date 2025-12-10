import { useCallback } from 'react';
import { useAudit } from '../context/AuditContext';

interface AutoAuditConfig {
  entity: string;
  module?: string;
  getUserContext?: () => {
    userId?: string;
    userName?: string;
    userEmail?: string;
  };
}

interface TrackOptions {
  entityId: string | number;
  action: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Hook that simplifies audit tracking with automatic user context
 * @param config - Configuration for auto-tracking
 * @returns Object with tracking utilities
 */
export const useAutoAudit = (config: AutoAuditConfig) => {
  const { track } = useAudit();
  const { entity, module, getUserContext } = config;

  /**
   * Track an action with automatic user context injection
   */
  const trackAction = useCallback(
    async (options: TrackOptions) => {
      const userContext = getUserContext?.() || {};
      
      const eventData = {
        action: options.action,
        entity,
        entityId: String(options.entityId),
        userId: userContext.userId,
        userName: userContext.userName,
        description: options.description || `${options.action} on ${entity}`,
        metadata: {
          ...options.metadata,
          userEmail: userContext.userEmail,
          module,
        },
      };
      
      await track(eventData);
    },
    [track, entity, module, getUserContext]
  );

  /**
   * Track a create action
   */
  const trackCreate = useCallback(
    async (entityId: string | number, data?: any, description?: string) => {
      await trackAction({
        entityId,
        action: 'CREATE',
        description: description || `Created ${entity}`,
        metadata: { data },
      });
    },
    [trackAction, entity]
  );

  /**
   * Track an update action with automatic change detection
   */
  const trackUpdate = useCallback(
    async (
      entityId: string | number,
      oldData: any,
      newData: any,
      description?: string,
      fieldsToTrack?: string[]
    ) => {
      const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

      // Detect changes
      const fields = fieldsToTrack || Object.keys(newData);
      fields.forEach((field) => {
        if (oldData[field] !== newData[field]) {
          changes.push({
            field,
            oldValue: oldData[field],
            newValue: newData[field],
          });
        }
      });

      if (changes.length > 0) {
        await trackAction({
          entityId,
          action: 'UPDATE',
          description: description || `Updated ${entity}`,
          metadata: { 
            changes,
            // Preserve any additional metadata
          },
        });
      }
    },
    [trackAction, entity]
  );

  /**
   * Track a delete action
   */
  const trackDelete = useCallback(
    async (entityId: string | number, data?: any, description?: string) => {
      await trackAction({
        entityId,
        action: 'DELETE',
        description: description || `Deleted ${entity}`,
        metadata: { data },
      });
    },
    [trackAction, entity]
  );

  /**
   * Track a status change (archive, activate, etc.)
   */
  const trackStatusChange = useCallback(
    async (
      entityId: string | number,
      action: string,
      oldStatus: string,
      newStatus: string,
      description?: string
    ) => {
      await trackAction({
        entityId,
        action,
        description: description || `Changed ${entity} status from ${oldStatus} to ${newStatus}`,
        metadata: {
          changes: [
            {
              field: 'status',
              oldValue: oldStatus,
              newValue: newStatus,
            },
          ],
        },
      });
    },
    [trackAction, entity]
  );

  return {
    trackAction,
    trackCreate,
    trackUpdate,
    trackDelete,
    trackStatusChange,
  };
};
