
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, GraduationCap, Stethoscope, Wrench, Microscope, Scale, BookOpen } from "lucide-react";

const BusinessModel = () => {
  return (
    <section id="business-model" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Business Model</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Sustainable revenue streams designed to democratize information access
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Licensing Model */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-indigo-600" />
              <CardTitle className="text-xl">Enterprise Licensing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              License our AI technology to educational technology companies, enabling them to integrate 
              instant contextual search capabilities into their platforms.
            </p>
            <div className="space-y-2">
              <Badge variant="outline" className="mr-2">B2B Integration</Badge>
              <Badge variant="outline" className="mr-2">API Access</Badge>
              <Badge variant="outline">White-label Solutions</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Freemium Model */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <CardTitle className="text-xl">Freemium Model</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Free access for individual learners with premium features available for enhanced functionality, 
              unlimited searches, and advanced AI capabilities.
            </p>
            <div className="space-y-2">
              <Badge variant="outline" className="mr-2">Free Tier</Badge>
              <Badge variant="outline" className="mr-2">Premium Features</Badge>
              <Badge variant="outline">Subscription Plans</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Customer Segments */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-center mb-8">Target Customer Segments</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <GraduationCap className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Students</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <Stethoscope className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium">Doctors</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
            <Wrench className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium">Engineers</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
            <Microscope className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium">Scientists</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
            <Scale className="h-8 w-8 text-red-600 mb-2" />
            <span className="text-sm font-medium">Lawyers</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg">
            <BookOpen className="h-8 w-8 text-teal-600 mb-2" />
            <span className="text-sm font-medium">Teachers</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
            <Users className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium">Online Learners</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
            <GraduationCap className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="text-sm font-medium">Language Learners</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessModel;
