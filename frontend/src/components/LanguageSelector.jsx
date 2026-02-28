import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const LanguageSelector = () => {
  const { language, changeLanguage, SUPPORTED_LANGUAGES } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
        title="Change Language"
      >
        <Globe className="w-4 h-4 text-primary" />
        <span>{currentLang.nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border p-1.5 z-[60] animate-slide-down max-h-80 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                language === lang.code
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-card-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <span className="flex-1 text-left">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
              {language === lang.code && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
