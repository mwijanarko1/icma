"use client";

import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { calculateNarratorGrade, calculateChainGrade } from '@/lib/grading/calculator';
import { getGradeColorClass, getGradeDescription } from '@/lib/grading/utils';
import { ReputationSelector } from '@/components/hadith-analyzer/narrators/ReputationSelector';
import { DraggableNarratorRow } from '@/components/hadith-analyzer/narrators/DraggableNarratorRow';
import { createNarratorService } from '@/services/narratorService';
import { createChainService } from '@/services/chainService';
import { generateMermaidCode } from '@/components/hadith-analyzer/visualization/utils';
import type { DraggableChainProps } from './types';

export function DraggableChain({
  chain,
  chainIndex = 0,
  sensors,
  handleDragStart,
  handleDragEnd,
  actions,
  editingChainId,
  isDarkMode,
  state,
  dispatch,
  globalActions
}: DraggableChainProps) {
  // Memoize services to prevent recreation on every render and stale closures
  const narratorService = useMemo(
    () => createNarratorService(state, dispatch, globalActions, generateMermaidCode, isDarkMode),
    [state, dispatch, globalActions, isDarkMode]
  );
  const chainService = useMemo(
    () => createChainService(state, dispatch, globalActions, isDarkMode),
    [state, dispatch, globalActions, isDarkMode]
  );

  // Extract needed state
  const {
    editFormData,
    activeNarrator,
    showAddNarrator,
    newNarrator,
    chains,
    selectedChainIndex
  } = state;
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
  const isHighlighted = state.highlightedChainIds.includes(chain.id);

  return (
    <div
      ref={setNodeRef}
      data-chain-id={chain.id}
      style={style}
      className={
        isDragging
          ? 'bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-2 ring-blue-400 dark:ring-blue-500'
          : isHighlighted
          ? 'bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-4 ring-blue-500 dark:ring-blue-400 border-2 border-blue-500 dark:border-blue-400'
          : 'bg-white dark:bg-gray-800 rounded-lg shadow-md'
      }
    >
      {/* Chain Header - Always Visible */}
      <div
        className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => actions.onToggleCollapse(chain.id)}
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
          <h3 className={`text-lg font-medium ${chain.hiddenFromVisualization ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
            {chain.title || `Chain ${chainIndex + 1}`}
            {chain.hiddenFromVisualization && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                Hidden from diagram
              </span>
            )}
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
              dispatch(globalActions.toggleChainVisibility(chain.id));
            }}
            className={`text-sm font-medium px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
              chain.hiddenFromVisualization
                ? 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20'
                : 'text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
            }`}
            title={chain.hiddenFromVisualization ? "Show in diagram" : "Hide from diagram"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {chain.hiddenFromVisualization ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21" />
                </>
              )}
            </svg>
            {chain.hiddenFromVisualization ? 'Show' : 'Hide'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.onEdit(chain.id);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.onMatchNarrators(chain.id);
            }}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium px-3 py-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-1"
            title="Match narrators to database and auto-assign grades"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Match
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.onRemove(chain.id);
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
                  chainService.handleSaveEdit();
                }}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
              >
                Save
              </button>
          <button
                onClick={(e) => {
                  e.stopPropagation();
                  chainService.handleCancelEdit();
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
                  onChange={(e) => dispatch(globalActions.setEditFormData({ ...editFormData, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter chain title..."
                />
          </div>

          {/* Chain Text (Sanad) Input - Above Narrator Table */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chain (Sanad)
                </label>
                <textarea
                  value={editFormData.chainText}
                  onChange={(e) => dispatch(globalActions.setEditFormData({ ...editFormData, chainText: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y min-h-[80px]"
                  placeholder="Enter chain text (sanad)..."
                  dir={/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(editFormData.chainText) ? 'rtl' : 'ltr'}
                  style={{
                    textAlign: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(editFormData.chainText) ? 'right' : 'left'
                  }}
                />
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
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Reputation</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Calculated Grade</th>
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
                            key={`edit-narrator-${narratorIndex}-${narrator.number}`}
                            narrator={narrator}
                            index={narratorIndex}
                            isEditing={true}
                            onUpdateNarrator={narratorService.handleUpdateNarrator}
                            onUpdateReputation={(index, reputation) => {
                              dispatch(globalActions.setEditFormData({
                                ...editFormData,
                                narrators: editFormData.narrators.map((n, i) =>
                                  i === index
                                    ? { ...n, reputation, calculatedGrade: calculateNarratorGrade(reputation) }
                                    : n
                                )
                              }));
                            }}
                            onRemoveNarrator={narratorService.handleRemoveNarrator}
                            onViewNarratorDetails={narratorService.handleViewNarratorDetails}
                            onUnmatchNarrator={narratorService.handleUnmatchNarratorEdit}
                            onSearchNarrator={(index) => narratorService.handleOpenNarratorSearch(index, chain.id, true)}
                            isDarkMode={isDarkMode}
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

                {/* Chain Grade Display */}
                {(() => {
                  const chainGrade = calculateChainGrade(editFormData.narrators);
                  
                  return (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Chain Grade</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Average of all narrator grades</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {chainGrade !== null ? (
                            <>
                              <div className={`text-2xl font-bold ${getGradeColorClass(chainGrade)}`}>
                                {chainGrade.toFixed(1)}
                              </div>
                              <div className={`text-xs font-medium ${getGradeColorClass(chainGrade)}`}>
                                {getGradeDescription(chainGrade)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                                --
                              </div>
                              <div className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                Insufficient data
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Matn (Hadith Text) Input - Below Chain Grade */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Matn (Hadith Text)
                  </label>
                  <textarea
                    value={editFormData.matn}
                    onChange={(e) => dispatch(globalActions.setEditFormData({ ...editFormData, matn: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y min-h-[80px]"
                    placeholder="Enter matn (hadith text)..."
                    dir={/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(editFormData.matn) ? 'rtl' : 'ltr'}
                    style={{
                      textAlign: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(editFormData.matn) ? 'right' : 'left'
                    }}
                  />
                </div>

                {/* Add Narrator Section */}
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  {!showAddNarrator ? (
                    <button
                      onClick={() => dispatch(globalActions.setShowAddNarrator(true))}
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
                            onChange={(e) => dispatch(globalActions.setNewNarrator({ ...newNarrator, arabicName: e.target.value }))}
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
                            onChange={(e) => dispatch(globalActions.setNewNarrator({ ...newNarrator, englishName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter English name..."
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reputation
                        </label>
                        <ReputationSelector
                          selectedReputations={newNarrator.reputation}
                          onReputationChange={(reputation) => dispatch(globalActions.setNewNarrator({
                            ...newNarrator,
                            reputation,
                            calculatedGrade: calculateNarratorGrade(reputation)
                          }))}
                          isDarkMode={isDarkMode}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={narratorService.handleAddNarrator}
                          disabled={!newNarrator.arabicName.trim() || !newNarrator.englishName.trim()}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                        >
                          Add Narrator
                        </button>
                        <button
                          onClick={narratorService.handleCancelAddNarrator}
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
              {/* Chain Text (Sanad) - Above Narrator Table */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chain (Sanad)
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                  <p 
                    className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words" 
                    dir={/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(chain.chainText) ? 'rtl' : 'ltr'}
                    style={{
                      textAlign: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(chain.chainText) ? 'right' : 'left'
                    }}
                  >
                    {chain.chainText || <span className="text-gray-400 dark:text-gray-500 italic">No chain text</span>}
                  </p>
                </div>
              </div>

        {/* Narrators Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Number</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Narrator Name</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">English Name</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Reputation</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Calculated Grade</th>
              </tr>
            </thead>
            <tbody>
                {chain.narrators.map((narrator, narratorIndex) => (
              <DraggableNarratorRow
                key={`chain-${selectedChainIndex}-narrator-${narratorIndex}-${narrator.number}`}
                narrator={narrator}
                index={narratorIndex}
                isEditing={false}
                onUpdateNarrator={() => {}} // Not used in view mode
                onUpdateReputation={(index, reputation) => {
                  const updatedChains = chains.map((c, cIndex) =>
                    cIndex === chainIndex
                      ? {
                          ...c,
                          narrators: c.narrators.map((n, i) =>
                            i === index
                              ? { ...n, reputation, calculatedGrade: calculateNarratorGrade(reputation) }
                              : n
                          )
                        }
                      : c
                  );
                  dispatch(globalActions.setChains(updatedChains));
                  const graphCode = generateMermaidCode(updatedChains, isDarkMode);
                  dispatch(globalActions.setMermaidCode(graphCode));
                }}
                onRemoveNarrator={undefined} // Not shown in view mode
                onViewNarratorDetails={narratorService.handleViewNarratorDetails}
                onUnmatchNarrator={(index) => narratorService.handleUnmatchNarratorView(index, chain.id)}
                onSearchNarrator={(index) => narratorService.handleOpenNarratorSearch(index, chain.id, false)}
                isDarkMode={isDarkMode}
              />
            ))}
            </tbody>
          </table>
        </div>

        {/* Chain Grade Display */}
        {(() => {
          const chainGrade = calculateChainGrade(chain.narrators);
          
          return (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Chain Grade</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Average of all narrator grades</p>
                  </div>
                </div>
                <div className="text-right">
                  {chainGrade !== null ? (
                    <>
                      <div className={`text-2xl font-bold ${getGradeColorClass(chainGrade)}`}>
                        {chainGrade.toFixed(1)}
                      </div>
                      <div className={`text-xs font-medium ${getGradeColorClass(chainGrade)}`}>
                        {getGradeDescription(chainGrade)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                        --
                      </div>
                      <div className="text-xs font-medium text-gray-400 dark:text-gray-500">
                        Insufficient data
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Matn (Hadith Text) - Below Chain Grade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Matn (Hadith Text)
          </label>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
            <p 
              className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words" 
              dir={/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(chain.matn) ? 'rtl' : 'ltr'}
              style={{
                textAlign: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(chain.matn) ? 'right' : 'left'
              }}
            >
              {chain.matn || <span className="text-gray-400 dark:text-gray-500 italic">No matn text</span>}
            </p>
          </div>
        </div>
      </div>
          )}
        </div>
      )}
    </div>
  );
}

