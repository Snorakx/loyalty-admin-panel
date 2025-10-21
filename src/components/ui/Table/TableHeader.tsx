import React from 'react';
import styles from './Table.module.scss';

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead className={`${styles.tableHeader} ${className || ''}`}>
      <tr>{children}</tr>
    </thead>
  );
};

