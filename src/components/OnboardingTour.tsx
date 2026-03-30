import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, MousePointer2, Highlighter, MessageSquare, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: "center" | "top" | "bottom";
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const steps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to TapIt! 👋",
    description: "Your AI-powered reading companion. Let's take a quick tour to show you how to get the most out of your reading experience.",
    icon: <BookOpen className="h-8 w-8" />,
    position: "center",
  },
  {
    id: "definitions",
    title: "Instant Definitions",
    description: "Double-click any word in your document to get AI-powered contextual definitions. The definition considers the surrounding context for accuracy.",
    icon: <MousePointer2 className="h-8 w-8" />,
    position: "center",
  },
  {
    id: "annotations",
    title: "Highlight & Annotate",
    description: "Select text to highlight in different colors, add notes, or bookmark important sections. All your annotations sync across devices when signed in.",
    icon: <Highlighter className="h-8 w-8" />,
    position: "center",
  },
  {
    id: "chat",
    title: "Chat with Documents",
    description: "Click the 'Ask' button to open the document chat. Ask questions about your document and get AI-powered answers based on its content.",
    icon: <MessageSquare className="h-8 w-8" />,
    position: "center",
  },
  {
    id: "ai-search",
    title: "AI-Powered Search",
    description: "Use the search bar in the definition popover to search the web and get AI-summarized answers with citations. Great for research!",
    icon: <Sparkles className="h-8 w-8" />,
    position: "center",
  },
];

const ONBOARDING_KEY = "readmate_onboarding_completed";

export const OnboardingTour = ({ isOpen, onClose, onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleSkip}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          "relative w-full max-w-md mx-4 glass-card rounded-2xl p-8 shadow-2xl",
          "animate-fade-in-up",
          isAnimating && "opacity-50 scale-95 transition-all duration-200"
        )}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Skip tour"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentStep 
                  ? "w-6 bg-primary" 
                  : index < currentStep 
                    ? "bg-primary/50" 
                    : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6 text-primary">
            {step.icon}
          </div>
          
          <h2 className="text-2xl font-display font-bold mb-4">
            {step.title}
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-8">
            {step.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} of {steps.length}
          </span>
          
          <Button
            onClick={handleNext}
            className="gap-2"
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Skip link */}
        <div className="text-center mt-6">
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
};

export const useOnboardingTour = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      // Delay showing onboarding to let the page load
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const openOnboarding = () => setShowOnboarding(true);
  const closeOnboarding = () => setShowOnboarding(false);
  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    openOnboarding,
    closeOnboarding,
    resetOnboarding,
  };
};

export default OnboardingTour;
