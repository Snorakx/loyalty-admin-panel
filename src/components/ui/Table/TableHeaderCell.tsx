import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import styles from './Table.module.scss';

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ 
  children, 
  className,
  sortable = false,
  sortDirection = null,
  onSort
}) => {
  return (
    <th 
      className={`${styles.tableHeaderCell} ${sortable ? styles.sortable : ''} ${className || ''}`}
      onClick={sortable ? onSort : undefined}
    >
      <div className={styles.headerContent}>
        {children}
        {sortable && (
          <span className={styles.sortIcon}>
            {sortDirection === 'asc' && <ChevronUp size={14} />}
            {sortDirection === 'desc' && <ChevronDown size={14} />}
            {sortDirection === null && <ChevronDown size={14} className={styles.inactive} />}
          </span>
        )}
      </div>
    </th>
  );
};

