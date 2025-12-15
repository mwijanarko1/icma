import type { Narrator as NarratorType } from '@/data/types';
import type { Narrator, Chain } from '@/types/hadith';
import type { ReputationGrade } from '@/lib/grading/constants';
import type { HadithAnalyzerState } from '@/types/hadithAnalyzerState';
import type { Dispatch } from 'react';
import type { HadithAnalyzerAction } from '@/reducers/hadithAnalyzerActions';
import { arrayMove } from '@dnd-kit/sortable';
import { extractReputationGrades } from '@/data/grade-extractor';
import { calculateNarratorGrade } from '@/lib/grading/calculator';

export async function searchNarrators(query: string, limit: number = 50, offset: number = 0, ranks?: string[], narratorRanks?: string[], placesOfResidence?: string[], isSearchAll?: boolean) {
  let url = `/api/narrators?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;

  // Add array parameters
  if (ranks && ranks.length > 0) {
    ranks.forEach(rank => {
      url += `&ranks=${encodeURIComponent(rank)}`;
    });
  }
  if (narratorRanks && narratorRanks.length > 0) {
    narratorRanks.forEach(rank => {
      url += `&narratorRanks=${encodeURIComponent(rank)}`;
    });
  }
  if (placesOfResidence && placesOfResidence.length > 0) {
    placesOfResidence.forEach(place => {
      url += `&placesOfResidence=${encodeURIComponent(place)}`;
    });
  }
  if (isSearchAll) {
    url += `&isSearchAll=true`;
  }

  const response = await fetch(url);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to search narrators');
  }

  return {
    narrators: data.narrators as NarratorType[],
    total: data.total || 0
  };
}

export async function fetchNarratorDetails(narratorId: string) {
  const response = await fetch(`/api/narrators/${encodeURIComponent(narratorId)}`);

  if (!response.ok) {
    throw new Error('Failed to fetch narrator details');
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch narrator details');
  }

  return data.narrator as NarratorType;
}

// Narrator handlers
export function createNarratorService(
  state: HadithAnalyzerState,
  dispatch: Dispatch<HadithAnalyzerAction>,
  actions: typeof import('@/reducers/hadithAnalyzerActions').actions,
  generateMermaidCode: (chains: Chain[]) => string
) {
  const handleDragStart = (event: { active: { id: string | number } }) => {
    const activeId = event.active.id as string;
    const activeNumber = parseInt(activeId);
    const narrator = state.editFormData.narrators.find((n: Narrator) => n.number === activeNumber);
    dispatch(actions.setActiveNarrator(narrator || null));
  };

  const handleDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;

    // Clear active narrator
    dispatch(actions.setActiveNarrator(null));

    if (!over || active.id === over.id) {
      return;
    }

    if (!state.editingChainId) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Parse the narrator numbers from the IDs
    const activeNumber = parseInt(activeId);
    const overNumber = parseInt(overId);

    const oldIndex = state.editFormData.narrators.findIndex((n: Narrator) => n.number === activeNumber);
    const newIndex = state.editFormData.narrators.findIndex((n: Narrator) => n.number === overNumber);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reorderedNarrators = arrayMove(state.editFormData.narrators, oldIndex, newIndex);

      // Update narrator numbers to reflect new order
      const updatedNarrators = reorderedNarrators.map((narrator: Narrator, index: number) => ({
        ...narrator,
        number: index + 1
      }));

      dispatch(actions.reorderEditFormNarrators(updatedNarrators));
    }
  };

  const handleViewNarratorDetails = async (narratorId: string) => {
    dispatch(actions.setIsLoadingNarratorDetails(true));
    try {
      const response = await fetch(`/api/narrators/${encodeURIComponent(narratorId)}`);
      if (response.ok) {
        const data = await response.json();
        dispatch(actions.setSelectedNarratorDetails(data.narrator));
        dispatch(actions.setShowNarratorModal(true));
      } else {
        console.error('Failed to load narrator details');
      }
    } catch (error) {
      console.error('Error fetching narrator details:', error);
    } finally {
      dispatch(actions.setIsLoadingNarratorDetails(false));
    }
  };

  const handleUpdateNarrator = (index: number, field: 'arabicName' | 'englishName', value: string) => {
    dispatch(actions.updateEditFormNarrator(index, field, value));
  };

  const handleAddNarrator = () => {
    if (!state.newNarrator.arabicName.trim() && !state.newNarrator.englishName.trim()) {
      return;
    }

    const newNarrator: Narrator = {
      number: state.editFormData.narrators.length + 1,
      arabicName: state.newNarrator.arabicName,
      englishName: state.newNarrator.englishName,
      reputation: state.newNarrator.reputation,
      calculatedGrade: state.newNarrator.calculatedGrade,
    };

    const updatedNarrators = [...state.editFormData.narrators, newNarrator];
    dispatch(actions.setEditFormData({
      ...state.editFormData,
      narrators: updatedNarrators
    }));
    dispatch(actions.setNewNarrator({ arabicName: '', englishName: '', reputation: [], calculatedGrade: 0 }));
    dispatch(actions.setShowAddNarrator(false));
  };

  const handleCancelAddNarrator = () => {
    dispatch(actions.setNewNarrator({ arabicName: '', englishName: '', reputation: [], calculatedGrade: 0 }));
    dispatch(actions.setShowAddNarrator(false));
  };

  const handleRemoveNarrator = (narratorIndex: number) => {
    const updatedNarrators = state.editFormData.narrators.filter((_: Narrator, index: number) => index !== narratorIndex);
    // Renumber the remaining narrators
    const renumberedNarrators = updatedNarrators.map((narrator: Narrator, index: number) => ({
      ...narrator,
      number: index + 1
    }));
    dispatch(actions.setEditFormData({
      ...state.editFormData,
      narrators: renumberedNarrators
    }));
  };

  const handleUnmatchNarratorEdit = (narratorIndex: number) => {
    const narrator = state.editFormData.narrators[narratorIndex];
    if (!narrator) return;

    const confirmed = window.confirm(
      `Are you sure you want to unmatch "${narrator.arabicName}" (${narrator.englishName}) from the database?\n\nThis will remove the database match, reputation, and all associated information.`
    );

    if (!confirmed) return;

    const updatedNarrators = state.editFormData.narrators.map((n: Narrator, index: number) => {
      if (index === narratorIndex) {
        return {
          ...n,
          matched: false,
          narratorId: undefined,
          confidence: undefined,
          matchedName: undefined,
          reputation: [],
          calculatedGrade: 0,
          databaseNarrator: undefined
        };
      }
      return n;
    });
    dispatch(actions.setEditFormData({
      ...state.editFormData,
      narrators: updatedNarrators
    }));
  };

  const handleUnmatchNarratorView = (narratorIndex: number, chainId: string) => {
    const chain = state.chains.find((c: Chain) => c.id === chainId);
    if (!chain) return;

    const narrator = chain.narrators[narratorIndex];
    if (!narrator) return;

    const confirmed = window.confirm(
      `Are you sure you want to unmatch "${narrator.arabicName}" (${narrator.englishName}) from the database?\n\nThis will remove the database match, reputation, and all associated information.`
    );

    if (!confirmed) return;

    const updatedChains = state.chains.map((c: Chain) => {
      if (c.id === chainId) {
        const updatedNarrators = c.narrators.map((n: Narrator, nIndex: number) => {
          if (nIndex === narratorIndex) {
            return {
              ...n,
              matched: false,
              narratorId: undefined,
              confidence: undefined,
              matchedName: undefined,
              reputation: [],
              calculatedGrade: 0,
              databaseNarrator: undefined
            };
          }
          return n;
        });
        return { ...c, narrators: updatedNarrators };
      }
      return c;
    });

    dispatch(actions.setChains(updatedChains));
    const graphCode = generateMermaidCode(updatedChains);
    dispatch(actions.setMermaidCode(graphCode));
  };

  const handleOpenNarratorSearch = (narratorIndex: number, chainId: string, inEditMode: boolean) => {
    // Get the narrator's name to search for first
    let narratorName = '';
    if (inEditMode) {
      const narrator = state.editFormData.narrators[narratorIndex];
      if (narrator) {
        // Try Arabic name first, fallback to English
        narratorName = narrator.arabicName.trim() || narrator.englishName.trim();
      }
    } else {
      const chain = state.chains.find((c: Chain) => c.id === chainId);
      if (chain && chain.narrators[narratorIndex]) {
        const narrator = chain.narrators[narratorIndex];
        narratorName = narrator.arabicName.trim() || narrator.englishName.trim();
      }
    }
    
    // Set modal to show FIRST, then set query - this ensures useEffect sees both changes
    dispatch(actions.setSearchingNarratorIndex(narratorIndex));
    dispatch(actions.setSearchingChainId(chainId));
    dispatch(actions.setSearchingInEditMode(inEditMode));
    dispatch(actions.setNarratorSearchModalResults([]));
    dispatch(actions.setNarratorSearchModalTotal(0));
    dispatch(actions.setNarratorSearchModalOffset(0));
    dispatch(actions.setIsSearchingModal(false));
    // Show modal first
    dispatch(actions.setShowNarratorSearchModal(true));
    // Then set query - React will batch these, but setting modal first ensures it's open when query changes
    dispatch(actions.setNarratorSearchModalQuery(narratorName));
    // The useEffect in HadithAnalyzer will handle the search automatically
  };

  const handleSearchNarratorsModal = async (query: string, offset: number = 0) => {
    if (!query.trim()) {
      dispatch(actions.setNarratorSearchModalResults([]));
      dispatch(actions.setNarratorSearchModalTotal(0));
      dispatch(actions.setNarratorSearchModalOffset(0));
      dispatch(actions.setIsSearchingModal(false));
      return;
    }

    dispatch(actions.setIsSearchingModal(true));
    try {
      const result = await searchNarrators(query, 20, offset);
      dispatch(actions.setNarratorSearchModalResults(offset === 0 ? result.narrators : [...state.narratorSearchModalResults, ...result.narrators]));
      dispatch(actions.setNarratorSearchModalTotal(result.total));
      dispatch(actions.setNarratorSearchModalOffset(offset));
    } catch (error) {
      console.error('Error searching narrators:', error);
      dispatch(actions.setNarratorSearchModalResults([]));
      dispatch(actions.setNarratorSearchModalTotal(0));
      dispatch(actions.setNarratorSearchModalOffset(0));
    } finally {
      dispatch(actions.setIsSearchingModal(false));
    }
  };

  const handleMatchNarratorFromSearch = async (selectedNarrator: NarratorType) => {
    const { searchingNarratorIndex, searchingChainId, searchingInEditMode } = state;

    if (searchingNarratorIndex === null || !searchingChainId) return;

    const narratorDetails = await fetchNarratorDetails(selectedNarrator.id);

    // Extract reputation grades using the same function as automatic matching
    // This extracts from all sources: reputationGrades, scholarly opinions, Ibn Hajar rank, etc.
    const reputation = extractReputationGrades(narratorDetails);

    if (searchingInEditMode) {
      // Update narrator in edit form
      const updatedNarrators = state.editFormData.narrators.map((narrator: Narrator, index: number) => {
        if (index === searchingNarratorIndex) {
          return {
            ...narrator,
            matched: true,
            narratorId: selectedNarrator.id,
            matchedName: selectedNarrator.primaryArabicName || selectedNarrator.primaryEnglishName || '',
            reputation,
            calculatedGrade: reputation.length > 0 ? calculateNarratorGrade(reputation) : 0,
            databaseNarrator: narratorDetails
          };
        }
        return narrator;
      });

      dispatch(actions.setEditFormData({
        ...state.editFormData,
        narrators: updatedNarrators
      }));
    } else {
      // Update narrator in actual chain
      const updatedChains = state.chains.map((chain: Chain) => {
        if (chain.id === searchingChainId) {
          const updatedNarrators = chain.narrators.map((narrator: Narrator, index: number) => {
            if (index === searchingNarratorIndex) {
              return {
                ...narrator,
                matched: true,
                narratorId: selectedNarrator.id,
                matchedName: selectedNarrator.primaryArabicName || selectedNarrator.primaryEnglishName || '',
                reputation,
                calculatedGrade: reputation.length > 0 ? calculateNarratorGrade(reputation) : 0,
                databaseNarrator: narratorDetails
              };
            }
            return narrator;
          });
          return { ...chain, narrators: updatedNarrators };
        }
        return chain;
      });

      dispatch(actions.setChains(updatedChains));
      const graphCode = generateMermaidCode(updatedChains);
      dispatch(actions.setMermaidCode(graphCode));
    }

    dispatch(actions.setShowNarratorSearchModal(false));
    dispatch(actions.setSearchingNarratorIndex(null));
    dispatch(actions.setSearchingChainId(null));
    dispatch(actions.setSearchingInEditMode(false));
  };

  const handleUpdateNarratorReputation = (chainIndex: number, narratorIndex: number, reputation: ReputationGrade[]) => {
    const updatedChains = state.chains.map((chain: Chain, cIndex: number) => {
      if (cIndex === chainIndex) {
        const updatedNarrators = chain.narrators.map((narrator: Narrator, nIndex: number) => {
          if (nIndex === narratorIndex) {
            const calculatedGrade = reputation.length > 0 ? calculateNarratorGrade(reputation) : 0;

            return {
              ...narrator,
              reputation,
              calculatedGrade
            };
          }
          return narrator;
        });
        return { ...chain, narrators: updatedNarrators };
      }
      return chain;
    });

    dispatch(actions.setChains(updatedChains));
    const graphCode = generateMermaidCode(updatedChains);
    dispatch(actions.setMermaidCode(graphCode));
  };

  const handleRemoveNarratorManual = (chainIndex: number, narratorIndex: number) => {
    const updatedChains = state.chains.map((chain: Chain, cIndex: number) => {
      if (cIndex === chainIndex) {
        const updatedNarrators = chain.narrators.filter((_: Narrator, nIndex: number) => nIndex !== narratorIndex);
        // Renumber the remaining narrators
        const renumberedNarrators = updatedNarrators.map((narrator: Narrator, index: number) => ({
          ...narrator,
          number: index + 1
        }));
        return { ...chain, narrators: renumberedNarrators };
      }
      return chain;
    });

    dispatch(actions.setChains(updatedChains));
    const graphCode = generateMermaidCode(updatedChains);
    dispatch(actions.setMermaidCode(graphCode));
  };

  const handleClearNarrators = (chainIndex: number) => {
    const updatedChains = state.chains.map((chain: Chain, cIndex: number) => {
      if (cIndex === chainIndex) {
        return { ...chain, narrators: [] };
      }
      return chain;
    });

    dispatch(actions.setChains(updatedChains));
    const graphCode = generateMermaidCode(updatedChains);
    dispatch(actions.setMermaidCode(graphCode));
  };

  const handleAddNarratorManual = () => {
    if (!state.newNarrator.arabicName.trim() && !state.newNarrator.englishName.trim()) {
      return;
    }

    const newNarrator: Narrator = {
      number: state.chains[state.selectedChainIndex].narrators.length + 1,
      arabicName: state.newNarrator.arabicName,
      englishName: state.newNarrator.englishName,
      reputation: state.newNarrator.reputation,
      calculatedGrade: state.newNarrator.calculatedGrade,
    };

    const updatedChains = state.chains.map((chain: Chain, index: number) => {
      if (index === state.selectedChainIndex) {
        return { ...chain, narrators: [...chain.narrators, newNarrator] };
      }
      return chain;
    });

    dispatch(actions.setChains(updatedChains));
    dispatch(actions.setNewNarrator({ arabicName: '', englishName: '', reputation: [], calculatedGrade: 0 }));

    const graphCode = generateMermaidCode(updatedChains);
    dispatch(actions.setMermaidCode(graphCode));
  };

  const handleUpdateChainTitle = (index: number, title: string) => {
    const updatedChains = state.chains.map((chain: Chain, i: number) =>
      i === index ? { ...chain, title } : chain
    );
    dispatch(actions.setChains(updatedChains));
  };

  const handleSearchNarrators = async (query: string, offset: number = 0, ranks?: string[], narratorRanks?: string[], placesOfResidence?: string[], isSearchAll?: boolean) => {
    if (!query.trim()) {
      dispatch(actions.setNarratorSearchResults([]));
      dispatch(actions.setNarratorSearchTotal(0));
      return;
    }

    dispatch(actions.setIsSearchingNarrators(true));
    try {
      const { narrators, total } = await searchNarrators(query, 50, offset, ranks, narratorRanks, placesOfResidence, isSearchAll);
      dispatch(actions.setNarratorSearchResults(narrators));
      dispatch(actions.setNarratorSearchTotal(total));
      dispatch(actions.setNarratorSearchOffset(offset));
    } catch (error) {
      console.error('Error searching narrators:', error);
    } finally {
      dispatch(actions.setIsSearchingNarrators(false));
    }
  };

  const handleFetchNarratorDetails = async (narratorId: string) => {
    dispatch(actions.setIsLoadingNarratorData(true));
    try {
      const narrator = await fetchNarratorDetails(narratorId);
      dispatch(actions.setSelectedNarratorData(narrator));
      dispatch(actions.setShowNarratorDetailsModal(true));
    } catch (error) {
      console.error('Error fetching narrator:', error);
    } finally {
      dispatch(actions.setIsLoadingNarratorData(false));
    }
  };

  const handleAddCompiler = async (compiler: string) => {
    // Map compiler keys to their exact Arabic and English names
    const compilerNames = {
      bukhari: {
        arabicName: "البخاري",
        englishName: "Al-Bukhari"
      },
      muslim: {
        arabicName: "مسلم بن الحجاج بن مسلم",
        englishName: "Muslim ibn al-Hajjaj"
      },
      abu_dawood: {
        arabicName: "أبو داود السجستاني",
        englishName: "Abu Dawood al-Sijistani"
      },
      tirmidhi: {
        arabicName: "محمد بن عيسى بن سورة بن موسى بن الضحاك",
        englishName: "Muhammad ibn Isa al-Tirmidhi"
      },
      ibn_majah: {
        arabicName: "محمد بن ماجه",
        englishName: "Muhammad ibn Majah"
      },
      nasai: {
        arabicName: "أبو عبد الرحمن أحمد بن شعيب النسائي",
        englishName: "Ahmad ibn Shuayb al-Nasai"
      }
    };

    const compilerInfo = compilerNames[compiler as keyof typeof compilerNames];
    if (!compilerInfo) return;

    try {
      // Search for the exact compiler in the database
      const searchResult = await searchNarrators(compilerInfo.arabicName, 1, 0);

      if (searchResult.narrators.length === 0) {
        console.error(`Compiler not found in database: ${compilerInfo.arabicName}`);
        return;
      }

      const compilerData = searchResult.narrators[0];

      const newNarrator: Narrator = {
        number: state.editFormData.narrators.length + 1,
        arabicName: compilerData.primaryArabicName,
        englishName: compilerInfo.englishName, // Use the predefined English name
        reputation: [], // No reputation for compilers
        calculatedGrade: undefined, // No calculated grade
        databaseNarrator: compilerData
      };

      const updatedNarrators = [...state.editFormData.narrators, newNarrator];
      dispatch(actions.setEditFormData({
        ...state.editFormData,
        narrators: updatedNarrators
      }));
    } catch (error) {
      console.error('Error adding compiler:', error);
    }
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleViewNarratorDetails,
    handleUpdateNarrator,
    handleAddNarrator,
    handleCancelAddNarrator,
    handleRemoveNarrator,
    handleUnmatchNarratorEdit,
    handleUnmatchNarratorView,
    handleOpenNarratorSearch,
    handleSearchNarratorsModal,
    handleMatchNarratorFromSearch,
    handleUpdateChainTitle,
    handleUpdateNarratorReputation,
    handleRemoveNarratorManual,
    handleClearNarrators,
    handleAddNarratorManual,
    handleAddCompiler,
    searchNarrators,
    fetchNarratorDetails,
    handleSearchNarrators,
    handleFetchNarratorDetails,
  };
}

