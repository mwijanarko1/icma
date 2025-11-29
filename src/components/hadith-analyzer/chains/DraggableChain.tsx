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
  state,
  dispatch,
  globalActions
}: DraggableChainProps) {
  // Memoize services to prevent recreation on every render and stale closures
  const narratorService = useMemo(
    () => createNarratorService(state, dispatch, globalActions, generateMermaidCode),
    [state, dispatch, globalActions]
  );
  const chainService = useMemo(
    () => createChainService(state, dispatch, globalActions),
    [state, dispatch, globalActions]
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
      style={{
        ...style,
        ...(isDragging
          ? { boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }
          : isHighlighted
          ? { boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }
          : { boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' })
      }}
      className={
        isDragging
          ? 'bg-white rounded-xl sm:rounded-2xl border-2 border-black ring-2 ring-blue-400 w-full min-w-0 max-w-full'
          : isHighlighted
          ? 'bg-white rounded-xl sm:rounded-2xl border-2 border-black ring-4 ring-blue-500 w-full min-w-0 max-w-full'
          : 'bg-white rounded-xl sm:rounded-2xl border-2 border-black w-full min-w-0 max-w-full'
      }
    >
      {/* Chain Header - Always Visible */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 cursor-pointer gap-3 sm:gap-0 ${!isCollapsed ? 'border-b-2 border-black' : ''}`}
        onClick={() => actions.onToggleCollapse(chain.id)}
        aria-label={isCollapsed ? "Expand chain" : "Collapse chain"}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className={`p-2 rounded-md border-2 flex-shrink-0 ${
              isDragging
                ? 'bg-blue-200 border-blue-400 shadow-md'
                : 'border-black'
            }`}
            aria-label="Drag to reorder chain"
            title="Drag to reorder chain"
          >
            <svg className={`w-4 h-4 ${
              isDragging
                ? 'text-blue-700'
                : 'text-gray-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4" />
            </svg>
          </button>

          <div className="p-1 flex-shrink-0">
            <svg
              className={`w-4 h-4 transform transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}
              style={{ color: '#000000', opacity: 0.6 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className={`text-lg font-medium min-w-0 ${chain.hiddenFromVisualization ? 'line-through' : ''}`} style={{ fontFamily: 'var(--font-title)', color: chain.hiddenFromVisualization ? '#000000' : '#000000', opacity: chain.hiddenFromVisualization ? 0.5 : 1 }}>
            <span className="truncate block">{chain.title || `Chain ${chainIndex + 1}`}</span>
            <span className="flex flex-wrap items-center gap-2 mt-1">
              {chain.hiddenFromVisualization && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 flex-shrink-0" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
                  Hidden from diagram
                </span>
              )}
              {chain.title?.includes('(Demo)') && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 flex-shrink-0" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Demo
                </span>
              )}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {!isEditing && (
            <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(globalActions.toggleChainVisibility(chain.id));
            }}
            className="text-sm font-medium px-3 py-1 rounded-md flex items-center gap-1"
            style={{ fontFamily: 'var(--font-content)', color: chain.hiddenFromVisualization ? '#000000' : '#000000', opacity: chain.hiddenFromVisualization ? 0.6 : 1 }}
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
            className="text-sm font-medium px-3 py-1 rounded-md"
            style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.onMatchNarrators(chain.id);
            }}
            className="text-sm font-medium px-3 py-1 rounded-md flex items-center gap-1"
            style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
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
            className="text-sm font-medium px-3 py-1 rounded-md"
            style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
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
                className="px-3 py-1 rounded-lg shadow-lg border-2 border-black text-sm font-semibold"
                style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
              >
                Save
              </button>
          <button
                onClick={(e) => {
                  e.stopPropagation();
                  chainService.handleCancelEdit();
                }}
                className="px-3 py-1 rounded-lg shadow-lg border-2 border-black text-sm font-semibold"
                style={{ backgroundColor: '#f2e9dd', color: '#000000', fontFamily: 'var(--font-content)' }}
              >
                Cancel
          </button>
            </>
          )}
        </div>
      </div>

      {/* Chain Content - Collapsible */}
      {!isCollapsed && (
        <div className="p-4 sm:p-6">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              {/* Chain Title Input */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  Chain Title
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => dispatch(globalActions.setEditFormData({ ...editFormData, title: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-900"
                  style={{ fontFamily: 'var(--font-content)' }}
                  placeholder="Enter chain title..."
                />
          </div>

          {/* Chain Text (Sanad) Input - Above Narrator Table */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  Chain (Sanad)
                </label>
                <textarea
                  value={editFormData.chainText}
                  onChange={(e) => dispatch(globalActions.setEditFormData({ ...editFormData, chainText: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-900 resize-y min-h-[80px]"
                  style={{ fontFamily: 'var(--font-content)' }}
                  placeholder="Enter chain text (sanad)..."
                  dir={/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(editFormData.chainText) ? 'rtl' : 'ltr'}
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
                  <table className="min-w-full border-2 border-black" style={{ transition: 'none' }}>
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border-2 border-black px-4 py-2 text-left font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Number</th>
                        <th className="border-2 border-black px-4 py-2 text-right font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Arabic Name</th>
                        <th className="border-2 border-black px-4 py-2 text-left font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>English Name</th>
                        <th className="border-2 border-black px-4 py-2 text-center font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Reputation</th>
                        <th className="border-2 border-black px-4 py-2 text-center font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Calculated Grade</th>
                        <th className="border-2 border-black px-4 py-2 text-center font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Actions</th>
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
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                  <DragOverlay>
                    {activeNarrator ? (
                      <table className="min-w-full border-2 border-black bg-white shadow-xl rounded-lg" style={{ transition: 'none' }}>
                        <tbody style={{ transition: 'none' }}>
                          <tr style={{ transition: 'none' }} className="bg-blue-100 ring-2 ring-blue-400">
                            <td style={{ transition: 'none', fontFamily: 'var(--font-content)', color: '#000000' }} className="border-2 border-black px-4 py-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="p-2 rounded-md border-2 border-blue-300">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                                    <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                                  </svg>
                                </div>
                                {activeNarrator.number}
                              </div>
                            </td>
                            <td style={{ transition: 'none' }} className="border-2 border-black px-4 py-2">
                              <span className="text-right block" style={{ fontFamily: 'var(--font-content)', color: '#000000' }} dir="rtl">{activeNarrator.arabicName}</span>
                            </td>
                            <td style={{ transition: 'none' }} className="border-2 border-black px-4 py-2">
                              <span style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>{activeNarrator.englishName}</span>
                            </td>
                            <td style={{ transition: 'none' }} className="border-2 border-black px-4 py-2 text-center">
                              <div className="p-2 rounded-md border-2 border-blue-300">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="mt-2 text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
                    💡 Drag the handle (≡) to reorder narrators • Use Tab to navigate, Space/Enter to grab/release
                  </div>
                )}

                {/* Chain Grade Display */}
                {(() => {
                  const chainGrade = calculateChainGrade(editFormData.narrators);
                  
                  return (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-black">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Chain Grade</h4>
                            <p className="text-xs" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>Average of all narrator grades</p>
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
                              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.4 }}>
                                --
                              </div>
                              <div className="text-xs font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.4 }}>
                                Insufficient data
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}


                {/* Add Narrator Section */}
                <div className="mt-4 border-t-2 border-black pt-4">
                  {!showAddNarrator ? (
                    <button
                      onClick={() => dispatch(globalActions.setShowAddNarrator(true))}
                      className="px-4 py-2 rounded-lg shadow-lg border-2 border-black flex items-center gap-2 font-semibold"
                      style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Narrator
                    </button>
                  ) : (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border-2 border-black">
                      <h4 className="font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Add New Narrator</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                            Arabic Name
                          </label>
                          <input
                            type="text"
                            value={newNarrator.arabicName}
                            onChange={(e) => dispatch(globalActions.setNewNarrator({ ...newNarrator, arabicName: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-900"
                            style={{ fontFamily: 'var(--font-content)' }}
                            placeholder="Enter Arabic name..."
                            dir="rtl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                            English Name
                          </label>
                          <input
                            type="text"
                            value={newNarrator.englishName}
                            onChange={(e) => dispatch(globalActions.setNewNarrator({ ...newNarrator, englishName: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-900"
                            style={{ fontFamily: 'var(--font-content)' }}
                            placeholder="Enter English name..."
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium mb-1" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                          Reputation
                        </label>
                        <ReputationSelector
                          selectedReputations={newNarrator.reputation}
                          onReputationChange={(reputation) => dispatch(globalActions.setNewNarrator({
                            ...newNarrator,
                            reputation,
                            calculatedGrade: calculateNarratorGrade(reputation)
                          }))}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={narratorService.handleAddNarrator}
                          disabled={!newNarrator.arabicName.trim() || !newNarrator.englishName.trim()}
                          className="px-4 py-2 rounded-lg shadow-lg border-2 border-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
                        >
                          Add Narrator
                        </button>
                        <button
                          onClick={narratorService.handleCancelAddNarrator}
                          className="px-4 py-2 rounded-lg shadow-lg border-2 border-black font-semibold"
                          style={{ backgroundColor: '#f2e9dd', color: '#000000', fontFamily: 'var(--font-content)' }}
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
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  Chain (Sanad)
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border-2 border-black overflow-visible">
                  <p 
                    className="text-sm whitespace-pre-wrap break-words overflow-visible" 
                    style={{ 
                      fontFamily: 'var(--font-content)', 
                      color: '#000000',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}
                    dir={/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(chain.chainText) ? 'rtl' : 'ltr'}
                  >
                    {chain.chainText || <span className="italic" style={{ opacity: 0.6 }}>No chain text</span>}
                  </p>
                </div>
              </div>

        {/* Narrators Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-2 border-black">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-2 border-black px-4 py-2 text-left font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Number</th>
                <th className="border-2 border-black px-4 py-2 text-right font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Narrator Name</th>
                <th className="border-2 border-black px-4 py-2 text-left font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>English Name</th>
                <th className="border-2 border-black px-4 py-2 text-center font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Reputation</th>
                <th className="border-2 border-black px-4 py-2 text-center font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Calculated Grade</th>
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
                  const graphCode = generateMermaidCode(updatedChains);
                  dispatch(globalActions.setMermaidCode(graphCode));
                }}
                onRemoveNarrator={undefined} // Not shown in view mode
                onViewNarratorDetails={narratorService.handleViewNarratorDetails}
                onUnmatchNarrator={(index) => narratorService.handleUnmatchNarratorView(index, chain.id)}
                onSearchNarrator={(index) => narratorService.handleOpenNarratorSearch(index, chain.id, false)}
              />
            ))}
            </tbody>
          </table>
        </div>

        {/* Chain Grade Display */}
        {(() => {
          const chainGrade = calculateChainGrade(chain.narrators);
          
          return (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Chain Grade</h4>
                    <p className="text-xs" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>Average of all narrator grades</p>
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
                      <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.4 }}>
                        --
                      </div>
                      <div className="text-xs font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.4 }}>
                        Insufficient data
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      </div>
          )}
        </div>
      )}
    </div>
  );
}

