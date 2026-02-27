import { CheckCircle } from "lucide-react";
import { T } from "@/context/LanguageContext";

const SuccessModal = ({ show, onClose, userName }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-fade-in border border-border">
        {/* Tricolor Header */}
        <div className="h-1 gradient-tricolor" />
        
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600" strokeWidth={2} />
            </div>
          </div>

          {/* Success Message */}
          <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
            <T>Registration Successful</T>
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            <T>Welcome,</T>{" "}<span className="font-semibold text-foreground">{userName}</span><T>! Your account has been created.</T>
          </p>

          {/* Continue Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl gradient-navy text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <T>Continue</T>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
