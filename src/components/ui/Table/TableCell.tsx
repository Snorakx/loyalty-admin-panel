import React from 'react';
import styles from './Table.module.scss';

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className, 
  align = 'left' 
}) => {
  return (
    <td 
      className={`${styles.tableCell} ${styles[`align-${align}`]} ${className || ''}`}
    >
      {children}
    </td>
  );
};

