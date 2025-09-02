"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Cache keys constants
const CACHE_KEYS = {
  HADITH_TEXT: 'hadith-analyzer-text',
  CHAINS: 'hadith-analyzer-chains',
  SHOW_VISUALIZATION: 'hadith-analyzer-show-viz',
  API_KEY: 'hadith-analyzer-api-key',
  ACTIVE_TAB: 'hadith-analyzer-active-tab',
  SELECTED_CHAIN: 'hadith-analyzer-selected-chain'
};
import { useTheme } from "@/contexts/ThemeContext";
import mermaid from 'mermaid';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';

interface Narrator {
  number: number;
  arabicName: string;
  englishName: string;
}

interface LibraryChain {
  name: string;
  displayName: string;
  path: string;
  chainCount: number;
  hadithText: string;
  exportedAt: string | null;
}

interface Chain {
  id: string;
  narrators: Narrator[];
  hadithText: string;
  title?: string;
  collapsed?: boolean;
}

// Settings Dropdown Component Props
interface SettingsDropdownProps {
  onClearCache: () => void;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  onOpenApiKeyModal: () => void;
}

// Note: onApiKeyChange is prefixed with underscore in destructuring to indicate it's intentionally unused

function SettingsDropdown({
  onClearCache,
  apiKey,
  onApiKeyChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  onOpenApiKeyModal
}: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors relative"
        aria-label="Settings menu"
        title="Settings"
      >
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            {/* Theme Toggle */}
            <div className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Theme
                  </span>
                </div>
                <button
                  onClick={() => {
                    toggleDarkMode();
                    setIsOpen(false); // Close dropdown after toggle
                  }}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Toggle theme</span>
                  <span
                    className={`${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform`}
                  />
                </button>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-8">
                {isDarkMode ? 'Dark mode' : 'Light mode'}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* API Key Section */}
            <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center justify-center gap-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                  apiKey
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  {apiKey ? (
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    LLM API Key
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {apiKey ? 'API key configured' : 'Required for narrator extraction'}
                  </div>
                </div>
                <div className="w-6 h-6"></div> {/* Spacer for perfect centering */}
              </div>

              <div className="mt-3 text-center">
                <button
                  onClick={() => {
                    onOpenApiKeyModal();
                    setIsOpen(false); // Close dropdown when opening modal
                  }}
                  className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {apiKey ? 'Update API Key' : 'Add API Key'}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* Clear Cache */}
            <div className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all cached data? This will reset everything to start fresh.')) {
                    onClearCache();
                  }
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left"
              >
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Clear Cache</span>
              </button>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-8">
                Reset all saved data
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Draggable Chain Component
interface DraggableChainProps {
  chain: Chain;
  chainIndex: number;
  onToggleCollapse: (chainId: string) => void;
  onEdit: (chainId: string) => void;
  onRemove: (chainId: string) => void;
  editingChainId: string | null;
  editFormData: { title: string; narrators: Narrator[] };
  setEditFormData: React.Dispatch<React.SetStateAction<{ title: string; narrators: Narrator[] }>>;
  sensors: ReturnType<typeof useSensors>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleUpdateNarrator: (index: number, field: 'arabicName' | 'englishName', value: string) => void;
  handleRemoveNarrator: (narratorIndex: number) => void;
  activeNarrator: Narrator | null;
  showAddNarrator: boolean;
  setShowAddNarrator: React.Dispatch<React.SetStateAction<boolean>>;
  newNarrator: { arabicName: string; englishName: string };
  setNewNarrator: React.Dispatch<React.SetStateAction<{ arabicName: string; englishName: string }>>;
  handleAddNarrator: () => void;
  handleCancelAddNarrator: () => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
}

