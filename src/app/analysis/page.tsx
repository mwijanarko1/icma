"use client";

import { useState, useEffect } from "react";
import { HadithTab } from "@/components/hadith-analyzer/input/HadithTab";
import { NarratorsModal } from "@/components/hadith-analyzer/input/NarratorsModal";
import { ApiKeyModal } from "@/components/hadith-analyzer/settings/ApiKeyModal";
import { CACHE_KEYS } from "@/lib/cache/constants";
import Header from "@/components/Header";
import HadithAnalyzer from "@/components/HadithAnalyzer";


type SelectedHadith = {
  hadith_number: number;
  sub_version?: string;
  reference: string;
  english_narrator?: string;
  english_translation: string;
  arabic_text: string;
  in_book_reference?: string;
  collection: string;
};

const COLLECTIONS: { value: string; label: string }[] = [
  { value: 'bukhari', label: 'Sahih al-Bukhari' },
  { value: 'muslim', label: 'Sahih Muslim' },
  { value: 'nasai', label: 'Sunan an-Nasa\'i' },
  { value: 'tirmidhi', label: 'Jami` at-Tirmidhi' },
  { value: 'abudawud', label: 'Sunan Abi Dawud' },
  { value: 'ibnmajah', label: 'Sunan Ibn Majah' },
];


type StepStatus = "pending" | "in-progress" | "completed" | "locked";

interface Step {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
}

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

export default function AnalysisPage() {
  const [selectedHadiths, setSelectedHadiths] = useState<SelectedHadith[]>([]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [steps, setSteps] = useState<Step[]>(STEPS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNarratorsModal, setShowNarratorsModal] = useState(false);
  const [expandedSelectedHadith, setExpandedSelectedHadith] = useState<string | null>(null);
  const [copiedHadithNumber, setCopiedHadithNumber] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

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

  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);
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
          <div className="w-5 h-5 rounded-full border-2 border-current animate-pulse" />
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
    switch (activeStep) {
      case 1:
        return (
          <HadithTab 
            selectedHadiths={selectedHadiths}
            onSelectedHadithsChange={setSelectedHadiths}
            showSelectButton={true}
          />
        );
      
      case 2:
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                Visualize the Chain
              </h2>
              <p className="text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                Create visual representations of your isnād chains to understand transmission relationships.
              </p>
            </div>
            <HadithAnalyzer />
          </div>
        );
      
      default:
        return (
          <div className="text-center">
            <p className="text-lg" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
              Coming Soon
            </p>
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
              isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full lg:w-80 lg:translate-x-0'
            }`}
            style={{ 
              backgroundColor: 'rgba(242, 233, 221, 0.98)',
              boxShadow: isSidebarOpen ? '2px 0 10px rgba(0, 0, 0, 0.1)' : 'none',
              minHeight: 'calc(100vh - 85px)'
            }}
          >
          <div className="h-full overflow-y-auto">
          {/* Sidebar Header */}
          <div className="p-4 sm:p-6 border-b-2 border-black/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                Analysis Steps
                  </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
          <nav className="p-2 sm:p-4 space-y-2">
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
                  className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-2 sm:gap-3 ${
                    isActive ? 'shadow-lg scale-105' : 'hover:shadow-md'
                  } ${getStepStatusColor(step.status, isActive)}`}
                  style={{ fontFamily: 'var(--font-content)' }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs sm:text-sm font-semibold">Step {step.id}</span>
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm mb-1">{step.title}</h3>
                    <p className="text-xs opacity-75 line-clamp-2">{step.description}</p>
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
