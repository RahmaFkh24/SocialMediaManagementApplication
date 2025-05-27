
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarClock, Zap, BarChart2, Link2, Settings, LogOut, FileText, CalendarDays, Image as ImageIcon, ShieldCheck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Inbox', icon: MessageSquare, path: '/inbox' },
  { name: 'Calendar', icon: CalendarDays, path: '/calendar' },
  { name: 'Scheduler', icon: CalendarClock, path: '/scheduler' },
  { name: 'All Posts', icon: FileText, path: '/posts' },
  { name: 'Media', icon: ImageIcon, path: '/media' },
  { name: 'Analytics', icon: BarChart2, path: '/analytics' },
  { name: 'Accounts', icon: Link2, path: '/accounts' },
];

const adminNavItems = [
  { name: 'Admin Panel', icon: ShieldCheck, path: '/admin' },
];

const bottomNavItems = [
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('isNewUser');
    navigate('/login');
  };

  const linkVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    hover: { scale: 1.05, color: 'hsl(var(--primary))' },
    tap: { scale: 0.95 }
  };

  const allNavItems = currentUser?.role === 'admin' ? [...navItems, ...adminNavItems] : navItems;

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 50, damping: 15 }}
      className="w-64 bg-card h-screen p-5 flex flex-col fixed left-0 top-0 border-r z-50"
    >
      <div className="mb-10 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="p-3 bg-primary/10 rounded-full shadow-lg"

        >
          <Zap className="h-10 w-10 text-primary" />

        </motion.div>

        <h1 className="text-2xl font-bold ml-3 text-primary">Das Haus</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {allNavItems.map((item, index) => (
            <motion.li key={item.name}
              variants={linkVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: 0.1 * index + 0.3 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 my-1 rounded-md transition-colors text-muted-foreground hover:text-primary hover:bg-primary/10 ${isActive ? 'bg-primary/10 text-primary font-semibold' : ''
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <ul>
          {bottomNavItems.map((item, index) => (
            <motion.li key={item.name}
              variants={linkVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: 0.1 * (allNavItems.length + index) + 0.3 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 my-1 rounded-md transition-colors text-muted-foreground hover:text-primary hover:bg-primary/10 ${isActive ? 'bg-primary/10 text-primary font-semibold' : ''
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            </motion.li>
          ))}
        </ul>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * (allNavItems.length + bottomNavItems.length) + 0.4 }}
        >
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive mt-2" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
