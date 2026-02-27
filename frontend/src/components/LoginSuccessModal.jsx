import { CheckCircle } from "lucide-react";
import { T } from "@/context/LanguageContext";

const LoginSuccessModal = ({ show, onClose, userName }) => {
  if (!show) return null;

  // Auto close after 2 seconds
  setTimeout(() => {
    onClose();
  }, 2000);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-6 mx-4 animate-fade-in pointer-events-auto border-2 border-emerald-200">
        <div className="flex items-center gap-4">
          {/* Success Icon */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>

          {/* Message */}
          <div>
            <h3 className="font-bold text-lg text-foreground">
              <T>Welcome Back!</T>
            </h3>
            <p className="text-sm text-muted-foreground">
              <T>Successfully signed in as</T>{" "}<span className="font-semibold text-foreground">{userName}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccessModal;
