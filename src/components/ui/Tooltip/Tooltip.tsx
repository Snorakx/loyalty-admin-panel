import React, { useState, useRef, useEffect } from 'react';
import styles from './Tooltip.module.scss';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  className?: string;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'auto',
  className = '',
  disabled = false
}) => {
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current || position !== 'auto') {
      setTooltipPosition(position as 'top' | 'bottom' | 'left' | 'right');
      return;
    }

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const margin = 24; // Margines od krawędzi viewport

    const space = {
      top: trigger.top,
      bottom: viewport.height - trigger.bottom,
      left: trigger.left,
      right: viewport.width - trigger.right
    };

    // Sprawdź dostępną przestrzeń dla każdej pozycji
    const availableSpace = {
      top: Math.max(0, space.top - margin),
      bottom: Math.max(0, space.bottom - margin),
      left: Math.max(0, space.left - margin),
      right: Math.max(0, space.right - margin)
    };

    // Sprawdź czy tooltip zmieści się w każdej pozycji
    const fits = {
      top: availableSpace.top >= tooltip.height,
      bottom: availableSpace.bottom >= tooltip.height,
      left: availableSpace.left >= tooltip.width,
      right: availableSpace.right >= tooltip.width
    };

    // Znajdź wszystkie pozycje które się zmieszczą
    const validPositions = Object.entries(fits)
      .filter(([_, fits]) => fits)
      .map(([position, _]) => position);

    if (validPositions.length > 0) {
      // Wybierz pozycję z największą dostępną przestrzenią
      const bestPosition = validPositions.reduce((best, current) => {
        const currentSpace = availableSpace[current as keyof typeof availableSpace];
        const bestSpace = availableSpace[best as keyof typeof availableSpace];
        return currentSpace > bestSpace ? current : best;
      });
      
      setTooltipPosition(bestPosition as 'top' | 'bottom' | 'left' | 'right');
    } else {
      // Fallback - wybierz pozycję z największą przestrzenią (nawet jeśli się nie zmieści)
      const maxSpace = Math.max(availableSpace.top, availableSpace.bottom, availableSpace.left, availableSpace.right);
      if (maxSpace === availableSpace.top) setTooltipPosition('top');
      else if (maxSpace === availableSpace.bottom) setTooltipPosition('bottom');
      else if (maxSpace === availableSpace.left) setTooltipPosition('left');
      else setTooltipPosition('right');
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      ref={triggerRef}
      className={`${styles.tooltipWrapper} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`${styles.tooltip} ${styles[tooltipPosition]}`}
        >
          <div className={styles.tooltipContent}>
            {content}
          </div>
        </div>
      )}
    </div>
  );
};
