
import React from "react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Eliminate Distractions, <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Enhance Learning
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Instant, contextual word definitions with a double tap.
            No more switching apps, copying, or pasting. Stay focused on what matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
              <a href="https://instant-meaning-flow.vercel.app/" target="_blank" rel="noopener noreferrer">
                Try Our Demo
              </a>
            </Button>
            <Button variant="outline">
              Learn More
            </Button>
          </div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-lg">
          <div className="relative h-64 md:h-72 bg-white rounded-md shadow-sm overflow-hidden border border-gray-100">
            <div className="absolute inset-0 flex flex-col p-4">
              <div className="h-4 w-3/4 bg-gray-100 rounded mb-4"></div>
              <div className="flex-1 relative">
                <p className="text-sm text-gray-700 leading-relaxed">
                  The transformative power of AI is changing how we interact with information. 
                  <span className="relative inline-block">
                    <span className="bg-blue-100 px-1 py-0.5 rounded">transformers</span>
                    <div className="absolute top-full left-0 mt-1 w-64 p-3 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <p className="text-xs text-gray-600 font-medium">transformers</p>
                      <p className="text-xs text-gray-600 mt-1">
                        A neural network architecture designed for processing sequential data, forming the foundation of models like GPT.
                      </p>
                    </div>
                  </span>
                  {" "}are reshaping what's possible in search technology.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            Double-tap any word for instant, contextual definitions
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
