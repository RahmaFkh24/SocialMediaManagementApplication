import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const StatusSummarySidebar = ({ events }) => {
  const scheduledCount = events.filter(e => e.status === 'Scheduled').length;
  const publishedCount = events.filter(e => e.status === 'Published').length;
  const failedCount = events.filter(e => e.status === 'Failed').length;

  const statusItems = [
    { title: 'Scheduled', count: scheduledCount, Icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'Published', count: publishedCount, Icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: 'Failed', count: failedCount, Icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  ];

  return (
    <Card className="shadow-md border-border/30 bg-card">
      <CardHeader className="pb-3 pt-4 px-4 md:px-5">
        <CardTitle className="text-base md:text-lg">Post Status Summary</CardTitle>
        <CardDescription className="text-xs md:text-sm">Overview of all posts</CardDescription>
      </CardHeader>
      <CardContent className="px-4 md:px-5 pb-4">
        <ul className="space-y-2.5">
          {statusItems.map((item, index) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.07 }}
              className={`flex items-center justify-between p-2.5 rounded-md ${item.bgColor}`}
            >
              <div className="flex items-center">
                <item.Icon className={`h-4 w-4 mr-2 ${item.color}`} />
                <span className={`text-sm font-medium ${item.color}`}>{item.title}</span>
              </div>
              <span className={`text-sm font-semibold ${item.color}`}>{item.count}</span>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default StatusSummarySidebar;