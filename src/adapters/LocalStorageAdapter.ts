import {
  AuditEvent,
  StorageAdapter,
  QueryOptions,
  PaginatedResult,
} from '../types';

/**
 * LocalStorage adapter for audit events
 * Provides zero-config default storage
 */
export class LocalStorageAdapter implements StorageAdapter {
  private storageKey: string;
  private maxEvents: number;

  constructor(storageKey = 'audit_events', maxEvents = 1000) {
    this.storageKey = storageKey;
    this.maxEvents = maxEvents;
  }

  /**
   * Save an audit event to localStorage
   */
  async save(event: AuditEvent): Promise<void> {
    try {
      const events = this.getAllEvents();
      
      // Generate ID and timestamp if not provided
      const newEvent: AuditEvent = {
        ...event,
        id: event.id || this.generateId(),
        timestamp: event.timestamp || Date.now(),
      };

      // Add new event
      events.unshift(newEvent);

      // Enforce max events limit
      if (events.length > this.maxEvents) {
        events.splice(this.maxEvents);
      }

      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(events));
    } catch (error) {
      console.error('Failed to save audit event:', error);
      throw new Error('Failed to save audit event to localStorage');
    }
  }

  /**
   * Query audit events from localStorage
   */
  async query(options?: QueryOptions): Promise<PaginatedResult<AuditEvent>> {
    try {
      let events = this.getAllEvents();

      // Apply filters
      if (options?.filter) {
        events = this.applyFilters(events, options.filter);
      }

      // Apply sorting
      if (options?.sort) {
        events = this.applySort(events, options.sort);
      }

      // Calculate pagination
      const page = options?.pagination?.page || 1;
      const pageSize = options?.pagination?.pageSize || 10;
      const total = events.length;
      const totalPages = Math.ceil(total / pageSize);

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = events.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Failed to query audit events:', error);
      throw new Error('Failed to query audit events from localStorage');
    }
  }

  /**
   * Clear all audit events
   */
  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear audit events:', error);
      throw new Error('Failed to clear audit events from localStorage');
    }
  }

  /**
   * Get all events from localStorage
   */
  private getAllEvents(): AuditEvent[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse audit events:', error);
      return [];
    }
  }

  /**
   * Apply filters to events
   */
  private applyFilters(events: AuditEvent[], filter: any): AuditEvent[] {
    return events.filter((event) => {
      if (filter.action && event.action !== filter.action) return false;
      if (filter.entity && event.entity !== filter.entity) return false;
      if (filter.entityId && event.entityId !== filter.entityId) return false;
      if (filter.userId && event.userId !== filter.userId) return false;
      if (filter.startDate && event.timestamp && event.timestamp < filter.startDate) return false;
      if (filter.endDate && event.timestamp && event.timestamp > filter.endDate) return false;
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const searchableFields = [
          event.action,
          event.entity,
          event.entityId,
          event.userName,
          event.description,
        ];
        const matches = searchableFields.some(
          (field) => field?.toLowerCase().includes(searchLower)
        );
        if (!matches) return false;
      }

      return true;
    });
  }

  /**
   * Apply sorting to events
   */
  private applySort(events: AuditEvent[], sort: any): AuditEvent[] {
    return [...events].sort((a, b) => {
      const aValue = a[sort.field as keyof AuditEvent];
      const bValue = b[sort.field as keyof AuditEvent];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
