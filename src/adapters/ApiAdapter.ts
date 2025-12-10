import {
  AuditEvent,
  StorageAdapter,
  QueryOptions,
  PaginatedResult,
  ApiConfig,
} from '../types';

/**
 * API adapter for audit events
 * Supports REST API, MongoDB, and other database backends
 */
export class ApiAdapter implements StorageAdapter {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  /**
   * Save an audit event via API
   */
  async save(event: AuditEvent): Promise<void> {
    try {
      const url = `${this.config.baseUrl}${this.config.endpoints.create}`;
      
      // Add timestamp if not provided
      const eventData: AuditEvent = {
        ...event,
        timestamp: event.timestamp || Date.now(),
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(eventData),
        signal: this.config.timeout
          ? AbortSignal.timeout(this.config.timeout)
          : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to save audit event via API:', error);
      throw new Error('Failed to save audit event via API');
    }
  }

  /**
   * Query audit events via API
   */
  async query(options?: QueryOptions): Promise<PaginatedResult<AuditEvent>> {
    try {
      const url = this.buildQueryUrl(options);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        signal: this.config.timeout
          ? AbortSignal.timeout(this.config.timeout)
          : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Ensure the response matches our expected format
      return {
        data: result.data || [],
        total: result.total || 0,
        page: result.page || 1,
        pageSize: result.pageSize || 10,
        totalPages: result.totalPages || 0,
      };
    } catch (error) {
      console.error('Failed to query audit events via API:', error);
      throw new Error('Failed to query audit events via API');
    }
  }

  /**
   * Build query URL with parameters
   */
  private buildQueryUrl(options?: QueryOptions): string {
    const baseUrl = `${this.config.baseUrl}${this.config.endpoints.list}`;
    const params = new URLSearchParams();

    if (options?.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    if (options?.pagination) {
      params.append('page', String(options.pagination.page));
      params.append('pageSize', String(options.pagination.pageSize));
    }

    if (options?.sort) {
      params.append('sortField', options.sort.field);
      params.append('sortDirection', options.sort.direction);
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }
}
