import React, { useState, useEffect } from 'react';
import { useAudit } from '../context';
import {
  AuditTableProps,
  AuditEvent,
  ColumnConfig,
  AuditFilter,
  SortOptions,
} from '../types';
import './AuditTable.css';

/**
 * Default columns configuration
 */
const defaultColumns: ColumnConfig[] = [
  {
    key: 'timestamp',
    label: 'Timestamp',
    width: '180px',
    sortable: true,
    render: (value) => value ? new Date(value).toLocaleString() : '-',
  },
  {
    key: 'action',
    label: 'Action',
    width: '150px',
    sortable: true,
  },
  {
    key: 'entity',
    label: 'Entity',
    width: '120px',
    sortable: true,
  },
  {
    key: 'entityId',
    label: 'Entity ID',
    width: '120px',
  },
  {
    key: 'userName',
    label: 'User',
    width: '150px',
    sortable: true,
  },
  {
    key: 'description',
    label: 'Description',
    width: 'auto',
  },
];

/**
 * AuditTable component
 * Pre-built table component to display audit logs
 */
export const AuditTable: React.FC<AuditTableProps> = ({
  columns = defaultColumns,
  pageSize = 10,
  showFilters = true,
  className = '',
  style = {},
}) => {
  const { query, loading, error } = useAudit();
  
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  
  const [filter, setFilter] = useState<AuditFilter>({});
  const [sort, setSort] = useState<SortOptions>({
    field: 'timestamp',
    direction: 'desc',
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Fetch audit events
   */
  const fetchEvents = async () => {
    try {
      const result = await query({
        filter: {
          ...filter,
          search: searchTerm || undefined,
        },
        pagination: {
          page: currentPage,
          pageSize,
        },
        sort,
      });
      
      setEvents(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch audit events:', err);
    }
  };

  /**
   * Fetch events on mount and when dependencies change
   */
  useEffect(() => {
    fetchEvents();
  }, [currentPage, pageSize, filter, sort, searchTerm]);

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /**
   * Handle sort change
   */
  const handleSort = (field: keyof AuditEvent) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  /**
   * Handle search
   */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (key: keyof AuditFilter, value: any) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setCurrentPage(1);
  };

  /**
   * Clear filters
   */
  const clearFilters = () => {
    setFilter({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className={`audit-table-container ${className}`} style={style}>
      {/* Filters */}
      {showFilters && (
        <div className="audit-table-filters">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="audit-table-search"
          />
          
          <select
            value={filter.action || ''}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="audit-table-filter-select"
          >
            <option value="">All Actions</option>
            {/* Add more options based on your use case */}
          </select>
          
          <select
            value={filter.entity || ''}
            onChange={(e) => handleFilterChange('entity', e.target.value)}
            className="audit-table-filter-select"
          >
            <option value="">All Entities</option>
            {/* Add more options based on your use case */}
          </select>
          
          <button onClick={clearFilters} className="audit-table-clear-btn">
            Clear Filters
          </button>
          
          <button onClick={fetchEvents} className="audit-table-refresh-btn">
            Refresh
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="audit-table-error">
          Error: {error.message}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="audit-table-loading">
          Loading...
        </div>
      )}

      {/* Table */}
      <div className="audit-table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={column.sortable ? 'sortable' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.label}
                  {column.sortable && sort.field === column.key && (
                    <span className="sort-indicator">
                      {sort.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="audit-table-empty">
                  No audit events found
                </td>
              </tr>
            ) : (
              events.map((event, index) => (
                <tr key={event.id || index}>
                  {columns.map((column) => {
                    const value = event[column.key];
                    return (
                      <td key={column.key}>
                        {column.render
                          ? column.render(value, event)
                          : typeof value === 'object' && value !== null
                          ? JSON.stringify(value)
                          : value || '-'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="audit-table-pagination">
        <div className="pagination-info">
          Showing {events.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, total)} of {total} entries
        </div>
        
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            First
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="pagination-current">
            Page {currentPage} of {totalPages || 1}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="pagination-btn"
          >
            Next
          </button>
          
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="pagination-btn"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};
