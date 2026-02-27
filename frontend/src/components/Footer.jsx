
import { T } from "@/context/LanguageContext";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="/">
            <img src="/NiveshNidhi Logo.png" alt="Nivesh Nidhi" className="h-12 object-contain" />
          </a>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><T>About</T></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><T>How It Works</T></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><T>Govt. Schemes</T></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><T>Contact</T></a>
          </div>

          {/* Digital India Logo */}
          <div className="flex items-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/1280px-Digital_India_logo.svg.png" alt="Digital India" className="h-8" />
            <div className="text-xs text-muted-foreground">
              <T>© 2026 Nivesh Nidhi. All rights reserved.</T>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
