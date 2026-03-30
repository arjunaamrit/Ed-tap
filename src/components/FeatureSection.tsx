
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Zap, Lightbulb, Layers } from "lucide-react";

const FeatureSection = () => {
  return (
    <section id="features" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Reimagining How We Access Information
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Beyond definitions, we're building the future of search that understands context and delivers precise answers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle>Instant Definitions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Double tap any word to get its contextual meaning instantly without leaving your reading flow. No more switching between apps.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <Lightbulb className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle>Context-Aware</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Our LLM-based technology understands the context of what you're reading and provides the most relevant definition for that specific usage.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle>AI-Powered Search</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Moving beyond keyword-based search to a system that understands your query at a deeper level and provides exact answers, not just links.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <Layers className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle>Scaling Intelligence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Built on the scaling hypothesis that transformer models improve with more compute, our technology will continually evolve to deliver better results.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <a href="https://instant-meaning-flow.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium">
          Check out our prototype →
        </a>
      </div>
    </section>
  );
};

export default FeatureSection;
