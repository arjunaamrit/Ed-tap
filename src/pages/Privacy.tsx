import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/reader" className="flex items-center gap-3 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="text-2xl font-display font-black uppercase tracking-tighter">TapIt</span>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/reader" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to App
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-display font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              TapIt ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              AI-powered document reading service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Account Information:</strong> Email address and password when you create an account</li>
              <li><strong>Documents:</strong> Files you upload for reading and annotation</li>
              <li><strong>User Content:</strong> Highlights, notes, bookmarks, and other annotations you create</li>
              <li><strong>Communications:</strong> Information you provide when contacting support</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Usage Data:</strong> How you interact with our Service (features used, time spent)</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li><strong>Log Data:</strong> IP address, access times, pages viewed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process your documents and provide AI-powered features</li>
              <li>Store and sync your annotations across devices</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Protect against fraudulent or unauthorized activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. AI Processing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our AI features (definitions, translations, document chat) process your content as follows:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Document content is sent to AI services only when you explicitly request AI features</li>
              <li>We use third-party AI providers (Google, OpenAI) to power our AI capabilities</li>
              <li>Your document content is not used to train AI models without your explicit consent</li>
              <li>AI processing is done in real-time and content is not stored beyond the session</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We may share information with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Service Providers:</strong> Third parties that help us operate our Service (hosting, AI processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your information, 
              including encryption in transit and at rest, secure authentication, and regular security 
              assessments. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide 
              you services. You can delete your account and associated data at any time. Some information 
              may be retained for legal compliance or legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Opt-out:</strong> Opt out of certain data processing activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to maintain your session and remember your preferences. We may also 
              use analytics cookies to understand how users interact with our Service. You can control 
              cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If we learn we have collected such information, 
              we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. International Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for such transfers in compliance with 
              applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@tapit.app" className="text-primary hover:underline">
                privacy@tapit.app
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          </div>
          <p>© {new Date().getFullYear()} TapIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
