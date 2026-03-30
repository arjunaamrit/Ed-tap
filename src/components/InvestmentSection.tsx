import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Info, Coins } from "lucide-react";

const InvestmentSection = () => {
  return (
    <section id="invest" className="py-16 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl p-8 my-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Investment Opportunity
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join us in building the future of information access. We're raising funds to develop the product and launch.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-8 max-w-2xl mx-auto">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> Investment operates on a first-come-first-serve basis. Once our funding target of $100,000 is reached, any excess funds will be returned based on the timestamp of the transaction. Early investors get priority.
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-8 max-w-2xl mx-auto">
        <div className="flex items-start">
          <Coins className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800">
            <strong>Flexible Investment:</strong> You can start with as little as $100. You'll receive equity proportional to your investment amount. For example, a $5,000 investment gives you 5% equity, while $100,000 gives you 100% equity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Angel Investment</h3>
              <div className="text-4xl font-bold mb-2">$1,000</div>
              <p className="text-gray-500">For 1% equity</p>
              <p className="text-xs text-gray-400 mt-1">(Minimum $100 for 0.1% equity)</p>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700">Early investor status</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700">Quarterly updates on progress</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700">Access to beta features</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" asChild>
                <a href="mailto:Grohmsldrk@gmail.com?subject=Tapit%20Angel%20Investment%20Inquiry">
                  Contact for Investment
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            RECOMMENDED
          </div>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Strategic Partner</h3>
              <div className="text-4xl font-bold mb-2">$10,000</div>
              <p className="text-gray-500">For 10% equity</p>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700">Strategic advisory role</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700">Monthly progress meetings</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700">Early access to all features</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700">Input on product roadmap</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" asChild>
                <a href="mailto:Grohmsldrk@gmail.com?subject=Tapit%20Strategic%20Partnership%20Inquiry">
                  Contact for Partnership
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default InvestmentSection;
