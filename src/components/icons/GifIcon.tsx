import React from "react";

interface GifIconProps {
  className?: string;
  size?: number;
}

const GifIcon: React.FC<GifIconProps> = ({ className = "", size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
      <path d="M7 7h1v10H7z" />
      <path d="M11 7h2" />
      <path d="M11 11h2" />
      <path d="M11 15h2" />
      <path d="M15 7h2v4h-2z" />
      <path d="M15 15h2" />
    </svg>
  );
};

export default GifIcon;
