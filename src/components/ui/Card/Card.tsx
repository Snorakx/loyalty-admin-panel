import React from 'react';
import styles from './Card.module.scss';

interface CardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  id,
  children,
  className = '',
  onClick
}) => {
  const cardClassName = [
    styles.card,
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      id={id}
      className={cardClassName}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