function DraggableChain({
  chain,
  chainIndex,
  onToggleCollapse,
  onEdit,
  onRemove,
  editingChainId,
  editFormData,
  setEditFormData,
  sensors,
  handleDragStart,
  handleDragEnd,
  handleUpdateNarrator,
  handleRemoveNarrator,
  activeNarrator,
  showAddNarrator,
  setShowAddNarrator,
  newNarrator,
  setNewNarrator,
  handleAddNarrator,
  handleCancelAddNarrator,
  handleSaveEdit,
  handleCancelEdit
}: DraggableChainProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({
    id: chain.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: 'none', // Disable all transitions for instant feedback
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const isEditing = editingChainId === chain.id;
  const isCollapsed = chain.collapsed || false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        isDragging
          ? 'bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-2 ring-blue-400 dark:ring-blue-500'
          : 'bg-white dark:bg-gray-800 rounded-lg shadow-md'
      }
    >
      {/* Chain Header - Always Visible */}
      <div
        className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => onToggleCollapse(chain.id)}
        aria-label={isCollapsed ? "Expand chain" : "Collapse chain"}
      >
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className={`p-2 rounded-md border group ${
              isDragging
                ? 'bg-blue-200 dark:bg-blue-800 border-blue-400 dark:border-blue-500 shadow-md'
                : 'hover:bg-blue-100 dark:hover:bg-blue-900/50 border-transparent hover:border-blue-300 dark:hover:border-blue-600'
            }`}
            aria-label="Drag to reorder chain"
            title="Drag to reorder chain"
          >
            <svg className={`w-4 h-4 ${
              isDragging
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              <circle cx="9" cy="12" r="1.5" fill="currentColor" />
              <circle cx="15" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </button>

          <div className="p-1">
            <svg
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transform transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {chain.title || `Chain ${chainIndex + 1}`}
            {chain.title?.includes('(Demo)') && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Demo
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!isEditing && (
            <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(chain.id);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(chain.id);
            }}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Remove
          </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit();
                }}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
              >
                Save
              </button>
          <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
                className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm font-medium transition-colors"
              >
                Cancel
          </button>
            </>
          )}
        </div>
      </div>

      {/* Chain Content - Collapsible */}
      {!isCollapsed && (
        <div className="p-6">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              {/* Chain Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chain Title
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter chain title..."
                />
          </div>

          {/* Hadith Text Preview */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate" dir="rtl">
                  {chain.hadithText}
                </p>
              </div>

              {/* Narrators Edit Table */}
              <div className="overflow-x-auto">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <table className="min-w-full border border-gray-300 dark:border-gray-600" style={{ transition: 'none' }}>
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Number</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Arabic Name</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">English Name</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <SortableContext
                      items={editFormData.narrators.map(n => n.number.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody style={{ transition: 'none' }}>
                        {editFormData.narrators.map((narrator, narratorIndex) => (
                          <DraggableNarratorRow
                            key={`narrator-${narrator.number}`}
                            narrator={narrator}
                            index={narratorIndex}
                            isEditing={true}
                            onUpdateNarrator={handleUpdateNarrator}
                            onRemoveNarrator={handleRemoveNarrator}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                  <DragOverlay>
                    {activeNarrator ? (
                      <table className="min-w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl rounded-lg" style={{ transition: 'none' }}>
                        <tbody style={{ transition: 'none' }}>
                          <tr style={{ transition: 'none' }} className="bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400 dark:ring-blue-500">
                            <td style={{ transition: 'none' }} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white">
                              <div className="flex items-center justify-center gap-2">
                                <div className="p-2 rounded-md border border-blue-300 dark:border-blue-600">
                                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                                    <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                                  </svg>
                                </div>
                                {activeNarrator.number}
                              </div>
                            </td>
                            <td style={{ transition: 'none' }} className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                              <span className="text-gray-900 dark:text-white text-right block" dir="rtl">{activeNarrator.arabicName}</span>
                            </td>
                            <td style={{ transition: 'none' }} className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                              <span className="text-gray-900 dark:text-white">{activeNarrator.englishName}</span>
                            </td>
                            <td style={{ transition: 'none' }} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                              <div className="p-2 rounded-md border border-blue-300 dark:border-blue-600">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                  <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                                  <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                                </svg>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : null}
                  </DragOverlay>
                </DndContext>
                {editFormData.narrators.length > 1 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    💡 Drag the handle (≡) to reorder narrators • Use Tab to navigate, Space/Enter to grab/release
                  </div>
                )}

                {/* Add Narrator Section */}
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  {!showAddNarrator ? (
                    <button
                      onClick={() => setShowAddNarrator(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Narrator
                    </button>
                  ) : (
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white">Add New Narrator</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Arabic Name
                          </label>
                          <input
                            type="text"
                            value={newNarrator.arabicName}
                            onChange={(e) => setNewNarrator(prev => ({ ...prev, arabicName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter Arabic name..."
                            dir="rtl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            English Name
                          </label>
                          <input
                            type="text"
                            value={newNarrator.englishName}
                            onChange={(e) => setNewNarrator(prev => ({ ...prev, englishName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter English name..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleAddNarrator}
                          disabled={!newNarrator.arabicName.trim() || !newNarrator.englishName.trim()}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                        >
                          Add Narrator
                        </button>
                        <button
                          onClick={handleCancelAddNarrator}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-4">
              {/* Hadith Text Preview */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate" dir="rtl">
            {chain.hadithText}
          </p>
        </div>

        {/* Narrators Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Number</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Narrator Name</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">English Name</th>
              </tr>
            </thead>
            <tbody>
                {chain.narrators.map((narrator, narratorIndex) => (
              <DraggableNarratorRow
                key={narrator.number}
                narrator={narrator}
                index={narratorIndex}
                isEditing={false}
                onUpdateNarrator={() => {}} // Not used in view mode
                onRemoveNarrator={undefined} // Not shown in view mode
              />
            ))}
            </tbody>
          </table>
        </div>
      </div>
          )}
        </div>
      )}
    </div>
  );
}

// Draggable Narrator Row Component
interface DraggableNarratorRowProps {
  narrator: Narrator;
  index: number;
  isEditing: boolean;
  onUpdateNarrator: (index: number, field: 'arabicName' | 'englishName', value: string) => void;
  onRemoveNarrator?: (index: number) => void;
}

function DraggableNarratorRow({
  narrator,
  index,
  isEditing,
  onUpdateNarrator,
  onRemoveNarrator
}: DraggableNarratorRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({
    id: narrator.number.toString(),
    disabled: !isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: 'none', // Disable all transitions for instant feedback
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={
        isDragging
          ? 'bg-blue-100 dark:bg-blue-900/30 shadow-lg ring-2 ring-blue-400 dark:ring-blue-500'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }
    >
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white">
        <div className="flex items-center justify-center gap-2">
          {isEditing && (
            <button
              {...attributes}
              {...listeners}
              className={`cursor-grab active:cursor-grabbing p-2 rounded-md border group ${
                isDragging
                  ? 'bg-blue-200 dark:bg-blue-800 border-blue-400 dark:border-blue-500 shadow-md'
                  : 'hover:bg-blue-100 dark:hover:bg-blue-900/50 border-transparent hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              aria-label="Drag to reorder narrator"
              title="Drag to reorder narrator in chain"
            >
              <svg className={`w-4 h-4 ${
                isDragging
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                <circle cx="15" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </button>
          )}
          {narrator.number}
        </div>
      </td>
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
        {isEditing ? (
          <input
            type="text"
            value={narrator.arabicName}
            onChange={(e) => onUpdateNarrator(index, 'arabicName', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
            dir="rtl"
          />
        ) : (
          <span className="text-gray-900 dark:text-white text-right block" dir="rtl">{narrator.arabicName}</span>
        )}
      </td>
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
        {isEditing ? (
          <input
            type="text"
            value={narrator.englishName}
            onChange={(e) => onUpdateNarrator(index, 'englishName', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        ) : (
          <span className="text-gray-900 dark:text-white">{narrator.englishName}</span>
        )}
      </td>
      {isEditing && onRemoveNarrator && (
        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
          <button
            onClick={() => onRemoveNarrator(index)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Remove narrator"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      )}
    </tr>
  );
}

export default function HadithAnalyzer() {
  const [hadithText, setHadithText] = useState("");
  const [chains, setChains] = useState<Chain[]>([]);
  const [mermaidCode, setMermaidCode] = useState("");
  const [showVisualization, setShowVisualization] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingChainId, setEditingChainId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    narrators: Narrator[];
  }>({ title: '', narrators: [] });
  const [activeNarrator, setActiveNarrator] = useState<Narrator | null>(null);
  const [showAddNarrator, setShowAddNarrator] = useState(false);
  const [newNarrator, setNewNarrator] = useState({
    arabicName: '',
    englishName: ''
  });
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'llm' | 'manual'>('llm');
  const [selectedChainIndex, setSelectedChainIndex] = useState<number>(0);
  const [activeChainId, setActiveChainId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'library' | 'computer' | null>(null);
  const [libraryChains, setLibraryChains] = useState<LibraryChain[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  const { isDarkMode } = useTheme();
  const graphRef = useRef<HTMLDivElement>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeId = event.active.id as string;
    const activeNumber = parseInt(activeId);
    const narrator = editFormData.narrators.find(n => n.number === activeNumber);
    setActiveNarrator(narrator || null);
  }, [editFormData.narrators]);

  // Handle drag end for narrator reordering
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    // Clear active narrator
    setActiveNarrator(null);

    if (!over || active.id === over.id) {
      return;
    }

    if (!editingChainId) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Parse the narrator numbers from the IDs
    const activeNumber = parseInt(activeId);
    const overNumber = parseInt(overId);

    setEditFormData(prevFormData => {
      const oldIndex = prevFormData.narrators.findIndex(n => n.number === activeNumber);
      const newIndex = prevFormData.narrators.findIndex(n => n.number === overNumber);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reorderedNarrators = arrayMove(prevFormData.narrators, oldIndex, newIndex);

        // Update narrator numbers to reflect new order
        const updatedNarrators = reorderedNarrators.map((narrator, index) => ({
          ...narrator,
          number: index + 1
        }));

        return {
          ...prevFormData,
          narrators: updatedNarrators
        };
      } else {
        return prevFormData;
      }
    });
  }, [editingChainId]);

  // Handle chain drag start
  const handleChainDragStart = useCallback((event: DragStartEvent) => {
    setActiveChainId(event.active.id as string);
  }, []);

  // Handle new hadith action
  const handleNewHadith = useCallback(() => {
    const hasChains = chains.length > 0;
    const hasHadithText = hadithText.trim().length > 0;

    if (hasChains || hasHadithText) {
      const confirmed = window.confirm(
        'Are you sure you want to start a new hadith? This will delete all current chains and clear all data. This action cannot be undone.'
      );

      if (!confirmed) {
        return;
      }
    }

    // Clear all data except API key
    localStorage.removeItem(CACHE_KEYS.HADITH_TEXT);
    localStorage.removeItem(CACHE_KEYS.CHAINS);
    localStorage.removeItem(CACHE_KEYS.SHOW_VISUALIZATION);
    localStorage.removeItem(CACHE_KEYS.ACTIVE_TAB);
    localStorage.removeItem(CACHE_KEYS.SELECTED_CHAIN);

    // Reset all state except API key
    setHadithText('');
    setChains([]);
    setShowVisualization(false);
    setEditingChainId(null);
    setEditFormData({ title: '', narrators: [] });
    setShowAddNarrator(false);
    setNewNarrator({ arabicName: '', englishName: '' });
    setShowApiKeyModal(false);
    setActiveTab('llm');
    setSelectedChainIndex(0);
    setActiveChainId(null);
    setError(null);
    setIsLoading(false);
  }, [chains.length, hadithText]);

  // Handle chain drag end
  const handleChainDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setActiveChainId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeIndex = chains.findIndex(chain => chain.id === active.id);
    const overIndex = chains.findIndex(chain => chain.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      const reorderedChains = arrayMove(chains, activeIndex, overIndex);
      setChains(reorderedChains);

      // Update selectedChainIndex if it was affected by the reordering
      if (selectedChainIndex === activeIndex) {
        setSelectedChainIndex(overIndex);
      } else if (selectedChainIndex > activeIndex && selectedChainIndex <= overIndex) {
        setSelectedChainIndex(selectedChainIndex - 1);
      } else if (selectedChainIndex < activeIndex && selectedChainIndex >= overIndex) {
        setSelectedChainIndex(selectedChainIndex + 1);
      }
    }
  }, [chains, selectedChainIndex]);

  // Load cached data on component mount
  useEffect(() => {
    try {
      // Load cached hadith text
      const cachedHadithText = localStorage.getItem(CACHE_KEYS.HADITH_TEXT);
      if (cachedHadithText) {
        setHadithText(cachedHadithText);
      }

      // Load cached chains
      const cachedChains = localStorage.getItem(CACHE_KEYS.CHAINS);
      if (cachedChains) {
        const parsedChains = JSON.parse(cachedChains);
        // Ensure backward compatibility by adding missing properties
        const updatedChains = parsedChains.map((chain: Chain, index: number) => ({
          ...chain,
          title: chain.title || `Chain ${index + 1}`,
          collapsed: chain.collapsed || false
        }));
        setChains(updatedChains);
      }

      // Load cached visualization state
      const cachedShowViz = localStorage.getItem(CACHE_KEYS.SHOW_VISUALIZATION);
      if (cachedShowViz) {
        setShowVisualization(JSON.parse(cachedShowViz));
      }

      // Load cached API key
      const cachedApiKey = localStorage.getItem(CACHE_KEYS.API_KEY);
      if (cachedApiKey) {
        setApiKey(cachedApiKey);
      }

      // Load cached active tab
      const cachedActiveTab = localStorage.getItem(CACHE_KEYS.ACTIVE_TAB);
      if (cachedActiveTab && (cachedActiveTab === 'llm' || cachedActiveTab === 'manual')) {
        setActiveTab(cachedActiveTab);
      }

      // Load cached selected chain index
      const cachedSelectedChain = localStorage.getItem(CACHE_KEYS.SELECTED_CHAIN);
      if (cachedSelectedChain) {
        const parsedIndex = parseInt(cachedSelectedChain);
        if (!isNaN(parsedIndex)) {
          setSelectedChainIndex(parsedIndex);
        }
      }
    } catch (error) {
      console.warn('Failed to load cached data:', error);
    }
  }, []);

  // Save hadith text to cache when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEYS.HADITH_TEXT, hadithText);
    } catch (error) {
      console.warn('Failed to cache hadith text:', error);
    }
  }, [hadithText]);

  // Save chains to cache when they change
  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEYS.CHAINS, JSON.stringify(chains));
    } catch (error) {
      console.warn('Failed to cache chains:', error);
    }
  }, [chains]);

  // Save visualization state to cache when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEYS.SHOW_VISUALIZATION, JSON.stringify(showVisualization));
    } catch (error) {
      console.warn('Failed to cache visualization state:', error);
    }
  }, [showVisualization]);

  // Save API key to cache when it changes
  useEffect(() => {
    try {
      if (apiKey) {
        localStorage.setItem(CACHE_KEYS.API_KEY, apiKey);
      } else {
        localStorage.removeItem(CACHE_KEYS.API_KEY);
      }
    } catch (error) {
      console.warn('Failed to cache API key:', error);
    }
  }, [apiKey]);

  // Save active tab to cache when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEYS.ACTIVE_TAB, activeTab);
    } catch (error) {
      console.warn('Failed to cache active tab:', error);
    }
  }, [activeTab]);

  // Save selected chain index to cache when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEYS.SELECTED_CHAIN, selectedChainIndex.toString());
    } catch (error) {
      console.warn('Failed to cache selected chain:', error);
    }
  }, [selectedChainIndex]);

  const fetchLibraryChains = async () => {
    setIsLoadingLibrary(true);
    try {
      const response = await fetch('/api/chains');
      const data = await response.json();

      if (data.success) {
        setLibraryChains(data.chains);
      } else {
        console.error('Failed to fetch library chains:', data.error);
        alert('Failed to load library chains. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching library chains:', error);
      alert('Failed to load library chains. Please try again.');
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const loadChainFromLibrary = async (chainPath: string) => {
    try {
      const response = await fetch('/api/chains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chainPath }),
      });

      const data = await response.json();

      if (data.success) {
        const confirmed = window.confirm(
          `Import ${data.data.chains.length} chains from library? This will replace all current data.`
        );

        if (confirmed) {
          setHadithText(data.data.hadithText || '');
          setChains(data.data.chains);
          setActiveTab(data.data.activeTab || 'llm');
          setSelectedChainIndex(data.data.selectedChainIndex || 0);
          setShowVisualization(data.data.showVisualization || false);
          setShowImportModal(false);
        }
      } else {
        alert(`Failed to load chain: ${data.error}`);
      }
    } catch (error) {
      console.error('Error loading chain from library:', error);
      alert('Failed to load chain from library. Please try again.');
    }
  };

  const extractNarrators = async (text: string): Promise<Narrator[]> => {
    if (!apiKey) {
      throw new Error('Please add your Google Gemini API key in settings to use this feature.');
    }

    try {
      const response = await fetch('/api/extract-narrators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hadithText: text,
          apiKey: apiKey
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract narrators');
      }

      const data = await response.json();
      return data.narrators;
    } catch (error) {
      console.error('Error extracting narrators:', error);
      throw error;
    }
  };











  // Function to remove Tashkeel (Arabic diacritical marks) from text
  const removeTashkeel = useCallback((text: string): string => {
    // Unicode range for Tashkeel marks: U+064B to U+065F
    // Also includes U+0670 (Arabic letter superscript alef)
    const tashkeelRegex = /[\u064B-\u065F\u0670]/g;
    return text.replace(tashkeelRegex, '');
  }, []);

  // Function to normalize narrator names by removing Tashkeel
  const normalizeNarratorName = useCallback((name: string): string => {
    return removeTashkeel(name).trim();
  }, [removeTashkeel]);

  // Array of 30 distinct colors for chain connections (theme-aware)
  const chainColors = useMemo(() => {
    if (isDarkMode) {
      // Dark mode colors - vibrant colors that work well on dark backgrounds
      return [
        "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
        "#911eb4", "#42d4f4", "#f032e6", "#bfef45", "#fabed4",
        "#469990", "#dcbeff", "#9a6324", "#ffd8b1", "#ff6b6b",
        "#aaffc3", "#ffd93d", "#6bcf7f", "#4d96ff", "#a9a9a9",
        "#ff1493", "#00ced1", "#daa520", "#adff2f", "#ff6347",
        "#1e90ff", "#dda0dd", "#98fb98", "#ff8c42", "#87ceeb"
      ];
    } else {
      // Light mode colors - darker colors that contrast well on light backgrounds
      return [
        "#8b0000", "#006400", "#daa520", "#000080", "#8b4513",
        "#4b0082", "#008080", "#8b008b", "#556b2f", "#8b4513",
        "#2f4f4f", "#483d8b", "#a0522d", "#696969", "#800000",
        "#008000", "#808000", "#483d8b", "#000080", "#2f4f4f",
        "#8b0000", "#006400", "#daa520", "#556b2f", "#8b4513",
        "#4b0082", "#008080", "#8b008b", "#483d8b", "#a0522d"
      ];
    }
  }, [isDarkMode]);

  const generateMermaidCode = useCallback((chains: Chain[]): string => {
    if (chains.length === 0) return "";

    // Define colors based on theme
    const bgColor = isDarkMode ? "#374151" : "#f3f4f6";
    const strokeColor = isDarkMode ? "#9ca3af" : "#9ca3af";
    const textColor = isDarkMode ? "#ffffff" : "#111827";

    let mermaidCode = `flowchart TD
    classDef narratorClass fill:${bgColor},stroke:${strokeColor},stroke-width:2px,color:${textColor}
    classDef connectorClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px

`;

    // Create a map to track unique narrators and their connectivity
    const narratorConnectivity = new Map<string, { narrator: Narrator; connections: number; positions: number[]; primaryLevel: number }>();

    // Analyze all chains to build connectivity graph
    chains.forEach((chain) => {
      chain.narrators.forEach((narrator, index) => {
        const key = normalizeNarratorName(narrator.arabicName);
        const connections = chain.narrators.length - 1 - index; // Number of narrators that follow this one
        const position = narrator.number; // Use narrator.number (1-based position)

        if (narratorConnectivity.has(key)) {
          const existing = narratorConnectivity.get(key)!;
          existing.connections = Math.max(existing.connections, connections);
          existing.positions.push(position);
          existing.primaryLevel = Math.min(existing.primaryLevel, position); // Use earliest position as primary level
        } else {
          narratorConnectivity.set(key, {
            narrator,
            connections,
            positions: [position],
            primaryLevel: position
          });
        }
      });
    });

    // Sort narrators by primary level first (to align by earliest position), then by connectivity within each level
    const sortedNarrators = Array.from(narratorConnectivity.entries())
      .sort((a, b) => {
        const dataA = a[1];
        const dataB = b[1];

        // First sort by primary level (ascending - earliest positions first)
        if (dataA.primaryLevel !== dataB.primaryLevel) {
          return dataA.primaryLevel - dataB.primaryLevel;
        }

        // Within the same primary level, sort by connections (descending)
        if (dataB.connections !== dataA.connections) {
          return dataB.connections - dataA.connections;
        }

        // Then by narrator number (ascending - for consistent ordering)
        return dataA.narrator.number - dataB.narrator.number;
      });

    // Create node ID mapping based on sorted order
    const narratorMap = new Map<string, { nodeId: string; narrator: Narrator }>();
    sortedNarrators.forEach(([key, { narrator }], index) => {
      const nodeId = `N${index + 1}`;
      narratorMap.set(key, { nodeId, narrator });
    });

    // Add nodes in sorted order
    sortedNarrators.forEach(([key, { narrator }]) => {
      const { nodeId } = narratorMap.get(key)!;
      const arabicName = narrator.arabicName.replace(/"/g, '\\"');
      const englishName = narrator.englishName.replace(/"/g, '\\"');
      const label = `${arabicName}<br/>(${englishName})`;
      mermaidCode += `    ${nodeId}["${label}"]\n`;
    });

    // Add edges for each chain with different colors
    mermaidCode += "\n";

    chains.forEach((chain) => {
      for (let i = 0; i < chain.narrators.length - 1; i++) {
        const fromKey = normalizeNarratorName(chain.narrators[i].arabicName);
        const toKey = normalizeNarratorName(chain.narrators[i + 1].arabicName);
        const fromNode = narratorMap.get(fromKey)!.nodeId;
        const toNode = narratorMap.get(toKey)!.nodeId;
        mermaidCode += `    ${fromNode} --> ${toNode}\n`;
      }
    });

    // Add link styles for each chain
    mermaidCode += "\n";
    chains.forEach((chain, chainIndex) => {
      const chainColor = chainColors[chainIndex % chainColors.length];
      const linkCount = chain.narrators.length - 1;

      for (let i = 0; i < linkCount; i++) {
        const linkIndex = chains.slice(0, chainIndex).reduce((sum, c) => sum + Math.max(0, c.narrators.length - 1), 0) + i;
        mermaidCode += `    linkStyle ${linkIndex} stroke:${chainColor},stroke-width:3px\n`;
      }
    });

    // Add styling
    sortedNarrators.forEach(([key]) => {
      const { nodeId } = narratorMap.get(key)!;
      mermaidCode += `    class ${nodeId} narratorClass\n`;
    });

    return mermaidCode;
  }, [isDarkMode, chainColors, normalizeNarratorName]);







  const handleRemoveChain = (chainId: string) => {
    setChains(prevChains => {
      const newChains = prevChains.filter(chain => chain.id !== chainId);
      if (newChains.length === 0) {
        setShowVisualization(false);
        setMermaidCode("");
      } else {
        const graphCode = generateMermaidCode(newChains);
        setMermaidCode(graphCode);
      }
      return newChains;
    });
  };

  const handleEditChain = (chainId: string) => {
    const chain = chains.find(c => c.id === chainId);
    if (chain) {
      setEditingChainId(chainId);
      setEditFormData({
        title: chain.title || `Chain ${chains.findIndex(c => c.id === chainId) + 1}`,
        narrators: [...chain.narrators]
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingChainId(null);
    setEditFormData({ title: '', narrators: [] });
    setShowAddNarrator(false);
    setNewNarrator({ arabicName: '', englishName: '' });
  };

  const handleSaveEdit = () => {
    if (!editingChainId) return;

    setChains(prevChains => {
      const newChains = prevChains.map(chain =>
        chain.id === editingChainId
          ? {
              ...chain,
              title: editFormData.title,
              narrators: editFormData.narrators
            }
          : chain
      );

      // Update visualization
      const graphCode = generateMermaidCode(newChains);
      setMermaidCode(graphCode);

      return newChains;
    });

    setEditingChainId(null);
    setEditFormData({ title: '', narrators: [] });
    setShowAddNarrator(false);
    setNewNarrator({ arabicName: '', englishName: '' });
  };

  const handleUpdateNarrator = (index: number, field: 'arabicName' | 'englishName', value: string) => {
    setEditFormData(prev => ({
      ...prev,
      narrators: prev.narrators.map((narrator, i) =>
        i === index ? { ...narrator, [field]: value } : narrator
      )
    }));
  };

  const handleToggleChainCollapse = (chainId: string) => {
    setChains(prevChains =>
      prevChains.map(chain =>
        chain.id === chainId
          ? { ...chain, collapsed: !chain.collapsed }
          : chain
      )
    );
  };

  const handleAddNarrator = () => {
    if (!newNarrator.arabicName.trim() || !newNarrator.englishName.trim()) {
      return; // Don't add empty narrators
    }

    setEditFormData(prev => ({
      ...prev,
      narrators: [
        ...prev.narrators,
        {
          number: prev.narrators.length + 1,
          arabicName: newNarrator.arabicName.trim(),
          englishName: newNarrator.englishName.trim()
        }
      ]
    }));

    // Reset form
    setNewNarrator({ arabicName: '', englishName: '' });
    setShowAddNarrator(false);
  };

  const handleCancelAddNarrator = () => {
    setNewNarrator({ arabicName: '', englishName: '' });
    setShowAddNarrator(false);
  };

  const handleAddNewChain = () => {
    const newChain: Chain = {
      id: `chain-${Date.now()}`,
      narrators: [],
      hadithText: `Chain ${chains.length + 1}`,
      title: `Chain ${chains.length + 1}`,
      collapsed: false
    };
    setChains(prev => [...prev, newChain]);
    setSelectedChainIndex(chains.length);
    setHadithText(`Chain ${chains.length + 1}`);
  };

  const handleSelectChain = (chainIndex: number) => {
    setSelectedChainIndex(chainIndex);
    setHadithText(chains[chainIndex].title || `Chain ${chainIndex + 1}`);
  };

  const handleRemoveChainManual = (chainIndex: number) => {
    setChains(prev => prev.filter((_, index) => index !== chainIndex));
    if (selectedChainIndex >= chains.length - 1) {
      setSelectedChainIndex(Math.max(0, chains.length - 2));
    }
  };

  const handleRemoveNarrator = (narratorIndex: number) => {
    setEditFormData(prev => ({
      ...prev,
      narrators: prev.narrators
        .filter((_, index) => index !== narratorIndex)
        .map((narrator, index) => ({
          ...narrator,
          number: index + 1
        }))
    }));
  };

  // Update mermaid code when chains change
  useEffect(() => {
    if (chains.length > 0) {
      const graphCode = generateMermaidCode(chains);
      setMermaidCode(graphCode);
      setShowVisualization(true);
    } else {
      setMermaidCode("");
      setShowVisualization(false);
    }
  }, [chains, generateMermaidCode]);

  // Initialize Mermaid and render graph when visualization is shown
  useEffect(() => {
    if (showVisualization && graphRef.current && mermaidCode) {
      // Configure Mermaid theme
      mermaid.initialize({
        startOnLoad: true,
        theme: isDarkMode ? 'dark' : 'default',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        },
        securityLevel: 'loose',
        darkMode: isDarkMode
      });

      // Clear previous graph
      graphRef.current.innerHTML = '';

      // Add custom CSS for better text contrast and pan/zoom functionality
      const customCSS = `
        <style>
          .mermaid svg {
            background: transparent !important;
            user-select: none;
          }
          .mermaid-interactive {
            transition: transform 0.1s ease-out;
            transform-origin: center;
          }
          .mermaid .node rect {
            fill: ${isDarkMode ? '#374151' : '#f3f4f6'} !important;
            stroke: ${isDarkMode ? '#9ca3af' : '#9ca3af'} !important;
            stroke-width: 2px !important;
          }
          .mermaid .node text {
            fill: ${isDarkMode ? '#ffffff' : '#111827'} !important;
            font-weight: 600 !important;
            font-size: 13px !important;
          }
          .mermaid .edgeLabel text {
            fill: ${isDarkMode ? '#d1d5db' : '#6b7280'} !important;
          }
          .mermaid .edgePath path {
            stroke: ${isDarkMode ? '#9ca3af' : '#6b7280'} !important;
            stroke-width: 2px !important;
          }
          .mermaid .edgePath marker {
            fill: ${isDarkMode ? '#9ca3af' : '#6b7280'} !important;
          }
          .mermaid-interactive {
            transition: transform 0.1s ease-out;
            transform-origin: center;
          }
          .diagram-container {
            cursor: grab;
            user-select: none;
          }
          .diagram-container.dragging {
            cursor: grabbing !important;
          }
          .zoom-controls {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            z-index: 10;
            pointer-events: none;
          }
          .zoom-controls > * {
            pointer-events: auto;
          }
          .zoom-btn {
            width: 32px;
            height: 32px;
            border-radius: 4px;
            background: ${isDarkMode ? '#374151' : '#f3f4f6'};
            border: 1px solid ${isDarkMode ? '#9ca3af' : '#9ca3af'};
            color: ${isDarkMode ? '#ffffff' : '#111827'};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-weight: bold;
            user-select: none;
          }
          .zoom-btn:hover {
            background: ${isDarkMode ? '#4b5563' : '#e5e7eb'};
          }
        </style>
      `;

      // Render new graph
      const renderGraph = async () => {
        try {
          const { svg } = await mermaid.render('mermaid-graph', mermaidCode);
          graphRef.current!.innerHTML = customCSS + svg;

          // Add pan and zoom functionality after rendering
          const svgElement = graphRef.current!.querySelector('svg');
          if (svgElement) {
            makeDiagramInteractive(graphRef.current!, svgElement);
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          graphRef.current!.innerHTML = '<div class="text-red-500 p-4">Error rendering diagram</div>';
        }
      };

      renderGraph();
    }
  }, [showVisualization, mermaidCode, isDarkMode]);

  // Cleanup function for event listeners
  useEffect(() => {
    const currentGraphRef = graphRef.current;
    return () => {
      // Cleanup any existing event listeners when component unmounts
      if (currentGraphRef) {
        const svgElement = currentGraphRef.querySelector('svg');
        if (svgElement) {
          // Remove all event listeners by cloning and replacing the element
          const newSvg = svgElement.cloneNode(true);
          svgElement.parentNode?.replaceChild(newSvg, svgElement);
        }
      }
    };
  }, []);

  // Function to make the diagram interactive (pan and zoom)
  const makeDiagramInteractive = (container: HTMLElement, svgElement: SVGElement) => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let scale = 1;
    const minScale = 0.1;
    const maxScale = 3;

    // Create zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.innerHTML = `
      <button class="zoom-btn" id="zoom-in">+</button>
      <button class="zoom-btn" id="zoom-out">−</button>
      <button class="zoom-btn" id="reset">⟲</button>
    `;

    // Insert zoom controls into the container
    container.style.position = 'relative';
    container.appendChild(zoomControls);

    // Make the entire container draggable, not just the SVG
    container.classList.add('diagram-container');
    svgElement.classList.add('mermaid-interactive');

    const updateTransform = () => {
      svgElement.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
    };

    // Mouse events for desktop - attached to container for full area dragging
    container.addEventListener('mousedown', (e) => {
      // Don't start dragging if clicking on zoom controls
      if ((e.target as HTMLElement).closest('.zoom-controls')) {
        return;
      }

      isDragging = true;
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      container.classList.add('dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        updateTransform();
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      container.classList.remove('dragging');
    });

    // Touch events for mobile (drag only, no pinch zoom) - attached to container
    container.addEventListener('touchstart', (e) => {
      // Don't start dragging if touching zoom controls
      if ((e.target as HTMLElement).closest('.zoom-controls')) {
        return;
      }

      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - currentX;
        startY = e.touches[0].clientY - currentY;
        e.preventDefault();
      }
      // Ignore multi-touch (pinch gestures for zoom)
    });

    document.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        currentX = e.touches[0].clientX - startX;
        currentY = e.touches[0].clientY - startY;
        updateTransform();
        e.preventDefault();
      }
      // Ignore multi-touch moves (pinch zoom)
    });

    document.addEventListener('touchend', () => {
      isDragging = false;
      container.classList.remove('dragging');
    });

    // Mouse wheel zoom - DISABLED (only use zoom buttons)
    // Users should use the zoom buttons for precise, controlled zooming

    // Zoom control buttons
    const zoomInBtn = zoomControls.querySelector('#zoom-in');
    const zoomOutBtn = zoomControls.querySelector('#zoom-out');
    const resetBtn = zoomControls.querySelector('#reset');

    zoomInBtn?.addEventListener('click', () => {
      scale = Math.min(scale + 0.25, maxScale);
      updateTransform();
    });

    zoomOutBtn?.addEventListener('click', () => {
      scale = Math.max(scale - 0.25, minScale);
      updateTransform();
    });

    resetBtn?.addEventListener('click', () => {
      scale = 1;
      currentX = 0;
      currentY = 0;
      updateTransform();
    });

    // Prevent context menu on right click
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  };

  // API Key Modal Component
  const ApiKeyModal = () => {
    const [tempApiKey, setTempApiKey] = useState(apiKey);

    const handleSave = () => {
      if (tempApiKey.trim()) {
        setApiKey(tempApiKey.trim());
        setShowApiKeyModal(false);
      }
    };

    const handleCancel = () => {
      setTempApiKey('');
      setShowApiKeyModal(false);
    };

    // Handle ESC key to close modal
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleCancel();
        }
      };

      if (showApiKeyModal) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showApiKeyModal]);

    if (!showApiKeyModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {apiKey ? 'Update API Key' : 'Add API Key'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                apiKey
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <svg className={`w-8 h-8 ${
                  apiKey
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Google Gemini API Key
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {apiKey
                  ? 'Update your API key for continued access to narrator extraction.'
                  : 'Add your Google Gemini API key to enable narrator extraction from hadith chains.'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Enter your Google Gemini API key..."
                className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">How to get your API key:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Google AI Studio</a></li>
                    <li>Sign in with your Google account</li>
                    <li>Click &quot;Create API Key&quot;</li>
                    <li>Copy and paste the key above</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded">
              🔒 Your API key is stored locally and never sent to our servers
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!tempApiKey.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {apiKey ? 'Update Key' : 'Save Key'}
            </button>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* API Key Modal */}
        <ApiKeyModal />

        {/* Header with theme toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ICMA - Hadith Chain Analyzer
          </h1>
          <SettingsDropdown
            onClearCache={() => {
              localStorage.removeItem(CACHE_KEYS.HADITH_TEXT);
              localStorage.removeItem(CACHE_KEYS.CHAINS);
              localStorage.removeItem(CACHE_KEYS.SHOW_VISUALIZATION);
              localStorage.removeItem(CACHE_KEYS.API_KEY);
              localStorage.removeItem(CACHE_KEYS.ACTIVE_TAB);
              localStorage.removeItem(CACHE_KEYS.SELECTED_CHAIN);
              setHadithText('');
              setChains([]);
              setShowVisualization(false);
              setEditingChainId(null);
              setEditFormData({ title: '', narrators: [] });
              setShowAddNarrator(false);
              setNewNarrator({ arabicName: '', englishName: '' });
              setApiKey('');
              setShowApiKeyModal(false);
              setActiveTab('llm');
              setSelectedChainIndex(0);
            }}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            onOpenApiKeyModal={() => setShowApiKeyModal(true)}
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
          <button
                onClick={() => setActiveTab('llm')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'llm'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                LLM Extraction
          </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'manual'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Manual Builder
              </button>
            </nav>
          </div>
        </div>
        
        {/* LLM Extraction Tab */}
        {activeTab === 'llm' && (
          <>
        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <label htmlFor="hadith-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Paste Hadith Chain (Arabic)
          </label>
          <textarea
            id="hadith-input"
            value={hadithText}
            onChange={(e) => setHadithText(e.target.value)}
            placeholder="Paste your hadith chain here..."
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            dir={/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(hadithText) ? 'rtl' : 'ltr'}
            style={{
              color: 'inherit',
              textAlign: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(hadithText) ? 'right' : 'left'
            }}
          />
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
            <button
              onClick={async () => {
                if (!apiKey) {
                  setShowApiKeyModal(true);
                  return;
                }

                setIsLoading(true);
                setError(null);

                try {
                  const narrators = await extractNarrators(hadithText);

                  // Create a new chain with the extracted narrators
                  const newChain: Chain = {
                    id: `chain-${Date.now()}`,
                    narrators: narrators,
                    hadithText: hadithText.trim(),
                    title: `Chain ${chains.length + 1}`,
                    collapsed: false
                  };

                  setChains(prev => [...prev, newChain]);
                  setShowVisualization(true);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to extract narrators');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className={`w-full sm:w-auto px-3 sm:px-6 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                !apiKey
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700 cursor-pointer'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed'
              }`}
              title={!apiKey ? 'Click to add API key' : undefined}
            >
              {!apiKey && (
                <svg className="w-4 h-4 hidden xs:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              {isLoading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span className="hidden sm:inline">
                {!apiKey ? 'API Key Required' : isLoading ? 'Analyzing...' : 'Extract Narrators'}
              </span>
              <span className="sm:hidden">
                {!apiKey ? 'Add API Key' : isLoading ? 'Analyzing...' : 'Extract'}
              </span>
            </button>
            <button
              onClick={async () => {
                // Clear input text as requested
                setHadithText("");

                // Chain 1: Sahih al-Bukhari 1
                const chain1Narrators: Narrator[] = [
                  { number: 1, arabicName: "رَسُولَ اللَّهِ", englishName: "Messenger of Allah" },
                  { number: 2, arabicName: "عُمَرَ بْنَ الْخَطَّابِ", englishName: "Umar ibn al-Khattab" },
                  { number: 3, arabicName: "عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ", englishName: "Alqamah ibn Waqqas al-Laythi" },
                  { number: 4, arabicName: "مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ", englishName: "Muhammad ibn Ibrahim al-Taymi" },
                  { number: 5, arabicName: "يَحْيَى بْنُ سَعِيدٍ الْأَنْصَارِيُّ", englishName: "Yahya ibn Said al-Ansari" },
                  { number: 6, arabicName: "سُفْيَانُ", englishName: "Sufyan" },
                  { number: 7, arabicName: "الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ", englishName: "Al-Humaidi Abdullah ibn al-Zubayr" },
                  { number: 8, arabicName: "الْإِمَامُ الْبُخَارِيُّ", englishName: "Imam al-Bukhari" }
                ];

                // Chain 2: Sahih al-Bukhari 2529
                const chain2Narrators: Narrator[] = [
                  { number: 1, arabicName: "رَسُولَ اللَّهِ", englishName: "Messenger of Allah" },
                  { number: 2, arabicName: "عُمَرَ بْنَ الْخَطَّابِ", englishName: "Umar ibn al-Khattab" },
                  { number: 3, arabicName: "عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ", englishName: "Alqamah ibn Waqqas al-Laythi" },
                  { number: 4, arabicName: "مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ", englishName: "Muhammad ibn Ibrahim al-Taymi" },
                  { number: 5, arabicName: "يَحْيَى بْنُ سَعِيدٍ الْأَنْصَارِيُّ", englishName: "Yahya ibn Said al-Ansari" },
                  { number: 6, arabicName: "سُفْيَانُ", englishName: "Sufyan" },
                  { number: 7, arabicName: "مُحَمَّدُ بْنُ كَثِيرٍ", englishName: "Muhammad ibn Kathir" },
                  { number: 8, arabicName: "الْإِمَامُ الْبُخَارِيُّ", englishName: "Imam al-Bukhari" }
                ];

                // Chain 3: Sahih al-Bukhari 54
                const chain3Narrators: Narrator[] = [
                  { number: 1, arabicName: "رَسُولَ اللَّهِ", englishName: "Messenger of Allah" },
                  { number: 2, arabicName: "عُمَرَ بْنَ الْخَطَّابِ", englishName: "Umar ibn al-Khattab" },
                  { number: 3, arabicName: "عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ", englishName: "Alqamah ibn Waqqas al-Laythi" },
                  { number: 4, arabicName: "مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ", englishName: "Muhammad ibn Ibrahim al-Taymi" },
                  { number: 5, arabicName: "يَحْيَى بْنُ سَعِيدٍ الْأَنْصَارِيُّ", englishName: "Yahya ibn Said al-Ansari" },
                  { number: 6, arabicName: "مَالِكٌ", englishName: "Malik" },
                  { number: 7, arabicName: "عَبْدُ اللَّهِ بْنُ مَسْلَمَةَ", englishName: "Abdullah ibn Maslamah" },
                  { number: 8, arabicName: "الْإِمَامُ الْبُخَارِيُّ", englishName: "Imam al-Bukhari" }
                ];

                setIsLoading(true);
                setError(null);

                // Simulate processing delay for better UX
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Create demo chains
                const demoChains: Chain[] = [
                  {
                    id: `chain-${Date.now()}-1`,
                    narrators: chain1Narrators,
                    hadithText: "حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ... (Sahih al-Bukhari 1)",
                    title: `Sahih al-Bukhari 1 - Intentions (Demo)`,
                    collapsed: false
                  },
                  {
                    id: `chain-${Date.now()}-2`,
                    narrators: chain2Narrators,
                    hadithText: "حَدَّثَنَا مُحَمَّدُ بْنُ كَثِيرٍ... (Sahih al-Bukhari 2529)",
                    title: `Sahih al-Bukhari 2529 - Intentions (Demo)`,
                    collapsed: false
                  },
                  {
                    id: `chain-${Date.now()}-3`,
                    narrators: chain3Narrators,
                    hadithText: "حَدَّثَنَا عَبْدُ اللَّهِ بْنُ مَسْلَمَةَ... (Sahih al-Bukhari 54)",
                    title: `Sahih al-Bukhari 54 - Intentions (Demo)`,
                    collapsed: false
                  }
                ];

                setChains(demoChains);
                setShowVisualization(true);
                setIsLoading(false);
              }}
              className="w-full sm:w-auto px-3 sm:px-6 py-2 rounded-md transition-colors flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
              title="Load all three hadith chains about intentions with demo results (no API key needed)"
            >
              <svg className="w-4 h-4 hidden xs:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Try Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="w-full sm:w-auto bg-green-600 text-white px-3 sm:px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
                                <span className="hidden sm:inline">Import Chain(s)</span>
                  <span className="sm:hidden">Import</span>
            </button>
            {chains.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={handleNewHadith}
                  className="w-full sm:w-auto bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  title="Start a new hadith (this will clear all current chains)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">New Hadith</span>
                  <span className="sm:hidden">New</span>
                </button>

                <button
                  onClick={() => {
                    const exportData = {
                      hadithText,
                      chains,
                      activeTab,
                      selectedChainIndex,
                      showVisualization,
                      exportedAt: new Date().toISOString(),
                      version: '1.0'
                    };

                    const dataStr = JSON.stringify(exportData, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);

                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `hadith-analysis-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  title="Export all chains and data as JSON"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Export Chain(s)</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            )}
          </div>


        </div>
          </>
        )}

        {/* Manual Chain Builder Tab */}
        {activeTab === 'manual' && (
          <>
            {/* Manual Chain Builder Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Manual Chain Builder
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Build your hadith chain manually by adding narrators one by one. No API key required.
                </p>
              </div>

              {/* Chain Management Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Chain Management
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleNewHadith}
                      className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                      title="Start a new hadith (this will clear all current chains)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Hadith
                    </button>
                    <button
                      onClick={handleAddNewChain}
                      className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add New Chain
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Import Chain(s)
                    </button>
                    {chains.length > 0 && (
                      <button
                        onClick={() => {
                          const exportData = {
                            hadithText,
                            chains,
                            activeTab,
                            selectedChainIndex,
                            showVisualization,
                            exportedAt: new Date().toISOString(),
                            version: '1.0'
                          };

                          const dataStr = JSON.stringify(exportData, null, 2);
                          const dataBlob = new Blob([dataStr], { type: 'application/json' });
                          const url = URL.createObjectURL(dataBlob);

                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `hadith-analysis-${new Date().toISOString().split('T')[0]}.json`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                        title="Export all chains and data as JSON"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Chain(s)
                      </button>
                    )}
                  </div>
                </div>

                {/* Chain Selection */}
                {chains.length > 1 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Chain to Edit
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {chains.map((chain, index) => (
                        <button
                          key={chain.id}
                          onClick={() => handleSelectChain(index)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            selectedChainIndex === index
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {chain.title || `Chain ${index + 1}`} ({chain.narrators.length} narrators)
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chain Title Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chain Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={hadithText}
                    onChange={(e) => {
                      setHadithText(e.target.value);
                      // Update the selected chain's title
                      if (chains.length > 0 && chains[selectedChainIndex]) {
                        const updatedChains = chains.map((chain, index) =>
                          index === selectedChainIndex
                            ? { ...chain, title: e.target.value, hadithText: e.target.value }
                            : chain
                        );
                        setChains(updatedChains);
                      }
                    }}
                    placeholder="Enter chain title..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Add Narrator Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Add Narrators to {chains.length > 0 ? (chains[selectedChainIndex]?.title || `Chain ${selectedChainIndex + 1}`) : 'New Chain'}
                </h4>

                {!showAddNarrator ? (
                  <button
                    onClick={() => setShowAddNarrator(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Narrator
                  </button>
                ) : (
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Arabic Name *
                        </label>
                        <input
                          type="text"
                          value={newNarrator.arabicName}
                          onChange={(e) => setNewNarrator(prev => ({ ...prev, arabicName: e.target.value }))}
                          placeholder="Enter Arabic name..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          English Name *
                        </label>
                        <input
                          type="text"
                          value={newNarrator.englishName}
                          onChange={(e) => setNewNarrator(prev => ({ ...prev, englishName: e.target.value }))}
                          placeholder="Enter English name..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (newNarrator.arabicName.trim() && newNarrator.englishName.trim()) {
                            // Create new chain if none exists
                            if (chains.length === 0) {
                              const newChain: Chain = {
                                id: `chain-${Date.now()}`,
                                narrators: [{
                                  number: 1,
                                  arabicName: newNarrator.arabicName.trim(),
                                  englishName: newNarrator.englishName.trim()
                                }],
                                hadithText: hadithText.trim() || 'Manual Chain',
                                title: hadithText.trim() || `Chain 1`,
                                collapsed: false
                              };
                              setChains([newChain]);
                              setSelectedChainIndex(0);
                              setShowVisualization(true);
                            } else {
                              // Add to selected chain
                              const updatedChains = chains.map((chain, index) =>
                                index === selectedChainIndex
                                  ? {
                                      ...chain,
                                      narrators: [
                                        ...chain.narrators,
                                        {
                                          number: chain.narrators.length + 1,
                                          arabicName: newNarrator.arabicName.trim(),
                                          englishName: newNarrator.englishName.trim()
                                        }
                                      ]
                                    }
                                  : chain
                              );
                              setChains(updatedChains);
                            }

                            setNewNarrator({ arabicName: '', englishName: '' });
                            setShowAddNarrator(false);
                          }
                        }}
                        disabled={!newNarrator.arabicName.trim() || !newNarrator.englishName.trim()}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Add Narrator
                      </button>
                      <button
                        onClick={() => {
                          setNewNarrator({ arabicName: '', englishName: '' });
                          setShowAddNarrator(false);
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Current Chain Display */}
            {chains.length > 0 && chains[selectedChainIndex] && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {chains[selectedChainIndex].title || `Chain ${selectedChainIndex + 1}`} ({chains[selectedChainIndex].narrators.length} narrators)
                  </h3>
                  {chains.length > 1 && (
                    <button
                      onClick={() => handleRemoveChainManual(selectedChainIndex)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                    >
                      Remove Chain
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">#</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Arabic Name</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">English Name</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chains[selectedChainIndex].narrators.map((narrator, index) => (
                        <tr key={narrator.number} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white">
                            {narrator.number}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-900 dark:text-white" dir="rtl">
                            {narrator.arabicName}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                            {narrator.englishName}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                            <button
                              onClick={() => {
                                const updatedChains = chains.map((chain, chainIndex) =>
                                  chainIndex === selectedChainIndex
                                    ? {
                                        ...chain,
                                        narrators: chain.narrators
                                          .filter((_, i) => i !== index)
                                          .map((n, i) => ({ ...n, number: i + 1 }))
                                      }
                                    : chain
                                );
                                setChains(updatedChains);
                              }}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Remove narrator"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {chains[selectedChainIndex].narrators.length > 1 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => {
                        const updatedChains = chains.map((chain, index) =>
                          index === selectedChainIndex
                            ? { ...chain, narrators: [] }
                            : chain
                        );
                        setChains(updatedChains);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Clear Narrators
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Error Section */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Analysis Error</h3>
            </div>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {chains.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Hadith Chains ({chains.length})
              </h2>
              {chains.length > 1 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Duplicate narrators are automatically merged in the visualization
                </span>
              )}
            </div>

                        <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleChainDragStart}
              onDragEnd={handleChainDragEnd}
            >
              <SortableContext
                items={chains.map(chain => chain.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {chains.map((chain, chainIndex) => (
                    <DraggableChain
                      key={chain.id}
                      chain={chain}
                      chainIndex={chainIndex}
                      onToggleCollapse={handleToggleChainCollapse}
                      onEdit={handleEditChain}
                      onRemove={handleRemoveChain}
                      editingChainId={editingChainId}
                      editFormData={editFormData}
                      setEditFormData={setEditFormData}
                      sensors={sensors}
                      handleDragStart={handleDragStart}
                      handleDragEnd={handleDragEnd}
                      handleUpdateNarrator={handleUpdateNarrator}
                      handleRemoveNarrator={handleRemoveNarrator}
                      activeNarrator={activeNarrator}
                      showAddNarrator={showAddNarrator}
                      setShowAddNarrator={setShowAddNarrator}
                      newNarrator={newNarrator}
                      setNewNarrator={setNewNarrator}
                      handleAddNarrator={handleAddNarrator}
                      handleCancelAddNarrator={handleCancelAddNarrator}
                      handleSaveEdit={handleSaveEdit}
                      handleCancelEdit={handleCancelEdit}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeChainId ? (
                  (() => {
                    const activeChain = chains.find(chain => chain.id === activeChainId);
                    return activeChain ? (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-2 ring-blue-400 dark:ring-blue-500 opacity-80">
                        <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="p-1">
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                                <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {activeChain.title || `Chain ${chains.findIndex(c => c.id === activeChainId) + 1}`}
                              {activeChain.title?.includes('(Demo)') && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Demo
                                </span>
                              )}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}

        {/* Visualization Section */}
        {showVisualization && mermaidCode && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Combined Chain Visualization ({chains.length} chain{chains.length > 1 ? 's' : ''})
              </h2>
              <button
                onClick={() => {
                  if (graphRef.current) {
                    const svgElement = graphRef.current.querySelector('svg');
                    if (svgElement) {
                      // Clone the SVG to avoid modifying the original
                      const svgClone = svgElement.cloneNode(true) as SVGElement;

                      // Create a blob with the SVG content
                      const svgData = new XMLSerializer().serializeToString(svgClone);
                      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

                      // Create download link
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(svgBlob);
                      link.download = `hadith-chains-diagram-${new Date().toISOString().split('T')[0]}.svg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      // Clean up the object URL
                      URL.revokeObjectURL(link.href);
                    }
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                title="Download current hadith chains diagram as SVG"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Download Diagram</span>
                <span className="sm:hidden">Download</span>
              </button>
            </div>

            {/* Inline Mermaid Rendering */}
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-4 overflow-auto relative">
              <div className="flex justify-center">
                <div ref={graphRef} className="w-full max-w-4xl"></div>
              </div>

              {/* Instructions for interaction */}
              <div className="absolute bottom-2 left-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm">
                💡 Drag to pan • Use zoom buttons in top-right
              </div>
            </div>


          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 ICMA - Hadith Chain Analysis. All rights reserved.
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href="/privacy-policy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {importMode === 'library' ? 'Select Library Chain' : importMode === 'computer' ? 'Upload from Computer' : 'Import Chains'}
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportMode(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
    </div>

            {!importMode ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setImportMode('library');
                    fetchLibraryChains();
                  }}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">From Library</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Load from built-in chain collections</div>
                  </div>
                </button>

                <button
                  onClick={() => setImportMode('computer')}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">From Computer</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Upload JSON file from your device</div>
                  </div>
                </button>
              </div>
            ) : importMode === 'library' ? (
              <div className="space-y-3">
                {isLoadingLibrary ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading library chains...</p>
                  </div>
                ) : libraryChains.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">No library chains found.</p>
                  </div>
                ) : (
                  libraryChains.map((chain) => (
                    <button
                      key={chain.path}
                      onClick={() => loadChainFromLibrary(chain.path)}
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {chain.displayName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {chain.chainCount} chains
                      </div>
                    </button>
                  ))
                )}
                <button
                  onClick={() => setImportMode(null)}
                  className="w-full mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  ← Back to options
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const jsonData = JSON.parse(event.target?.result as string);

                            // Validate the imported data structure
                            if (!jsonData.chains || !Array.isArray(jsonData.chains)) {
                              throw new Error('Invalid JSON format: missing or invalid chains array');
                            }

                            // Validate each chain structure
                            jsonData.chains.forEach((chain: Chain, index: number) => {
                              if (!chain.id || !chain.narrators || !Array.isArray(chain.narrators)) {
                                throw new Error(`Invalid chain ${index + 1}: missing required fields`);
                              }
                            });

                            // Confirm import with user
                            const confirmed = window.confirm(
                              `Import ${jsonData.chains.length} chains? This will replace all current data.`
                            );

                            if (!confirmed) return;

                            // Import the data
                            setHadithText(jsonData.hadithText || '');
                            setChains(jsonData.chains);
                            setActiveTab(jsonData.activeTab || 'llm');
                            setSelectedChainIndex(jsonData.selectedChainIndex || 0);
                            setShowVisualization(jsonData.showVisualization || false);
                            setShowImportModal(false);
                            setImportMode(null);

                          } catch (error) {
                            alert(`Import failed: ${error instanceof Error ? error.message : 'Invalid JSON file'}`);
                          }
                        };
                        reader.readAsText(file);

                        // Reset file input
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <div className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400 text-center">
                        Click to select JSON file or drag and drop
                      </p>
                    </div>
                  </label>
                </div>
                <button
                  onClick={() => setImportMode(null)}
                  className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  ← Back to options
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}