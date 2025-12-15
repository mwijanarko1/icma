"use client";

import { useState, useEffect } from "react";
import { HadithTab } from "@/components/hadith-analyzer/input/HadithTab";
import { NarratorsModal } from "@/components/hadith-analyzer/input/NarratorsModal";
import { ApiKeyModal } from "@/components/hadith-analyzer/settings/ApiKeyModal";
import { CACHE_KEYS } from "@/lib/cache/constants";
import {
  loadCachedAnalysisSelectedHadiths,
  loadCachedAnalysisActiveStep,
  loadCachedAnalysisStepsStatus,
  saveAnalysisSelectedHadiths,
  saveAnalysisActiveStep,
  saveAnalysisStepsStatus
} from "@/lib/cache/storage";
import Header from "@/components/Header";
import HadithAnalyzer from "@/components/HadithAnalyzer";
import type { SelectedHadith, Step, StepStatus } from "@/types/analysis";
import { useAuth } from "@/contexts/AuthContext";
import { saveAnalysisSession } from "@/lib/firebase/firestore";

const COLLECTIONS: { value: string; label: string }[] = [
  { value: 'bukhari', label: 'Sahih al-Bukhari' },
  { value: 'muslim', label: 'Sahih Muslim' },
  { value: 'nasai', label: 'Sunan an-Nasa\'i' },
  { value: 'tirmidhi', label: 'Jami` at-Tirmidhi' },
  { value: 'abudawud', label: 'Sunan Abi Dawud' },
  { value: 'ibnmajah', label: 'Sunan Ibn Majah' },
];


const STEPS: Step[] = [
  {
    id: 1,
    title: "Compile Narrations",
    description: "Gather all narrations related to your chosen topic from various sources.",
    status: "pending"
  },
  {
    id: 2,
    title: "Visualize the Chain",
    description: "Create visual representations of your isnād chains to understand transmission relationships.",
    status: "pending"
  },
  {
    id: 3,
    title: "Identify Common Links (CLs)",
    description: "Systematically identify narrators who appear in multiple chains.",
    status: "pending"
  },
  {
    id: 4,
    title: "Define Textual Features",
    description: "Analyze the matn (text) of each narration to identify distinctive textual features.",
    status: "pending"
  },
  {
    id: 5,
    title: "Map Textual Variants Across Chains",
    description: "Correlate textual variations with their respective isnād chains to identify patterns.",
    status: "pending"
  },
  {
    id: 6,
    title: "Analyze Feature Correlations & PCLs",
    description: "Examine the relationship between textual features and common links.",
    status: "pending"
  },
  {
    id: 7,
    title: "Determine the Event Horizon & Historical Dating",
    description: "Establish the earliest possible date for the hadith based on your analysis.",
    status: "pending"
  },
  {
    id: 8,
    title: "Generate & Export Analysis Report",
    description: "Compile your findings into a comprehensive research report.",
    status: "pending"
  }
];

// Initialize state with cached data
function getInitialAnalysisState() {
  // Check for session to load from sessionStorage first
  let loadedSession = null;
  if (typeof window !== 'undefined') {
    const sessionData = sessionStorage.getItem("loadAnalysisSession");
    if (sessionData) {
      try {
        loadedSession = JSON.parse(sessionData);
        sessionStorage.removeItem("loadAnalysisSession"); // Clear after loading
      } catch (e) {
        console.error("Error parsing session data:", e);
      }
    }
  }

  return {
    selectedHadiths: loadedSession?.selectedHadiths || [],
    activeStep: loadedSession?.activeStep || 1,
    steps: loadedSession?.steps || STEPS,
    currentSessionId: loadedSession?.id || null,
    currentSessionName: loadedSession?.name || null,
    isSidebarOpen: false,
    showNarratorsModal: false,
    expandedSelectedHadith: null,
    copiedHadithNumber: null,
    apiKey: '',
    showApiKeyModal: false,
  };
}

