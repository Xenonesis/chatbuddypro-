import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const Tooltip = ({
  content,
  children,
  side = "top",
  align = "center",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  // Calculate position when visible changes or on scroll/resize
  const calculatePosition = React.useCallback(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    
    // Calculate position based on side and align props
    switch (side) {
      case "top":
        top = -tooltipRect.height - 8;
        if (align === "start") {
          left = 0;
        } else if (align === "end") {
          left = triggerRect.width - tooltipRect.width;
        } else {
          left = (triggerRect.width - tooltipRect.width) / 2;
        }
        break;
      case "right":
        left = triggerRect.width + 8;
        if (align === "start") {
          top = 0;
        } else if (align === "end") {
          top = triggerRect.height - tooltipRect.height;
        } else {
          top = (triggerRect.height - tooltipRect.height) / 2;
        }
        break;
      case "bottom":
        top = triggerRect.height + 8;
        if (align === "start") {
          left = 0;
        } else if (align === "end") {
          left = triggerRect.width - tooltipRect.width;
        } else {
          left = (triggerRect.width - tooltipRect.width) / 2;
        }
        break;
      case "left":
        left = -tooltipRect.width - 8;
        if (align === "start") {
          top = 0;
        } else if (align === "end") {
          top = triggerRect.height - tooltipRect.height;
        } else {
          top = (triggerRect.height - tooltipRect.height) / 2;
        }
        break;
    }

    // Ensure tooltip stays in viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust for viewport top and left
    const absoluteLeft = triggerRect.left + left;
    const absoluteTop = triggerRect.top + top;
    
    // Keep tooltip within viewport bounds
    if (absoluteLeft < 10) {
      left += (10 - absoluteLeft);
    } else if (absoluteLeft + tooltipRect.width > viewportWidth - 10) {
      left -= (absoluteLeft + tooltipRect.width - viewportWidth + 10);
    }
    
    if (absoluteTop < 10) {
      top += (10 - absoluteTop);
    } else if (absoluteTop + tooltipRect.height > viewportHeight - 10) {
      top -= (absoluteTop + tooltipRect.height - viewportHeight + 10);
    }

    setPosition({ top, left });
  }, [isVisible, side, align]);

  // Handle mouse events
  const handleMouseEnter = React.useCallback(() => {
    setIsVisible(true);
  }, []);
  
  const handleMouseLeave = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  // Calculate position when tooltip becomes visible
  React.useEffect(() => {
    if (isVisible) {
      // Use setTimeout to ensure the tooltip has rendered before calculating position
      const timer = setTimeout(calculatePosition, 0);
      return () => clearTimeout(timer);
    }
  }, [isVisible, calculatePosition]);

  // Add event listeners for scroll and resize
  React.useEffect(() => {
    if (!isVisible) return;
    
    const handleScroll = () => {
      calculatePosition();
    };
    
    const handleResize = () => {
      calculatePosition();
    };
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, calculatePosition]);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={triggerRef}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-50 px-2 py-1 text-xs rounded shadow-md bg-slate-900 text-white dark:bg-white dark:text-slate-900",
            "whitespace-nowrap max-w-xs transition-opacity duration-200"
          )}
          style={{
            top: triggerRef.current ? `${triggerRef.current.getBoundingClientRect().top + position.top}px` : '0px',
            left: triggerRef.current ? `${triggerRef.current.getBoundingClientRect().left + position.left}px` : '0px',
            opacity: position.top === 0 && position.left === 0 ? 0 : 1
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}; 