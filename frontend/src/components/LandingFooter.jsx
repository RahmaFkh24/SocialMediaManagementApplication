
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Facebook, Instagram, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-background border-t border-border/50 py-8 mt-auto"
    >
      <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Das Haus</span>
          </div>
          <p className="text-sm">
            &copy; {currentYear} Das Haus. All rights reserved.
          </p>
          <div className="flex items-center justify-center md:justify-end space-x-4">
            <Link to="/privacy-policy" className="text-sm hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-sm hover:text-primary transition-colors">Terms of Service</Link>
            {/* Example Social Links */}
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-primary transition-colors"><Facebook size={18} /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors"><Instagram size={18} /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-primary transition-colors"><Twitter size={18} /></a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default LandingFooter;
