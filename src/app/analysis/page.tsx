"use client";

import { useState, useEffect } from "react";
import { HadithTab } from "@/components/hadith-analyzer/input/HadithTab";
import { NarratorsModal } from "@/components/hadith-analyzer/input/NarratorsModal";
import Link from "next/link";
import Header from "@/components/Header";

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
    title: "Verify Narrators & Grades",
    description: "Examine biographical information and scholarly assessments of each narrator.",
    status: "locked"
  },
  {
    id: 3,
    title: "Visualize the Chain",
    description: "Create visual representations of your isnād chains to understand transmission relationships.",
    status: "locked"
  },
  {
    id: 4,
    title: "Identify Common Links (CLs)",
    description: "Systematically identify narrators who appear in multiple chains.",
    status: "locked"
  },
  {
    id: 5,
    title: "Define Textual Features",
    description: "Analyze the matn (text) of each narration to identify distinctive textual features.",
    status: "locked"
  },
  {
    id: 6,
    title: "Map Textual Variants Across Chains",
    description: "Correlate textual variations with their respective isnād chains to identify patterns.",
    status: "locked"
  },
  {
    id: 7,
    title: "Analyze Feature Correlations & PCLs",
    description: "Examine the relationship between textual features and common links.",
    status: "locked"
  },
  {
    id: 8,
    title: "Determine the Event Horizon & Historical Dating",
    description: "Establish the earliest possible date for the hadith based on your analysis.",
    status: "locked"
  },
  {
    id: 9,
    title: "Generate & Export Analysis Report",
    description: "Compile your findings into a comprehensive research report.",
    status: "locked"
  }
];

export default function AnalysisPage() {
  const [selectedHadiths, setSelectedHadiths] = useState<SelectedHadith[]>([]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [steps, setSteps] = useState<Step[]>(STEPS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNarratorsModal, setShowNarratorsModal] = useState(false);

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

      // Unlock step 2 if step 1 has hadiths
      if (selectedHadiths.length > 0 && updated[1].status === "locked") {
        updated[1] = { ...updated[1], status: "pending" as StepStatus };
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
    const step = steps[stepId - 1];
    if (step.status !== "locked") {
      setActiveStep(stepId);
    }
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
          <div className="text-center">
            <p className="text-lg mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
              This step will be implemented soon. Use the main analyzer to verify narrators and grades.
            </p>
            <Link
              href="/chain-analyzer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black"
              style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            >
              <span>Open Analyzer</span>
            </Link>
          </div>
        );
      
      case 3:
        return (
          <div className="text-center">
            <p className="text-lg mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
              This step will be implemented soon. Use the main analyzer to visualize chains.
            </p>
            <Link
              href="/chain-analyzer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black"
              style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            >
              <span>Open Analyzer</span>
            </Link>
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
                  disabled={step.status === "locked"}
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
        </main>
      </div>
      </div>
      
      {/* Modals */}
      <NarratorsModal
        show={showNarratorsModal}
        onClose={() => setShowNarratorsModal(false)}
      />
    </div>
  );
}
