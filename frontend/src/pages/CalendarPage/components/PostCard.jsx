import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, BarChart2, GripVertical } from 'lucide-react';
import { platformOptions } from '@/pages/CalendarPage/calendarConfig';

const PostCard = ({ event, onEdit, onDelete, onViewAnalytics, onSelectEvent }) => {
  const platform = platformOptions.find(p => p.id === event.platform);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-border/20 p-2.5 md:p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onSelectEvent(event)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 overflow-hidden pr-2">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1">
            {platform && React.cloneElement(platform.icon, { className: `${platform.icon.props.className} h-3.5 w-3.5`})}
            <span className="text-xs text-muted-foreground">{platform?.name} - {format(event.start, "p")}</span>
          </div>
          <p className="font-medium text-sm text-card-foreground leading-snug truncate" title={event.title}>{event.title}</p>
          {event.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate" title={event.notes}>{event.notes}</p>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 group-hover:opacity-100 flex-shrink-0">
              <GripVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border/30">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/30"/>
            <DropdownMenuCheckboxItem onClick={(e) => { e.stopPropagation(); onEdit(event);}} className="focus:bg-muted/50">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem onClick={(e) => { e.stopPropagation(); onViewAnalytics(event);}} className="focus:bg-muted/50">
              <BarChart2 className="mr-2 h-4 w-4" /> View Analytics
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="bg-border/30"/>
            <DropdownMenuCheckboxItem onClick={(e) => { e.stopPropagation(); onDelete(event.id);}} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default PostCard;