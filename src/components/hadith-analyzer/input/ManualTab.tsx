"use client";

import type { ManualTabProps } from './types';
import { ReputationSelector } from '@/components/hadith-analyzer/narrators/ReputationSelector';
import { calculateNarratorGrade } from '@/lib/grading/calculator';
import { getGradeDescription, getGradeColorClass } from '@/lib/grading/utils';
import { REPUTATION_GRADES } from '@/lib/grading/constants';

export function ManualTab({
  hadithText,
  onHadithTextChange,
  chains,
  selectedChainIndex,
  showAddNarrator,
  newNarrator,
  onNewHadith,
  onAddNewChain,
  onShowImportModal,
  onExportChains,
  onSelectChain,
  onShowAddNarrator,
  onNewNarratorChange,
  onAddNarrator,
  onRemoveChain,
  onUpdateChainTitle,
  onUpdateNarratorReputation,
  onRemoveNarrator,
  onClearNarrators,
  isDarkMode
}: ManualTabProps) {
  return (
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
                onClick={onNewHadith}
                className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                title="Start a new hadith (this will clear all current chains)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Hadith
              </button>
              <button
                onClick={onAddNewChain}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Chain
              </button>
              <button
                onClick={onShowImportModal}
                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Import Chain(s)
              </button>
              {chains.length > 0 && (
                <button
                  onClick={onExportChains}
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
                    onClick={() => onSelectChain(index)}
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
                onHadithTextChange(e.target.value);
                if (chains.length > 0 && chains[selectedChainIndex]) {
                  onUpdateChainTitle(selectedChainIndex, e.target.value);
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
              onClick={() => onShowAddNarrator(true)}
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
                    onChange={(e) => onNewNarratorChange({ ...newNarrator, arabicName: e.target.value })}
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
                    onChange={(e) => onNewNarratorChange({ ...newNarrator, englishName: e.target.value })}
                    placeholder="Enter English name..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reputation
                </label>
                <ReputationSelector
                  selectedReputations={newNarrator.reputation}
                  onReputationChange={(reputation) => onNewNarratorChange({ 
                    ...newNarrator, 
                    reputation, 
                    calculatedGrade: calculateNarratorGrade(reputation) 
                  })}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onAddNarrator}
                  disabled={!newNarrator.arabicName.trim() || !newNarrator.englishName.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                >
                  Add Narrator
                </button>
                <button
                  onClick={() => {
                    onNewNarratorChange({ arabicName: '', englishName: '', reputation: [], calculatedGrade: 0 });
                    onShowAddNarrator(false);
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
                onClick={() => onRemoveChain(selectedChainIndex)}
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
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Reputation</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Calculated Grade</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chains[selectedChainIndex].narrators.map((narrator, index) => (
                  <tr key={`table-narrator-${selectedChainIndex}-${index}-${narrator.number}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                      {narrator.arabicName === "رَسُولَ اللَّهِ" ? (
                        <div className="text-gray-500 dark:text-gray-400 text-sm italic">
                          N/A
                        </div>
                      ) : (
                        <>
                          <ReputationSelector
                            selectedReputations={narrator.reputation || []}
                            onReputationChange={(reputation) => onUpdateNarratorReputation(selectedChainIndex, index, reputation)}
                            isDarkMode={isDarkMode}
                          />
                          {(narrator.reputation || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center mt-2">
                              {(narrator.reputation || []).map((grade, gradeIdx) => (
                                <span
                                  key={`table-narrator-${narrator.number}-grade-${gradeIdx}-${grade}`}
                                  className={`px-2 py-1 text-xs rounded ${
                                    REPUTATION_GRADES[grade].category === 'high'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : REPUTATION_GRADES[grade].category === 'intermediate'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}
                                >
                                  {grade}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                      {narrator.arabicName === "رَسُولَ اللَّهِ" ? (
                        <div className="text-gray-500 dark:text-gray-400 text-sm italic">
                          N/A
                        </div>
                      ) : (
                        <>
                          <div className={`font-semibold ${getGradeColorClass(narrator.calculatedGrade || 0)}`}>
                            {(narrator.calculatedGrade || 0).toFixed(1)}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getGradeDescription(narrator.calculatedGrade || 0)}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                      <button
                        onClick={() => onRemoveNarrator(selectedChainIndex, index)}
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
                onClick={() => onClearNarrators(selectedChainIndex)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Clear Narrators
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

