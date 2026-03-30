import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

const AboutFounder = () => {
  return (
    <section id="about" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">About the Founder</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The vision and passion behind Tapit
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="md:col-span-2 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600">Founder</Badge>
                  <Badge variant="outline">Visionary</Badge>
                </div>
                
                <h3 className="text-2xl font-bold mb-4">Hello, I'm Arjuna</h3>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    I've spent years understanding how people learn—and more importantly, how they get distracted. 
                    I've seen firsthand how even a small friction, like looking up a word, breaks focus and hurts deep learning. 
                    That's the pain point I'm solving with Tapit.
                  </p>

                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-md">
                    <div className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="italic text-indigo-800">
                        "Tapit is an AI-powered tool that gives you the contextual meaning of any word instantly—just double-tap, 
                        no app-switching, no copy-pasting."
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600">
                    Behind the scenes, it's not just a dictionary. We're building an intelligent layer on top of search, 
                    using transformer-based models like GPT to go beyond keywords and give exact, contextual answers.
                  </p>

                  <p className="text-gray-600">
                    With the right execution, this could revolutionize how we access information online. 
                    I'm raising funds to develop this product and bring it to market. 
                    Join me in building the future of information access.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 flex flex-col justify-center items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 shadow-lg">
                  <img 
                    src="/lovable-uploads/41c1f0e8-c2cb-435d-972c-9586c2bab4fb.png" 
                    alt="Arjuna - Founder of Tapit" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Arjuna</h4>
                <p className="text-sm text-gray-600 mb-4">Founder & CEO</p>
                <div className="mt-4 text-sm">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="font-medium">Email:</span>
                    <a href="mailto:Grohmsldrk@gmail.com" className="text-indigo-600 hover:underline">Grohmsldrk@gmail.com</a>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-medium">Phone:</span>
                    <a href="tel:+918102286324" className="text-indigo-600 hover:underline">+91 8102286324</a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AboutFounder;
