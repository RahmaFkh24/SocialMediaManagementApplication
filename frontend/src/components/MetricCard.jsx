
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, change, delay }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: delay * 0.1
      }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card className="overflow-hidden relative group backdrop-blur-sm bg-card/80 hover:bg-card/95 transition-colors duration-300">
        {/* Optional: Add subtle background pattern or gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />}
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold group-hover:text-primary transition-colors">{value}</div>
          {change && (
            <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {change} from last week
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetricCard;
