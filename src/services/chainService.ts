import type { Chain, LibraryChain, Narrator } from '@/types/hadith';
import type { Narrator as NarratorType } from '@/data/types';
import type { ReputationGrade } from '@/lib/grading/constants';
import type { HadithAnalyzerState } from '@/types/hadithAnalyzerState';
import type { Dispatch } from 'react';
import type { HadithAnalyzerAction } from '@/reducers/hadithAnalyzerActions';
import { generateMermaidCode } from '@/components/hadith-analyzer/visualization/utils';
import { calculateNarratorGrade } from '@/lib/grading/calculator';

export async function fetchLibraryChains(): Promise<LibraryChain[]> {
  const response = await fetch('/api/chains');
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch library chains');
  }

  return data.chains as LibraryChain[];
}

export async function loadChainFromLibrary(chainPath: string) {
  const response = await fetch('/api/chains', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chainPath }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to load chain from library');
  }

  // Migrate old chains that have hadithText to new format with chainText and matn
  const migratedChains = (data.data.chains || []).map((chain: { hadithText?: string; chainText?: string; matn?: string; [key: string]: unknown }) => {
    if ('hadithText' in chain && !('chainText' in chain)) {
      // Old format: migrate hadithText to chainText, leave matn empty
      return {
        ...chain,
        chainText: chain.hadithText || '',
        matn: ''
      };
    }
    // New format or already migrated
    return {
      ...chain,
      chainText: chain.chainText || '',
      matn: chain.matn || ''
    };
  }) as Chain[];

  return {
    hadithText: data.data.hadithText || '',
    chains: migratedChains,
    activeTab: data.data.activeTab || 'llm',
    selectedChainIndex: data.data.selectedChainIndex || 0,
    showVisualization: data.data.showVisualization || false
  };
}

