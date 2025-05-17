import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Twitter, CheckCircle, Clock, Image as ImageIconLucide } from 'lucide-react';

const platformConfig = {
  Facebook: { icon: <Facebook size={14} />, colorClass: 'facebook' },
  Instagram: { icon: <Instagram size={14} />, colorClass: 'instagram' },
  LinkedIn: { icon: <Linkedin size={14} />, colorClass: 'linkedin' },
  Twitter: { icon: <Twitter size={14} />, colorClass: 'twitter' },
};

const CustomEvent = ({ event }) => {
  const config = platformConfig[event.platform] || { icon: null, colorClass: 'bg-gray-500 text-white' };
  const statusIcon = event.status === 'Published' ? <CheckCircle size={14} className="text-green-300" /> : <Clock size={14} className="text-yellow-300" />;
  const mediaIcon = event.media ? <ImageIconLucide size={14} className="text-gray-300" /> : null;

  return (
    <motion.div 
      className={`rbc-event ${config.colorClass} flex items-center text-xs p-1 rounded overflow-hidden h-full`}
      title={event.title}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center space-x-1 mr-1 shrink-0">
        {config.icon}
        {statusIcon}
        {mediaIcon}
      </div>
      <span className="rbc-event-label truncate flex-grow">{event.title}</span>
    </motion.div>
  );
};

export default CustomEvent;