import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4">LN Services</h3>
            <p className="text-sm text-muted-foreground">
              Professional service management platform for businesses of all sizes.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-smooth inline-block min-h-touch-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-smooth inline-block min-h-touch-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-smooth inline-block min-h-touch-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="text-center sm:text-left sm:col-span-2 md:col-span-1">
            <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Connect With Us</h3>
            <div className="flex justify-center sm:justify-start space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-smooth p-2 min-h-touch min-w-touch flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-smooth p-2 min-h-touch min-w-touch flex items-center justify-center"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-smooth p-2 min-h-touch min-w-touch flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@LN Services.com"
                className="text-muted-foreground hover:text-primary transition-smooth p-2 min-h-touch min-w-touch flex items-center justify-center"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} LN Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

