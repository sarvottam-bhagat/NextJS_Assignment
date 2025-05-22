
import React from "react";
import { Search, Users, MoreVertical, X, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarHeaderProps {
  onCreateGroup: () => void;
  onStartDirectMessage: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  onCreateGroup,
  onStartDirectMessage,
  searchTerm,
  onSearchChange
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-3">
        <h1 className="text-lg font-medium">Chats</h1>
        <nav className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onStartDirectMessage}
              >
                <MessageCircle size={18} className="text-green-600" />
                <span className="sr-only">New Direct Message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Direct Message</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onCreateGroup}
              >
                <Users size={18} className="text-green-600" />
                <span className="sr-only">Create Group Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create Group Chat</TooltipContent>
          </Tooltip>

          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreVertical size={18} className="text-gray-600" />
            <span className="sr-only">More Options</span>
          </Button>
        </nav>
      </div>
      <div className="p-3 pt-0">
        <div className="relative">
          <Input
            className="pl-9 bg-gray-100 border-0 text-sm"
            placeholder="Search chats"
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search chats"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" aria-hidden="true" />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X size={14} className="text-gray-500" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Filter buttons */}
        <section className="flex items-center justify-between mt-2 pb-1 w-full px-1" aria-label="Filters">
          <Button
            variant="outline"
            size="sm"
            className="text-xs py-0 h-7 px-2 bg-green-500 text-white border-0 hover:bg-green-600 hover:text-white flex items-center"
          >
            <span className="text-white whitespace-nowrap">Custom filter</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs py-0 h-7 px-2 bg-gray-100 text-gray-700 border-0 hover:bg-gray-200"
          >
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs py-0 h-7 px-2 bg-gray-100 text-gray-700 border-0 hover:bg-gray-200 flex items-center gap-1"
          >
            <Search className="h-3 w-3" />
            <span>Search</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs py-0 h-7 px-2 bg-gray-100 text-gray-700 border-0 hover:bg-gray-200 flex items-center"
          >
            <span>Filtered</span>
          </Button>
        </section>
      </div>
    </header>
  );
};

export default SidebarHeader;
