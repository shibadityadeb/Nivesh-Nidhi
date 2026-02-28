import { useState } from "react";
import { FileText, AlertCircle } from "lucide-react";
import { T } from "@/context/LanguageContext";

const TermsModal = ({ show, onAccept }) => {
  const [agreed, setAgreed] = useState(false);

  if (!show) return null;

  const handleAccept = () => {
    if (agreed) {
      localStorage.setItem("termsAccepted", "true");
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden animate-fade-in max-h-[90vh] flex flex-col border border-border">
        {/* Tricolor Header */}
        <div className="h-1 gradient-tricolor" />
        
        <div className="p-8 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground">
                <T>Terms & Conditions</T>
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              <T>Please review and accept our terms to continue</T>
            </p>
          </div>

          {/* Terms Content */}
          <div className="bg-muted/30 rounded-xl p-6 mb-6 max-h-64 overflow-y-auto border border-border">
            <div className="space-y-4 text-sm text-foreground">
              <div>
                <h3 className="font-bold text-base mb-2"><T>1. Acceptance of Terms</T></h3>
                <p className="text-muted-foreground">
                  <T>By accessing and using Nivesh Nidhi platform, you accept and agree to be bound by the terms and provision of this agreement.</T>
                </p>
              </div>
              
              <div>
                <h3 className="font-bold text-base mb-2"><T>2. Use of Platform</T></h3>
                <p className="text-muted-foreground">
                  <T>You agree to use the platform only for lawful purposes and in accordance with these Terms. You must not use the platform in any way that violates any applicable laws or regulations.</T>
                </p>
              </div>
              
              <div>
                <h3 className="font-bold text-base mb-2"><T>3. Chit Fund Participation</T></h3>
                <p className="text-muted-foreground">
                  <T>Participation in chit funds is subject to the rules and regulations set by the organizer and applicable laws. You acknowledge the risks involved in chit fund investments.</T>
                </p>
              </div>
              
              <div>
                <h3 className="font-bold text-base mb-2"><T>4. Privacy & Data Protection</T></h3>
                <p className="text-muted-foreground">
                  <T>We are committed to protecting your privacy. Your personal information will be handled in accordance with our Privacy Policy and applicable data protection laws.</T>
                </p>
              </div>
              
              <div>
                <h3 className="font-bold text-base mb-2"><T>5. Liability</T></h3>
                <p className="text-muted-foreground">
                  <T>Nivesh Nidhi acts as a platform facilitator. We are not responsible for any losses incurred through participation in chit funds. Users participate at their own risk.</T>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base mb-2"><T>6. Modifications</T></h3>
                <p className="text-muted-foreground">
                  <T>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.</T>
                </p>
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="mb-6">
            <label className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/30 cursor-pointer transition-all bg-card">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/30 cursor-pointer mt-0.5"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  <T>I agree to the Terms & Conditions</T>
                </p>
              </div>
            </label>
          </div>

          {/* Info Alert */}
          {!agreed && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                <T>Please accept the terms and conditions to continue.</T>
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleAccept}
            disabled={!agreed}
            className={`w-full py-3 rounded-xl font-semibold text-sm shadow-md transition-all ${
              agreed
                ? "gradient-navy text-primary-foreground hover:shadow-lg"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <T>Accept & Continue</T>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
