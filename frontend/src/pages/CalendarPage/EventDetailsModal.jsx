import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BarChart2, Edit3, Trash2 } from 'lucide-react';
import format from 'date-fns/format';
import { platformOptions } from './calendarConfig';

const EventDetailsModal = ({ isOpen, onOpenChange, event, onEdit, onDelete, onViewAnalytics }) => {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-card via-background to-card/90">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            {platformOptions.find(p => p.id === event.platform)?.icon} 
            <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">Post Details</span>
          </DialogTitle>
          <DialogDescription>
            {event.platform} post - {event.status}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <h4 className="font-semibold mb-1 text-foreground">Content:</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{event.title}</p>
          </div>
          {event.media && (
            <div>
              <h4 className="font-semibold mb-1 text-foreground">Media Preview:</h4>
              <img-replace src={event.media} alt="Post media" className="rounded-lg max-h-48 w-auto object-cover shadow-md" />
            </div>
          )}
          <div>
            <h4 className="font-semibold mb-1 text-foreground">Scheduled Time:</h4>
            <p className="text-sm text-muted-foreground">{format(event.start, 'PPP p')}</p>
          </div>
          {event.notes && (
             <div>
              <h4 className="font-semibold mb-1 text-foreground">Notes:</h4>
              <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">{event.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onViewAnalytics}>
            <BarChart2 className="mr-2 h-4 w-4" /> View Analytics
          </Button>
          <Button variant="outline" onClick={() => onEdit(event)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => onDelete(event.id)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;