// Chain handlers
export function createChainService(
  state: HadithAnalyzerState,
  dispatch: Dispatch<HadithAnalyzerAction>,
  actions: typeof import('@/reducers/hadithAnalyzerActions').actions,
  isDarkMode: boolean
) {
  const handleTryDemo = async () => {
    // Clear input text as requested
    dispatch(actions.setHadithText(""));

    // Chain 1: Sahih al-Bukhari 1
    const chain1Narrators: Narrator[] = [
      { number: 1, arabicName: "رَسُولَ اللَّهِ", englishName: "Messenger of Allah", reputation: ['Thiqah Thabt'], calculatedGrade: 10.0 },
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
      { number: 1, arabicName: "رَسُولَ اللَّهِ", englishName: "Messenger of Allah", reputation: ['Thiqah Thabt'], calculatedGrade: 10.0 },
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
      { number: 1, arabicName: "رَسُولَ اللَّهِ", englishName: "Messenger of Allah", reputation: ['Thiqah Thabt'], calculatedGrade: 10.0 },
      { number: 2, arabicName: "عُمَرَ بْنَ الْخَطَّابِ", englishName: "Umar ibn al-Khattab" },
      { number: 3, arabicName: "عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ", englishName: "Alqamah ibn Waqqas al-Laythi" },
      { number: 4, arabicName: "مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ", englishName: "Muhammad ibn Ibrahim al-Taymi" },
      { number: 5, arabicName: "يَحْيَى بْنُ سَعِيدٍ الْأَنْصَارِيُّ", englishName: "Yahya ibn Said al-Ansari" },
      { number: 6, arabicName: "مَالِكٌ", englishName: "Malik" },
      { number: 7, arabicName: "عَبْدُ اللَّهِ بْنُ مَسْلَمَةَ", englishName: "Abdullah ibn Maslamah" },
      { number: 8, arabicName: "الْإِمَامُ الْبُخَارِيُّ", englishName: "Imam al-Bukhari" }
    ];

    dispatch(actions.setIsLoading(true));
    dispatch(actions.setError(null));

    // Simulate processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create demo chains
    const demoChains: Chain[] = [
      {
        id: `chain-${Date.now()}-1`,
        narrators: chain1Narrators,
        chainText: "حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ...",
        matn: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ...",
        title: `Sahih al-Bukhari 1 - Intentions (Demo)`,
        collapsed: false
      },
      {
        id: `chain-${Date.now()}-2`,
        narrators: chain2Narrators,
        chainText: "حَدَّثَنَا مُحَمَّدُ بْنُ كَثِيرٍ...",
        matn: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ...",
        title: `Sahih al-Bukhari 2529 - Intentions (Demo)`,
        collapsed: false
      },
      {
        id: `chain-${Date.now()}-3`,
        narrators: chain3Narrators,
        chainText: "حَدَّثَنَا عَبْدُ اللَّهِ بْنُ مَسْلَمَةَ...",
        matn: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ...",
        title: `Sahih al-Bukhari 54 - Intentions (Demo)`,
        collapsed: false
      }
    ];

    dispatch(actions.setChains(demoChains));
    dispatch(actions.setShowVisualization(true));
    dispatch(actions.setIsLoading(false));
  };

  const handleExportChains = () => {
    const { hadithText, chains, activeTab, selectedChainIndex, showVisualization } = state;
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
  };

  const handleChainDragStart = (event: { active: { id: string | number } }) => {
    dispatch(actions.setActiveChainId(event.active.id as string));
  };

  const handleChainDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;

    dispatch(actions.setActiveChainId(null));

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = state.chains.findIndex((chain: Chain) => chain.id === active.id);
    const newIndex = state.chains.findIndex((chain: Chain) => chain.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reorderedChains = [...state.chains];
      const [removed] = reorderedChains.splice(oldIndex, 1);
      reorderedChains.splice(newIndex, 0, removed);

      dispatch(actions.setChains(reorderedChains));
      dispatch(actions.setSelectedChainIndex(newIndex));
    }
  };

  const handleRemoveChain = (chainId: string) => {
    dispatch(actions.removeChain(chainId));
    const newChains = state.chains.filter((chain: Chain) => chain.id !== chainId);
    if (newChains.length === 0) {
      dispatch(actions.setShowVisualization(false));
      dispatch(actions.setMermaidCode(""));
    } else {
      const graphCode = generateMermaidCode(newChains, isDarkMode);
      dispatch(actions.setMermaidCode(graphCode));
    }
  };

  const applyMatch = (matchData: {
    chainId: string;
    narratorNumber: number;
    match: {
      narratorId: string;
      confidence: number;
      matchedName: string;
      suggestedGrades?: ReputationGrade[];
      databaseNarrator: NarratorType;
    };
  }) => {
    const updatedChains = state.chains.map((c: Chain) => {
      if (c.id === matchData.chainId) {
        const updatedNarrators = c.narrators.map(narrator => {
          if (narrator.number === matchData.narratorNumber) {
            const reputation = matchData.match.suggestedGrades || narrator.reputation || [];
            return {
              ...narrator,
              matched: true,
              narratorId: matchData.match.narratorId,
              confidence: matchData.match.confidence,
              matchedName: matchData.match.matchedName,
              reputation,
              calculatedGrade: reputation.length > 0 ? calculateNarratorGrade(reputation) : narrator.calculatedGrade || 0,
              databaseNarrator: matchData.match.databaseNarrator
            };
          }
          return narrator;
        });
        return { ...c, narrators: updatedNarrators };
      }
      return c;
    });

    dispatch(actions.setChains(updatedChains));
  };

  const handleMatchNarrators = async (chainId: string, chainOverride?: Chain) => {
    const chain = chainOverride || state.chains.find((c: Chain) => c.id === chainId);
    if (!chain || chain.narrators.length === 0) {
      alert('No narrators in this chain to match.');
      return;
    }

    try {
      dispatch(actions.setIsLoading(true));
      dispatch(actions.setError(null));

      // Call the match-narrators API
      const response = await fetch('/api/match-narrators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          narrators: chain.narrators.map(n => ({
            number: n.number,
            arabicName: n.arabicName,
            englishName: n.englishName,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to match narrators');
      }

      const data = await response.json();

      // Collect matches that need user confirmation
      const matchesToConfirm: typeof state.pendingMatches = [];
      for (const match of data.matches || []) {
        if (match.matched && match.matches && match.matches.length > 0) {
          const narrator = chain.narrators.find((n: Narrator) => n.number === match.number);
          if (narrator) {
            matchesToConfirm.push({
              chainId,
              narratorNumber: narrator.number,
              narratorArabicName: narrator.arabicName,
              narratorEnglishName: narrator.englishName,
              matches: match.matches, // Top 3 matches
              selectedMatchIndex: 0, // Default to first match
            });
          }
        }
      }

      if (matchesToConfirm.length > 0) {
        // Show confirmation modal
        dispatch(actions.setPendingMatches(matchesToConfirm));
        dispatch(actions.setCurrentMatchIndex(0));
        dispatch(actions.setAcceptedMatchesCount(0));
        dispatch(actions.setShowMatchConfirmationModal(true));
      } else {
        alert('No narrators were matched to the database.');
      }
    } catch (error) {
      console.error('Error matching narrators:', error);
      dispatch(actions.setError(error instanceof Error ? error.message : 'Failed to match narrators'));
      alert(`Error matching narrators: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      dispatch(actions.setIsLoading(false));
    }
  };

  const handleAcceptMatch = () => {
    if (state.pendingMatches.length === 0) return;

    const currentMatch = state.pendingMatches[state.currentMatchIndex];
    const selectedMatchIndex = currentMatch.selectedMatchIndex ?? 0;
    const selectedMatch = currentMatch.matches[selectedMatchIndex];
    
    if (!selectedMatch) return;
    
    // Create a match object in the old format for applyMatch
    const matchToApply = {
      ...currentMatch,
      match: {
        narratorId: selectedMatch.narratorId,
        confidence: selectedMatch.confidence,
        matchedName: selectedMatch.matchedName,
        suggestedGrades: selectedMatch.suggestedGrades,
        databaseNarrator: selectedMatch.databaseNarrator,
      },
    };
    
    applyMatch(matchToApply);

    // Move to next match or close modal
    if (state.currentMatchIndex < state.pendingMatches.length - 1) {
      dispatch(actions.setCurrentMatchIndex(state.currentMatchIndex + 1));
    } else {
      dispatch(actions.setShowMatchConfirmationModal(false));
      dispatch(actions.setPendingMatches([]));
      dispatch(actions.setCurrentMatchIndex(0));
      dispatch(actions.setAcceptedMatchesCount(0));
    }
  };

  const handleRejectMatch = () => {
    if (state.pendingMatches.length === 0) return;

    // Move to next match or close modal
    if (state.currentMatchIndex < state.pendingMatches.length - 1) {
      dispatch(actions.setCurrentMatchIndex(state.currentMatchIndex + 1));
    } else {
      dispatch(actions.setShowMatchConfirmationModal(false));
      dispatch(actions.setPendingMatches([]));
      dispatch(actions.setCurrentMatchIndex(0));
      dispatch(actions.setAcceptedMatchesCount(0));
    }
  };

  const handleAcceptAllMatches = () => {
    if (state.pendingMatches.length === 0) return;

    state.pendingMatches.forEach((match) => {
      const selectedMatchIndex = match.selectedMatchIndex ?? 0;
      const selectedMatch = match.matches[selectedMatchIndex];
      
      if (!selectedMatch) return;
      
      // Create a match object in the old format for applyMatch
      const matchToApply = {
        ...match,
        match: {
          narratorId: selectedMatch.narratorId,
          confidence: selectedMatch.confidence,
          matchedName: selectedMatch.matchedName,
          suggestedGrades: selectedMatch.suggestedGrades,
          databaseNarrator: selectedMatch.databaseNarrator,
        },
      };
      
      applyMatch(matchToApply);
    });

    dispatch(actions.setShowMatchConfirmationModal(false));
    dispatch(actions.setPendingMatches([]));
    dispatch(actions.setCurrentMatchIndex(0));
    dispatch(actions.setAcceptedMatchesCount(0));
  };

  const handleRejectAllMatches = () => {
    dispatch(actions.setShowMatchConfirmationModal(false));
    dispatch(actions.setPendingMatches([]));
    dispatch(actions.setCurrentMatchIndex(0));
    dispatch(actions.setAcceptedMatchesCount(0));
  };

  const handleMatchAllNarrators = async () => {
    if (state.chains.length === 0) {
      alert('No chains to match narrators for.');
      return;
    }

    const chainsWithNarrators = state.chains.filter(c => c.narrators.length > 0);
    if (chainsWithNarrators.length === 0) {
      alert('No chains have narrators to match.');
      return;
    }

    try {
      dispatch(actions.setIsLoading(true));
      dispatch(actions.setError(null));

      const allMatchesToConfirm: typeof state.pendingMatches = [];
      const errors: string[] = [];

      // Process all chains sequentially to collect matches
      for (const chain of chainsWithNarrators) {
        try {
          const response = await fetch('/api/match-narrators', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              narrators: chain.narrators.map(n => ({
                number: n.number,
                arabicName: n.arabicName,
                englishName: n.englishName,
              })),
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to match narrators');
          }

          const data = await response.json();

          // Collect matches that need user confirmation
          for (const match of data.matches || []) {
            if (match.matched && match.matches && match.matches.length > 0) {
              const narrator = chain.narrators.find((n: Narrator) => n.number === match.number);
              if (narrator) {
                allMatchesToConfirm.push({
                  chainId: chain.id,
                  narratorNumber: narrator.number,
                  narratorArabicName: narrator.arabicName,
                  narratorEnglishName: narrator.englishName,
                  matches: match.matches, // Top 3 matches
                  selectedMatchIndex: 0, // Default to first match
                });
              }
            }
          }
        } catch (error) {
          const errorMsg = `Error matching chain "${chain.title || chain.id}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg, error);
        }
      }

      if (allMatchesToConfirm.length > 0) {
        // Show confirmation modal with all matches from all chains
        dispatch(actions.setPendingMatches(allMatchesToConfirm));
        dispatch(actions.setCurrentMatchIndex(0));
        dispatch(actions.setAcceptedMatchesCount(0));
        dispatch(actions.setShowMatchConfirmationModal(true));
        if (errors.length > 0) {
          console.warn('Some chains had errors:', errors);
        }
      } else {
        if (errors.length > 0) {
          alert(`No narrators were matched.\n\nErrors encountered:\n${errors.join('\n')}`);
        } else {
          alert('No narrators were matched to the database.');
        }
      }
    } catch (error) {
      console.error('Error matching all narrators:', error);
      dispatch(actions.setError(error instanceof Error ? error.message : 'Failed to match narrators'));
      alert(`Error matching narrators: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      dispatch(actions.setIsLoading(false));
    }
  };

  const handleEditChain = (chainId: string) => {
    const chain = state.chains.find((c: Chain) => c.id === chainId);
    if (chain) {
      dispatch(actions.setEditingChainId(chainId));
      dispatch(actions.setEditFormData({
        title: chain.title || '',
        narrators: [...chain.narrators],
        chainText: chain.chainText || '',
        matn: chain.matn || ''
      }));
    }
  };

  const handleCancelEdit = () => {
    dispatch(actions.setEditingChainId(null));
    dispatch(actions.setEditFormData({ title: '', narrators: [], chainText: '', matn: '' }));
  };

  const handleSaveEdit = () => {
    if (!state.editingChainId) return;

    const updatedChains = state.chains.map((chain: Chain) => {
      if (chain.id === state.editingChainId) {
        return {
          ...chain,
          title: state.editFormData.title,
          narrators: state.editFormData.narrators,
          chainText: state.editFormData.chainText,
          matn: state.editFormData.matn
        };
      }
      return chain;
    });

    dispatch(actions.setChains(updatedChains));
    dispatch(actions.setEditingChainId(null));
    dispatch(actions.setEditFormData({ title: '', narrators: [], chainText: '', matn: '' }));

    // Update visualization
    const graphCode = generateMermaidCode(updatedChains, isDarkMode);
    dispatch(actions.setMermaidCode(graphCode));
  };

  const handleToggleChainCollapse = (chainId: string) => {
    const updatedChains = state.chains.map((chain: Chain) => {
      if (chain.id === chainId) {
        return { ...chain, collapsed: !chain.collapsed };
      }
      return chain;
    });
    dispatch(actions.setChains(updatedChains));
  };

  const handleAddNewChain = () => {
    const newChain: Chain = {
      id: `chain-${Date.now()}`,
      narrators: [],
      chainText: '',
      matn: '',
      title: `Chain ${state.chains.length + 1}`,
      collapsed: false
    };
    dispatch(actions.addChain(newChain));
  };

  const handleSelectChain = (chainIndex: number) => {
    dispatch(actions.setSelectedChainIndex(chainIndex));
  };

  const handleRemoveChainManual = (chainIndex: number) => {
    const chainToRemove = state.chains[chainIndex];
    if (chainToRemove) {
      handleRemoveChain(chainToRemove.id);
    }
  };

  const handleUpdateChainTitle = (index: number, title: string) => {
    const updatedChains = [...state.chains];
    if (updatedChains[index]) {
      updatedChains[index] = { ...updatedChains[index], title };
      dispatch(actions.setChains(updatedChains));
    }
  };

  const handleExtractNarrators = async (
    extractNarrators: (text: string) => Promise<{ narrators: Narrator[]; chainText: string; matn: string }>,
    text: string
  ): Promise<void> => {
    dispatch(actions.setIsLoading(true));
    dispatch(actions.setError(null));

    try {
      const { narrators, chainText, matn } = await extractNarrators(text);

      // Create a new chain with the extracted narrators and separated chain/matn
      const newChainId = `chain-${Date.now()}`;
      const newChain: Chain = {
        id: newChainId,
        narrators: narrators,
        chainText: chainText || text.trim(), // Fallback to full text if chainText not provided
        matn: matn || '',
        title: `Chain ${state.chains.length + 1}`,
        collapsed: false
      };

      dispatch(actions.setChains([...state.chains, newChain]));
      dispatch(actions.setShowVisualization(true));
      
      // Automatically trigger matching modal after extraction
      await handleMatchNarrators(newChainId, newChain);
    } catch (err) {
      dispatch(actions.setError(err instanceof Error ? err.message : 'Failed to extract narrators'));
    } finally {
      dispatch(actions.setIsLoading(false));
    }
  };

  const handleFetchLibraryChains = async () => {
    dispatch(actions.setIsLoadingLibrary(true));
    try {
      const chains = await fetchLibraryChains();
      dispatch(actions.setLibraryChains(chains));
    } catch (error) {
      console.error('Error fetching library chains:', error);
      alert(error instanceof Error ? error.message : 'Failed to load library chains. Please try again.');
    } finally {
      dispatch(actions.setIsLoadingLibrary(false));
    }
  };

  const handleLoadChainFromLibrary = async (chainPath: string) => {
    try {
      const data = await loadChainFromLibrary(chainPath);
      const confirmed = window.confirm(
        `Import ${data.chains.length} chains from library? This will replace all current data.`
      );

      if (confirmed) {
        dispatch(actions.setHadithText(data.hadithText));
        dispatch(actions.setChains(data.chains));
        dispatch(actions.setActiveTab(data.activeTab));
        dispatch(actions.setSelectedChainIndex(data.selectedChainIndex));
        dispatch(actions.setShowVisualization(data.showVisualization));
        dispatch(actions.setShowImportModal(false));
      }
    } catch (error) {
      console.error('Error loading chain from library:', error);
      alert(error instanceof Error ? error.message : 'Failed to load chain from library. Please try again.');
    }
  };

  const handleSelectMatch = (matchIndex: number, selectedIndex: number) => {
    dispatch(actions.setSelectedMatchIndex(matchIndex, selectedIndex));
  };

  return {
    handleTryDemo,
    handleExportChains,
    handleChainDragStart,
    handleChainDragEnd,
    handleRemoveChain,
    handleMatchNarrators,
    handleAcceptMatch,
    handleRejectMatch,
    handleAcceptAllMatches,
    handleRejectAllMatches,
    handleSelectMatch,
    handleMatchAllNarrators,
    handleEditChain,
    handleCancelEdit,
    handleSaveEdit,
    handleToggleChainCollapse,
    handleAddNewChain,
    handleSelectChain,
    handleRemoveChainManual,
    handleUpdateChainTitle,
    applyMatch,
    fetchLibraryChains,
    loadChainFromLibrary,
    handleExtractNarrators,
    handleFetchLibraryChains,
    handleLoadChainFromLibrary,
  };
}
