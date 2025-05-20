
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // Import useLocation
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation(); // Get location object

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64"> {/* Add ml-64 to offset fixed sidebar */}
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            {/* Use location.pathname as the key */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default Layout;
