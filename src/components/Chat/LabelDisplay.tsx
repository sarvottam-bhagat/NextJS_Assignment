'use client';

import React from "react";
import { LabelType, getLabelInfo } from "@/lib/labelConstants";

interface LabelDisplayProps {
  label: LabelType;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const LabelDisplay: React.FC<LabelDisplayProps> = ({ 
  label, 
  size = 'md',
  showText = false
}) => {
  if (!label) return null;
  
  const labelInfo = getLabelInfo(label);
  if (!labelInfo) return null;
  
  const LabelIcon = labelInfo.icon;
  
  // Size mappings
  const sizeClasses = {
    sm: {
      container: 'p-0.5',
      icon: 'h-3 w-3'
    },
    md: {
      container: 'p-1',
      icon: 'h-4 w-4'
    },
    lg: {
      container: 'p-1.5',
      icon: 'h-5 w-5'
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      <div className={`rounded-full ${labelInfo.bgColor} ${sizeClasses[size].container}`}>
        <LabelIcon className={`${labelInfo.color} ${sizeClasses[size].icon}`} />
      </div>
      {showText && (
        <span className="text-xs font-medium">{labelInfo.text}</span>
      )}
    </div>
  );
};

export default LabelDisplay;