export default function AnalysisPage() {
  const [selectedHadiths, setSelectedHadiths] = useState<SelectedHadith[]>(getInitialAnalysisState().selectedHadiths);
  const [activeStep, setActiveStep] = useState<number>(getInitialAnalysisState().activeStep);
  const [steps, setSteps] = useState<Step[]>(getInitialAnalysisState().steps);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(getInitialAnalysisState().currentSessionId);
  const [currentSessionName, setCurrentSessionName] = useState<string | null>(getInitialAnalysisState().currentSessionName);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNarratorsModal, setShowNarratorsModal] = useState(false);
  const [expandedSelectedHadith, setExpandedSelectedHadith] = useState<string | null>(null);
  const [copiedHadithNumber, setCopiedHadithNumber] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  // Load cached data after hydration to avoid hydration mismatches
  useEffect(() => {
    // Only load cached data on the client side after hydration
    if (typeof window !== 'undefined') {
      const cachedSelectedHadiths = loadCachedAnalysisSelectedHadiths();
      if (cachedSelectedHadiths && cachedSelectedHadiths.length > 0) {
        setSelectedHadiths(cachedSelectedHadiths);
      }

      const cachedActiveStep = loadCachedAnalysisActiveStep();
      if (cachedActiveStep && cachedActiveStep !== 1) {
        setActiveStep(cachedActiveStep);
      }

      const cachedSteps = loadCachedAnalysisStepsStatus();
      if (cachedSteps) {
        setSteps(cachedSteps);
      }
    }
  }, []);

  // Manual save function
  const handleSaveAnalysis = async () => {
    if (!user) {
      console.error("Cannot save analysis session: user not logged in");
      return;
    }

    setIsSaving(true);
    try {
      const sessionName = currentSessionId
        ? undefined // Don't update name if we already have a session
        : `Analysis Session - ${new Date().toLocaleDateString()}`;

      const sessionData = {
        name: sessionName || currentSessionName || "Untitled",
        selectedHadiths,
        activeStep,
        steps,
      };

      const sessionId = await saveAnalysisSession(
        user.uid,
        sessionData,
        currentSessionId || undefined
      );

      if (sessionId && sessionId !== currentSessionId) {
        setCurrentSessionId(sessionId);
        // Set the session name if this is a new session
        if (!currentSessionName && sessionName) {
          setCurrentSessionName(sessionName);
        }
      }
    } catch (error) {
      console.error("Error saving analysis session:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Load API key from localStorage on mount
  useEffect(() => {
    try {
      const cachedApiKey = localStorage.getItem(CACHE_KEYS.API_KEY);
      if (cachedApiKey) {
        setApiKey(cachedApiKey);
      }
    } catch (error) {
      console.warn('Failed to load API key from cache:', error);
    }
  }, []);

  // Save API key to localStorage when it changes
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

  // Update step status based on progress
  useEffect(() => {
    setSteps(prevSteps => {
      const updated = [...prevSteps];
      
      // Step 1 is in-progress if we have selected hadiths
      if (selectedHadiths.length > 0) {
        updated[0] = { ...updated[0], status: "in-progress" as StepStatus };
      } else {
        updated[0] = { ...updated[0], status: "pending" as StepStatus };
      }

      return updated;
    });
  }, [selectedHadiths]);

  // Update active step status
  useEffect(() => {
    setSteps(prevSteps => {
      const updated = [...prevSteps];
      updated.forEach((step, index) => {
        if (index === activeStep - 1) {
          if (step.status === "pending" || step.status === "in-progress") {
            updated[index] = { ...step, status: "in-progress" as StepStatus };
          }
        }
      });
      return updated;
    });
  }, [activeStep]);

  // Save selected hadiths to cache whenever they change
  useEffect(() => {
    try {
      saveAnalysisSelectedHadiths(selectedHadiths);
    } catch (error) {
      console.warn('Failed to cache selected hadiths:', error);
    }
  }, [selectedHadiths]);

  // Save active step to cache whenever it changes
  useEffect(() => {
    try {
      saveAnalysisActiveStep(activeStep);
    } catch (error) {
      console.warn('Failed to cache active step:', error);
    }
  }, [activeStep]);

  // Save steps status to cache whenever it changes
  useEffect(() => {
    try {
      saveAnalysisStepsStatus(steps);
    } catch (error) {
      console.warn('Failed to cache steps status:', error);
    }
  }, [steps]);

  // Save analysis state before page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        // Save all analysis state synchronously
        saveAnalysisSelectedHadiths(selectedHadiths);
        saveAnalysisActiveStep(activeStep);
        saveAnalysisStepsStatus(steps);
      } catch (error) {
        console.warn('Failed to save analysis state on unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also save on unmount
      handleBeforeUnload();
    };
  }, [selectedHadiths, activeStep, steps]);

  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);
  };

  const handleMarkStepComplete = async (stepId: number) => {
    const stepIndex = stepId - 1; // Convert to 0-based index
    const wasCompleted = steps[stepIndex]?.status === "completed";

    setSteps(prevSteps => {
      const updated = [...prevSteps];
      if (stepIndex >= 0 && stepIndex < updated.length) {
        updated[stepIndex] = { ...updated[stepIndex], status: "completed" as StepStatus };
      }
      return updated;
    });

    // Only save if the step wasn't already completed
    if (!wasCompleted) {
      // Use setTimeout to ensure state update completes before saving
      setTimeout(() => {
        handleSaveAnalysis();
      }, 0);
    }
  };

  const handleRemoveHadith = (hadith: SelectedHadith) => {
    setSelectedHadiths(prev => 
      prev.filter(
        h => !(h.hadith_number === hadith.hadith_number &&
                h.sub_version === hadith.sub_version &&
                h.collection === hadith.collection)
      )
    );
  };

  const copyArabicText = async (text: string, hadithNumber: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHadithNumber(hadithNumber);
      setTimeout(() => setCopiedHadithNumber(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };



  const renderSelectedHadiths = (showRemoveButton: boolean = false) => {
    if (selectedHadiths.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
            No hadiths selected yet. Go to Step 1 to select hadiths.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {selectedHadiths.map((hadith) => {
          const hadithKey = `${hadith.collection || 'unknown'}-${hadith.hadith_number}${hadith.sub_version || ''}`;
          const isExpanded = expandedSelectedHadith === hadithKey;
          
          return (
            <div
              key={hadithKey}
              className="rounded-lg border-2 border-black bg-white hover:shadow-lg transition-all duration-200 ease-in-out"
              style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => {
                  if (isExpanded) {
                    setExpandedSelectedHadith(null);
                  } else {
                    setExpandedSelectedHadith(hadithKey);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      {hadith.reference}
                    </h4>
                    {hadith.collection && (
                      <span className="text-xs px-2 py-1 rounded border border-black inline-block mt-1" style={{ backgroundColor: '#f2e9dd', color: '#000000', fontFamily: 'var(--font-content)' }}>
                        {COLLECTIONS.find(c => c.value === hadith.collection)?.label || hadith.collection}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hadith.in_book_reference && (
                      <span className="text-xs" style={{ color: '#000000', opacity: 0.6, fontFamily: 'var(--font-content)' }}>
                        {hadith.in_book_reference}
                      </span>
                    )}
                    {showRemoveButton && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHadith(hadith);
                        }}
                        className="px-3 py-1 text-xs rounded-lg transition-all duration-200 border-2 flex items-center gap-1 font-semibold hover:bg-red-50"
                        style={{
                          backgroundColor: '#f2e9dd',
                          color: '#000000',
                          borderColor: '#000000',
                          fontFamily: 'var(--font-content)'
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove
                      </button>
                    )}
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                      style={{ color: '#000000', opacity: 0.4 }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {!isExpanded && (
                  <p className="text-sm line-clamp-2" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                    {hadith.english_translation.substring(0, 200)}...
                  </p>
                )}
              </div>
              
              {isExpanded && (
                <div className="px-4 pb-4 border-t-2 border-black pt-4 transition-all duration-200 ease-in-out">

                  {hadith.english_narrator && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Narrator:</p>
                      <p style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>{hadith.english_narrator}</p>
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>English Translation:</p>
                    <p className="leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      {hadith.english_translation}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Arabic Text:</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyArabicText(hadith.arabic_text, hadith.hadith_number);
                        }}
                        className="px-3 py-1 text-xs rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-1 font-semibold"
                        style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
                      >
                        {copiedHadithNumber === hadith.hadith_number ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Arabic
                          </>
                        )}
                      </button>
                    </div>
                    <p 
                      className="leading-relaxed text-lg"
                      dir="rtl"
                      style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
                    >
                      {hadith.arabic_text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "in-progress":
        return (
          <div className="w-5 h-5 rounded-full border-2 border-current" />
        );
      case "locked":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-current" />
        );
    }
  };

  const getStepStatusColor = (status: StepStatus, isActive: boolean) => {
    if (isActive) {
      return "bg-black text-[#f2e9dd] border-black";
    }
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "locked":
        return "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed";
      default:
        return "bg-white/50 text-gray-700 border-gray-300";
    }
  };

  const renderStepContent = () => {
    const currentStep = steps.find(s => s.id === activeStep);
    const isStepCompleted = currentStep?.status === "completed";

    switch (activeStep) {
      case 1:
        return (
          <div>
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  {currentStep?.title}
                </h2>
                <p className="text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                  {currentStep?.description}
                </p>
              </div>
              {!isStepCompleted && (
                <button
                  onClick={() => handleMarkStepComplete(activeStep)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:scale-105"
                  style={{
                    backgroundColor: '#000000',
                    color: '#f2e9dd',
                    fontFamily: 'var(--font-content)',
                    border: '2px solid #000000'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark Step Complete
                </button>
              )}
            </div>
            <HadithTab
              selectedHadiths={selectedHadiths}
              onSelectedHadithsChange={setSelectedHadiths}
              showSelectButton={true}
            />
          </div>
        );

      case 2:
        return (
          <div>
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  {currentStep?.title}
                </h2>
                <p className="text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                  {currentStep?.description}
                </p>
              </div>
              {!isStepCompleted && (
                <button
                  onClick={() => handleMarkStepComplete(activeStep)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:scale-105"
                  style={{
                    backgroundColor: '#000000',
                    color: '#f2e9dd',
                    fontFamily: 'var(--font-content)',
                    border: '2px solid #000000'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark Step Complete
                </button>
              )}
            </div>

            {/* Selected Hadiths Section */}
            {selectedHadiths.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  Selected Hadiths ({selectedHadiths.length})
                </h3>
                {renderSelectedHadiths(false)}
              </div>
            )}

            <HadithAnalyzer />
          </div>
        );

      default:
        return (
          <div>
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  {currentStep?.title || `Step ${activeStep}`}
                </h2>
                <p className="text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                  {currentStep?.description || "This step is coming soon."}
                </p>
              </div>
              {!isStepCompleted && (
                <button
                  onClick={() => handleMarkStepComplete(activeStep)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:scale-105"
                  style={{
                    backgroundColor: '#000000',
                    color: '#f2e9dd',
                    fontFamily: 'var(--font-content)',
                    border: '2px solid #000000'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark Step Complete
                </button>
              )}
            </div>
            <div className="text-center">
              <p className="text-lg" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
                Coming Soon
              </p>
            </div>
          </div>
        );
    }
  };

  const completedSteps = steps.filter(s => s.status === "completed").length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div 
      className="min-h-screen relative flex flex-col" 
      style={{ 
        backgroundColor: '#f2e9dd', 
        color: '#000000',
      }}
    >
      <Header />
      <div className="flex flex-1 relative">
        {/* Mobile Menu Button */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-20 -left-2 z-50 p-3 rounded-lg border-2 border-black shadow-lg transition-all duration-200 lg:hidden"
            style={{ backgroundColor: '#000000', color: '#f2e9dd' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Sidebar Navigation */}
        <aside
            className={`fixed top-[85px] lg:relative lg:top-0 z-40 border-r-2 border-black/20 backdrop-blur-sm transition-all duration-300 ${
              isSidebarOpen ? 'w-full sm:w-72 md:w-80 translate-x-0' : 'w-0 -translate-x-full lg:w-80 lg:translate-x-0'
            }`}
            style={{
              backgroundColor: 'rgba(242, 233, 221, 0.98)',
              boxShadow: isSidebarOpen ? '2px 0 10px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
          <div className="min-h-full overflow-y-auto max-h-[calc(100vh-85px)]">
          {/* Sidebar Header */}
          <div className="p-3 sm:p-4 border-b-2 border-black/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  Analysis Steps
                </h2>
                {currentSessionName && (
                  <p className="text-sm opacity-75 mt-1" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    {currentSessionName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
      {/* Save Button - Show for logged-in users */}
      {user && (
          <button
            onClick={handleSaveAnalysis}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#000000',
              color: '#f2e9dd',
              fontFamily: 'var(--font-content)',
              border: '2px solid #000000'
            }}
          >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  Progress
                </span>
                <span className="text-xs sm:text-sm font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  {completedSteps}/{steps.length}
                  </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progressPercentage}%`,
                    backgroundColor: '#000000'
                  }}
                />
                </div>
              </div>
            </div>
            
          {/* Steps List */}
          <nav className="p-2 sm:p-3 space-y-1.5">
            {steps.map((step) => {
              const isActive = step.id === activeStep;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    handleStepClick(step.id);
                    // Close sidebar on mobile after selecting a step
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`w-full text-left p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 flex items-start gap-2 sm:gap-2.5 ${
                    isActive ? 'shadow-lg scale-105' : 'hover:shadow-md'
                  } ${getStepStatusColor(step.status, isActive)}`}
                  style={{ fontFamily: 'var(--font-content)' }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold">Step {step.id}</span>
                    </div>
                    <h3 className="font-semibold text-xs mb-0.5 leading-tight">{step.title}</h3>
                    <p className="text-xs opacity-75 line-clamp-2 leading-tight">{step.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>
            </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Step Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {renderStepContent()}
          </div>
          
          {/* Selected Hadiths Section - Only show on Step 1 when hadiths are selected */}
          {activeStep === 1 && selectedHadiths.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <div className="mt-8 pt-8 border-t-2 border-black/20">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  Selected Hadiths ({selectedHadiths.length})
                </h2>
                {renderSelectedHadiths(true)}
              </div>
            </div>
          )}
        </main>
      </div>
      </div>
      
      {/* Modals */}
      <NarratorsModal
        show={showNarratorsModal}
        onClose={() => setShowNarratorsModal(false)}
      />
      <ApiKeyModal
        apiKey={apiKey}
        showApiKeyModal={showApiKeyModal}
        onSave={(key) => {
          setApiKey(key);
          setShowApiKeyModal(false);
        }}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  );
}