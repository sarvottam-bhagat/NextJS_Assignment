'use client';

import React from "react";

interface DateSeparatorProps {
  date: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-4 py-1.5 rounded-full shadow-sm">
        {date}
      </span>
    </div>
  );
};

export default DateSeparator;
