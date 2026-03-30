
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12">
      <Separator className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Tapit</h3>
          <p className="text-sm text-gray-500">
            Creating the future of information access.
            Breaking down barriers between curiosity and knowledge.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4 text-gray-900">Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="text-gray-500 hover:text-gray-900">Features</a></li>
            <li><a href="#business-model" className="text-gray-500 hover:text-gray-900">Business Model</a></li>
            <li><a href="#invest" className="text-gray-500 hover:text-gray-900">Invest</a></li>
            <li><a href="#about" className="text-gray-500 hover:text-gray-900">About</a></li>
            <li><a href="https://instant-meaning-flow.vercel.app/" className="text-gray-500 hover:text-gray-900" target="_blank" rel="noopener noreferrer">Demo</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4 text-gray-900">Contact</h4>
          <p className="text-sm text-gray-500 mb-2">
            Have questions? Want to invest?
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Phone className="h-4 w-4" />
            <span>+918102286324</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Mail className="h-4 w-4" />
            <span>Grohmsldrk@gmail.com</span>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 mt-12">
        © {new Date().getFullYear()} Tapit. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
