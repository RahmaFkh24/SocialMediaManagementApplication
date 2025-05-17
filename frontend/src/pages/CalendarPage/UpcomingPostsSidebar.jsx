import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { format, addDays, isAfter, isSameDay, startOfDay } from 'date-fns';
import { platformOptions } from '@/pages/CalendarPage/calendarConfig';
import { ScrollArea } from '@/components/ui/scroll-area';

const UpcomingPostsSidebar = ({ posts, selectedDate, onSelectEvent }) => {
  const startDate = selectedDate ? startOfDay(selectedDate) : startOfDay(new Date());
  const endDate = addDays(startDate, 7);

  const upcomingPosts = posts
    .filter(post => {
      const postDate = startOfDay(post.start);
      return (isAfter(postDate, startDate) || isSameDay(postDate, startDate)) && !isAfter(postDate, endDate);
    })
    .sort((a, b) => a.start - b.start);

  return (
    <Card className="shadow-md border-border/30 bg-card">
      <CardHeader className="pb-3 pt-4 px-4 md:px-5">
        <CardTitle className="text-base md:text-lg">Upcoming Posts</CardTitle>
        <CardDescription className="text-xs md:text-sm">Next 7 days from {format(startDate, 'MMM d')}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 md:px-3 pb-3 md:pb-4 pt-0">
        {upcomingPosts.length > 0 ? (
          <ScrollArea className="h-[200px] sm:h-[250px] md:h-[300px] pr-2 md:pr-3">
            <div className="space-y-2 p-2">
              {upcomingPosts.map((post, index) => {
                const platform = platformOptions.find(p => p.id === post.platform);
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="p-2.5 border border-border/20 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-1.5">
                        {platform && React.cloneElement(platform.icon, { className: `${platform.icon.props.className} h-3.5 w-3.5`})}
                        <span className="text-xs font-medium text-foreground">{platform?.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{format(post.start, 'MMM d, p')}</span>
                    </div>
                    <p className="text-sm font-semibold truncate mb-1" title={post.title}>{post.title}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto text-primary text-xs" onClick={() => onSelectEvent(post)}>
                      View Details
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-xs md:text-sm text-muted-foreground py-4 text-center">No posts scheduled in the next 7 days.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingPostsSidebar;