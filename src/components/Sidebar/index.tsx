'use client';

import React, { useState, useEffect } from "react";
import ConversationsList from "./ConversationsList";
import CreateGroupChat from "../GroupChat/CreateGroupChat";
import DirectMessageModal from "../DirectMessage/DirectMessageModal";
import FilterModal, { FilterOptions } from "./FilterModal";
import { HiFolderDownload } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";
import { IoFilterSharp } from "react-icons/io5";
import LeftSidebar from "./LeftSidebar";
import { Button } from "@/components/ui/button";
import { Tag, CheckSquare, X, Users, MessageSquare, Search, Save } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { LABELS } from "@/lib/labelConstants";
import { updateConversationLabel } from "@/lib/supabaseService";

// Create a simple SidebarHeader component since it's missing
const SidebarHeader = ({
  onCreateGroup,
  onStartDirectMessage,
  searchTerm,
  onSearchChange,
  selectionMode,
  toggleSelectionMode,
  selectedCount,
  onApplyLabels,
  onCancelSelection
}: {
  onCreateGroup: () => void;
  onStartDirectMessage: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectionMode: boolean;
  toggleSelectionMode: () => void;
  selectedCount: number;
  onApplyLabels: () => void;
  onCancelSelection: () => void;
}) => {
  return (
    <header className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        {!selectionMode ? (
          <>
            <h2 className="text-xl font-semibold">Messages</h2>
            <nav className="flex space-x-2" aria-label="Conversation actions">
              <button
                onClick={toggleSelectionMode}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                aria-label="Select multiple conversations"
              >
                <CheckSquare size={16} aria-hidden="true" />
              </button>
              <button
                onClick={onCreateGroup}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                aria-label="Create group chat"
              >
                <Users size={16} aria-hidden="true" />
              </button>
              <button
                onClick={onStartDirectMessage}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                aria-label="Start direct message"
              >
                <MessageSquare size={16} aria-hidden="true" />
              </button>
            </nav>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">Select Chats</h2>
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded" aria-live="polite">
                {selectedCount} selected
              </span>
            </div>
            <nav className="flex space-x-2" aria-label="Selection actions">
              <button
                onClick={onApplyLabels}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                aria-label="Apply labels"
                disabled={selectedCount === 0}
              >
                <Tag size={16} className={selectedCount === 0 ? "text-gray-300" : "text-gray-600"} aria-hidden="true" />
              </button>
              <button
                onClick={onCancelSelection}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                aria-label="Cancel selection"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </nav>
          </>
        )}
      </div>
      <form className="relative" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="conversation-search" className="sr-only">Search conversations</label>
        <input
          id="conversation-search"
          type="search"
          placeholder="Search conversations..."
          className="w-full p-2 pl-8 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Search className="absolute left-2 top-2.5 text-gray-400" size={16} aria-hidden="true" />
      </form>
    </header>
  );
};



// Current user ID (would normally come from authentication)
const CURRENT_USER_ID = "9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c"; // Periskope user

interface SidebarProps {
  activeConversation?: string;
  onSelectConversation: (id: string) => void;
  onLabelChange?: (conversationId: string, label: any) => void;
  conversations?: Record<string, any>;
  onDirectMessageCreated?: (conversationId: string) => void;
}

const CustomFilterBar = ({
  onOpenFilter,
  onSaveFilter,
  onSearch,
  hasSavedFilter,
  onApplySavedFilter
}: {
  onOpenFilter: () => void;
  onSaveFilter: () => void;
  onSearch: () => void;
  hasSavedFilter: boolean;
  onApplySavedFilter: () => void;
}) => (
  <section className="flex items-center justify-between py-2 px-2 border-b border-slate-200 bg-white flex-nowrap w-full" aria-label="Filter controls">
    <menu className="flex items-center gap-0.5 whitespace-nowrap p-0 m-0">
      <HiFolderDownload size={16} color="#0C8F4E" aria-hidden="true" />
      <button
        onClick={onOpenFilter}
        className="text-[#0C8F4E] font-bold text-xs bg-transparent hover:bg-green-50 px-1.5 py-0.5 rounded-md transition-colors"
        aria-label="Open custom filter"
      >
        Custom filter
      </button>
      <button
        onClick={onSaveFilter}
        className="px-1.5 py-0.5 shadow-sm rounded-sm text-[#5D6876] text-xs bg-white border border-slate-200 font-semibold h-6 flex items-center whitespace-nowrap ml-0"
        aria-label="Save current filter"
      >
        <Save size={10} className="mr-1" aria-hidden="true" />
        <span>Save</span>
      </button>
    </menu>
    <menu className="flex items-center gap-1 p-0 m-0">
      <button
        onClick={onSearch}
        className="px-1.5 py-0.5 shadow-sm rounded-sm text-[#5D6876] text-xs bg-white border border-slate-200 font-semibold h-6 flex items-center gap-1 whitespace-nowrap"
        aria-label="Focus search box"
      >
        <FaSearch size={10} aria-hidden="true" />
        <span>Search</span>
      </button>
      <button
        onClick={onApplySavedFilter}
        className={`px-1.5 py-0.5 shadow-sm rounded-sm text-xs bg-white border border-slate-200 font-semibold h-6 flex items-center gap-1 whitespace-nowrap ${
          hasSavedFilter ? 'text-[#0C8F4E]' : 'text-[#5D6876]'
        }`}
        aria-label={hasSavedFilter ? "Apply saved filter" : "No saved filters"}
      >
        <IoFilterSharp size={10} aria-hidden="true" />
        <span>Filtered</span>
      </button>
    </menu>
  </section>
);

const Sidebar: React.FC<SidebarProps> = ({
  activeConversation,
  onSelectConversation,
  onLabelChange,
  conversations = {},
  onDirectMessageCreated
}) => {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isDirectMessageOpen, setIsDirectMessageOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [isLabelSelectorOpen, setIsLabelSelectorOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Default filter options
  const defaultFilters: FilterOptions = {
    conversationType: 'all',
    labels: [],
    unreadOnly: false,
    dateRange: { from: undefined, to: undefined },
  };

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [isFiltered, setIsFiltered] = useState(false);
  const [hasSavedFilter, setHasSavedFilter] = useState(false);

  // Load saved filters from localStorage on component mount
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem('chatFilters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);

        // Convert date strings back to Date objects
        if (parsedFilters.dateRange) {
          if (parsedFilters.dateRange.from) {
            parsedFilters.dateRange.from = new Date(parsedFilters.dateRange.from);
          }
          if (parsedFilters.dateRange.to) {
            parsedFilters.dateRange.to = new Date(parsedFilters.dateRange.to);
          }
        }

        setFilters(parsedFilters);
        setHasSavedFilter(true);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  }, []);

  // Check if filters are applied
  useEffect(() => {
    const hasActiveFilters =
      filters.conversationType !== 'all' ||
      filters.labels.length > 0 ||
      filters.unreadOnly ||
      (filters.dateRange.from !== undefined) ||
      (filters.participantId !== undefined);

    setIsFiltered(hasActiveFilters);
  }, [filters]);

  const handleCreateGroup = () => {
    setIsCreateGroupOpen(true);
  };

  const handleStartDirectMessage = () => {
    setIsDirectMessageOpen(true);
  };

  const handleGroupCreated = (conversationId: string) => {
    // Select the newly created group conversation
    onSelectConversation(conversationId);
  };

  const handleDirectMessageCreated = (conversationId: string) => {
    // Use the prop callback if provided, otherwise fallback to onSelectConversation
    if (onDirectMessageCreated) {
      onDirectMessageCreated(conversationId);
    } else {
      onSelectConversation(conversationId);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    // Clear selections when toggling mode
    setSelectedConversations([]);
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedConversations(selectedIds);
  };

  const handleApplyLabels = () => {
    setIsLabelSelectorOpen(true);
  };

  const handleLabelsApplied = () => {
    // Close the label selector
    setIsLabelSelectorOpen(false);
    // Exit selection mode
    setSelectionMode(false);
    // Clear selections
    setSelectedConversations([]);
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedConversations([]);
  };

  // Filter handlers
  const handleOpenFilter = () => {
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    // The isFiltered state will be updated by the useEffect
  };

  // This function is kept for potential future use
  // Currently only used in the FilterModal's Reset button functionality
  const handleClearFilter = () => {
    setFilters(defaultFilters);
    // Clear saved filters from localStorage and update UI state
    localStorage.removeItem('chatFilters');
    setHasSavedFilter(false);
    toast.success('Filters cleared');
  };

  const handleSaveFilter = () => {
    // Save current filters to localStorage
    if (isFiltered) {
      // Save the current filters
      localStorage.setItem('chatFilters', JSON.stringify(filters));
      setHasSavedFilter(true);

      // Reset the current view to show all chats
      setFilters(defaultFilters);

      toast.success('Filter settings saved');
    } else {
      // If there are no active filters but we want to clear saved filters
      if (hasSavedFilter) {
        localStorage.removeItem('chatFilters');
        setHasSavedFilter(false);
        toast.success('Saved filters cleared');
      } else {
        toast.info('No active filters to save');
      }
    }
  };

  const handleSearch = () => {
    // Focus the search input
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  const handleApplySavedFilter = () => {
    if (hasSavedFilter) {
      try {
        const savedFilters = localStorage.getItem('chatFilters');
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);

          // Convert date strings back to Date objects
          if (parsedFilters.dateRange) {
            if (parsedFilters.dateRange.from) {
              parsedFilters.dateRange.from = new Date(parsedFilters.dateRange.from);
            }
            if (parsedFilters.dateRange.to) {
              parsedFilters.dateRange.to = new Date(parsedFilters.dateRange.to);
            }
          }

          // Apply the saved filters
          setFilters(parsedFilters);
          toast.success('Saved filter applied');
        }
      } catch (error) {
        console.error('Error applying saved filter:', error);
        toast.error('Error applying saved filter');
      }
    } else {
      // If no saved filter, show a message
      toast.info('No saved filters available');
      // Open the filter modal
      handleOpenFilter();
    }
  };

  // Function to reset to default view showing all chats
  const handleResetToDefault = () => {
    // Reset filters to default
    setFilters(defaultFilters);
    // Clear search term
    setSearchTerm('');
    // Exit selection mode if active
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedConversations([]);
    }
    // Show toast message
    toast.success('Returned to default view');
  };

  return (
    <div className="flex h-full">
      {/* Vertical icon sidebar */}
      <LeftSidebar onCreateGroup={handleCreateGroup} onResetToDefault={handleResetToDefault} />

      {/* Conversations sidebar */}
      <aside className="flex flex-col border-r border-gray-200 w-80 h-full overflow-hidden">
        <SidebarHeader
          onCreateGroup={handleCreateGroup}
          onStartDirectMessage={handleStartDirectMessage}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectionMode={selectionMode}
          toggleSelectionMode={toggleSelectionMode}
          selectedCount={selectedConversations.length}
          onApplyLabels={handleApplyLabels}
          onCancelSelection={handleCancelSelection}
        />
        <CustomFilterBar
          onOpenFilter={handleOpenFilter}
          onSaveFilter={handleSaveFilter}
          onSearch={handleSearch}
          hasSavedFilter={hasSavedFilter}
          onApplySavedFilter={handleApplySavedFilter}
        />
        <nav className="flex-1 overflow-hidden">
          <ConversationsList
            activeConversation={activeConversation}
            onSelectConversation={onSelectConversation}
            searchTerm={searchTerm}
            selectionMode={selectionMode}
            selectedConversations={selectedConversations}
            onSelectionChange={handleSelectionChange}
            filters={filters}
            onDirectMessageCreated={handleDirectMessageCreated}
            conversations={conversations}
          />
        </nav>
      </aside>

      {/* Group Chat Creation Modal */}
      <CreateGroupChat
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        currentUserId={CURRENT_USER_ID}
        onGroupCreated={handleGroupCreated}
      />

      {/* Direct Message Modal */}
      <DirectMessageModal
        isOpen={isDirectMessageOpen}
        onClose={() => setIsDirectMessageOpen(false)}
        currentUserId={CURRENT_USER_ID}
        onConversationCreated={handleDirectMessageCreated}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      {/* Bulk Label Selector */}
      {isLabelSelectorOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Apply Label to {selectedConversations.length} Conversation{selectedConversations.length !== 1 ? 's' : ''}</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.values(LABELS).map((label) => {
                const LabelIcon = label.icon;
                return (
                  <button
                    key={label.id}
                    className={`flex items-center gap-2 p-2 rounded-md border hover:bg-gray-50 ${label.bgColor}`}
                    onClick={async () => {
                      try {
                        toast.loading(`Applying label to ${selectedConversations.length} conversations...`);

                        // Update all selected conversations with this label
                        const updatePromises = selectedConversations.map(id =>
                          updateConversationLabel(id, label.id as any)
                        );

                        // Wait for all updates to complete
                        const results = await Promise.all(updatePromises);

                        // Check if all updates were successful
                        const allSuccessful = results.every(success => success === true);

                        if (allSuccessful) {
                          // Update the UI through the parent component
                          if (onLabelChange) {
                            // Update each conversation's label in the parent component
                            selectedConversations.forEach(id => {
                              onLabelChange(id, label.id);
                            });
                          }

                          toast.dismiss();
                          toast.success(`Label applied to ${selectedConversations.length} conversations`);
                          handleLabelsApplied();
                        } else {
                          toast.dismiss();
                          toast.error("Failed to apply label to some conversations");
                        }
                      } catch (error) {
                        console.error("Error applying labels:", error);
                        toast.dismiss();
                        toast.error("An error occurred while applying labels");
                      }
                    }}
                  >
                    <LabelIcon className={`h-5 w-5 ${label.color}`} />
                    <span>{label.text}</span>
                  </button>
                );
              })}

              <button
                className="flex items-center gap-2 p-2 rounded-md border hover:bg-gray-50 col-span-2"
                onClick={async () => {
                  try {
                    toast.loading(`Removing labels from ${selectedConversations.length} conversations...`);

                    // Remove labels from all selected conversations
                    const updatePromises = selectedConversations.map(id =>
                      updateConversationLabel(id, null)
                    );

                    // Wait for all updates to complete
                    const results = await Promise.all(updatePromises);

                    // Check if all updates were successful
                    const allSuccessful = results.every(success => success === true);

                    if (allSuccessful) {
                      // Update the UI through the parent component
                      if (onLabelChange) {
                        // Update each conversation's label in the parent component
                        selectedConversations.forEach(id => {
                          onLabelChange(id, null);
                        });
                      }

                      toast.dismiss();
                      toast.success(`Labels removed from ${selectedConversations.length} conversations`);
                      handleLabelsApplied();
                    } else {
                      toast.dismiss();
                      toast.error("Failed to remove labels from some conversations");
                    }
                  } catch (error) {
                    console.error("Error removing labels:", error);
                    toast.dismiss();
                    toast.error("An error occurred while removing labels");
                  }
                }}
              >
                <X className="h-5 w-5 text-gray-500" />
                <span>Remove Label</span>
              </button>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsLabelSelectorOpen(false)}
                className="mr-2 text-xs h-8 px-3"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
