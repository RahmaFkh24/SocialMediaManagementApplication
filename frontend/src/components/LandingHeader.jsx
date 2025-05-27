
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingHeader = () => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 70, damping: 15, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm"
    >
      <div className="container mx-auto h-16 flex justify-between items-center px-4 md:px-6">
        <Link to="/" className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Das Haus</span>
        </Link>
        <nav className="flex items-center space-x-2 md:space-x-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Sign Up
            </Button>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
};

export default LandingHeader;
