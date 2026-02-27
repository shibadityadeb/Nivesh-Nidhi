import { useState } from "react";
import { FileText, AlertCircle } from "lucide-react";

const TermsModal = ({ show, onAccept }) => {
  const [agreed, setAgreed] = useState(false);

  if (!show) return null;

  const handleAccept = () => {
    if (agreed) {
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
                Terms & Conditions
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Please review and accept our terms to continue
            </p>
          </div>

          {/* Terms Content */}
          <div className="bg-muted/30 rounded-xl p-6 mb-6 max-h-64 overflow-y-auto border border-border">
            <div className="space-y-4 text-sm text-foreground">
              <div>
                <h3 className="font-bold text-base mb-2">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                  By accessing and using Nivesh Nidhi platform, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold text-base mb-2">2. Use of Platform</h3>
                <p className="text-muted-foreground">
                  You agree to use the platform only for lawful purposes and in accordance with these Terms. You must not use the platform in any way that violates any applicable laws or regulations.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold text-base mb-2">3. Chit Fund Participation</h3>
                <p className="text-muted-foreground">
                  Participation in chit funds is subject to the rules and regulations set by the organizer and applicable laws. You acknowledge the risks involved in chit fund investments.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold text-base mb-2">4. Privacy & Data Protection</h3>
                <p className="text-muted-foreground">
                  We are committed to protecting your privacy. Your personal information will be handled in accordance with our Privacy Policy and applicable data protection laws.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold text-base mb-2">5. Liability</h3>
                <p className="text-muted-foreground">
                  Nivesh Nidhi acts as a platform facilitator. We are not responsible for any losses incurred through participation in chit funds. Users participate at their own risk.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base mb-2">6. Modifications</h3>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.
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
                  I agree to the Terms & Conditions
                </p>
              </div>
            </label>
          </div>

          {/* Info Alert */}
          {!agreed && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                Please accept the terms and conditions to continue.
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
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
