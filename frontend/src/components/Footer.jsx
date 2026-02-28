import { Link } from "react-router-dom";
import { T } from "@/context/LanguageContext";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Solutions",
      links: [
        { label: "Personalized Solutions", href: "/solutions-personalized" },
        { label: "Goal Based Solutions", href: "/solutions-goal-based" },
      ]
    },
    {
      title: "Learn More",
      links: [
        { label: "How Chit Works", href: "/chit-process" },
        { label: "Benefits of Chits", href: "/benefits-of-chits" },
        { label: "Security Norms", href: "/security-norms" },
        { label: "Eligibility Criteria", href: "/eligibility-criteria" },
        { label: "Documents Required", href: "/documents-required" },
      ]
    },
    {
      title: "Quick Links",
      links: [
        { label: "Browse Groups", href: "/chit-groups" },
        { label: "KYC Verification", href: "/kyc" },
        { label: "My Dashboard", href: "/dashboard" },
        { label: "Government Schemes", href: "/gov-schemes" },
        { label: "Become Organizer", href: "/apply-organizer" },
      ]
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 xl:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img src="/NiveshNidhi Logo.png" alt="Nivesh Nidhi" className="h-12 object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              <T>Making chit funds safer, transparent, and accessible for everyone with AI and blockchain technology.</T>
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@niveshnidhi.com" className="hover:text-primary transition-colors">
                  support@niveshnidhi.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href="tel:+911800123456" className="hover:text-primary transition-colors">
                  1800-123-456
                </a>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="">
              <h3 className="font-heading font-semibold text-foreground mb-4">
                <T>{section.title}</T>
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                    >
                      <T>{link.label}</T>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/1280px-Digital_India_logo.svg.png" 
                alt="Digital India" 
                className="h-8" 
              />
              <div className="text-xs text-muted-foreground">
                <T>© 2026 Nivesh Nidhi. All rights reserved.</T>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span><T>Made with ❤️ by Team Async</T></span>
              <span>•</span>
              <span><T>Powered by AI & Blockchain</T></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
