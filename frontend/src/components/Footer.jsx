

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
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">About</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Govt. Schemes</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
          </div>

          {/* Digital India Logo */}
          <div className="flex items-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/1280px-Digital_India_logo.svg.png" alt="Digital India" className="h-8" />
            <div className="text-xs text-muted-foreground">
              © 2026 Nivesh Nidhi. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
