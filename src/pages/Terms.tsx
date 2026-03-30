import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
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
        <h1 className="text-4xl font-display font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using TapIt ("the Service"), you accept and agree to be bound by the terms 
              and provisions of this agreement. If you do not agree to abide by these terms, please do not 
              use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              TapIt is an AI-powered document reading platform that provides features including but not 
              limited to: document parsing and viewing, AI-powered word definitions and translations, 
              text-to-speech functionality, annotation tools (highlights, notes, bookmarks), and document 
              organization capabilities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To access certain features of the Service, you may be required to create an account. You are 
              responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Ensuring that your account information is accurate and up-to-date</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain ownership of all documents and content you upload to TapIt. By uploading content, 
              you grant us a limited license to process your documents solely for the purpose of providing 
              the Service. We do not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Claim ownership of your uploaded content</li>
              <li>Share your documents with third parties without your consent</li>
              <li>Use your content for training AI models without explicit permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Upload content that infringes on intellectual property rights</li>
              <li>Distribute malware or malicious content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for any illegal purposes</li>
              <li>Abuse or overload our infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service, including its original content, features, and functionality, is owned by TapIt 
              and is protected by international copyright, trademark, and other intellectual property laws. 
              Our trademarks may not be used in connection with any product or service without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TapIt shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use or inability to use the Service. We provide the Service "as is" 
              without warranties of any kind, either express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material 
              changes by posting the new Terms of Service on this page and updating the "Last updated" date. 
              Your continued use of the Service after such modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:support@tapit.app" className="text-primary hover:underline">
                support@tapit.app
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
          <p>© 2025 TapIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
