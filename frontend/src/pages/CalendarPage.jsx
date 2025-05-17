import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar as BigCalendar, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { useCalendarEvents } from '@/pages/CalendarPage/hooks/useCalendarEvents';
import { useCalendarState } from '@/pages/CalendarPage/hooks/useCalendarState';
import { localizer, calendarMessages, calendarFormats } from '@/pages/CalendarPage/calendarUtils';
import CustomEvent from '@/pages/CalendarPage/CustomEvent';
import CalendarToolbar from '@/pages/CalendarPage/CalendarToolbar';
import CalendarHeader from '@/pages/CalendarPage/components/CalendarHeader';
import UpcomingPostsSidebar from '@/pages/CalendarPage/UpcomingPostsSidebar';
import StatusSummarySidebar from '@/pages/CalendarPage/StatusSummarySidebar';
import EventDetailsModal from '@/pages/CalendarPage/EventDetailsModal';
import ConfirmDeleteDialog from '@/pages/CalendarPage/ConfirmDeleteDialog';

const DnDCalendar = withDragAndDrop(BigCalendar);

const CalendarPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    events,
    setEvents,
    filteredEvents,
    searchTerm,
    setSearchTerm,
    selectedPlatforms,
    setSelectedPlatforms,
  } = useCalendarEvents();

  const {
    currentDate,
    setCurrentDate,
    currentView,
    setCurrentView,
    selectedEvent,
    setSelectedEvent,
    isModalOpen,
    setIsModalOpen,
    isConfirmDeleteOpen,
    setIsConfirmDeleteOpen,
    eventToDelete,
    setEventToDelete,
    isDragConfirmOpen,
    setIsDragConfirmOpen,
    draggedEventInfo,
    setDraggedEventInfo,
  } = useCalendarState();

  const handlePlatformToggle = React.useCallback((platformId) => {
    setSelectedPlatforms(prev => ({ ...prev, [platformId]: !prev[platformId] }));
  }, [setSelectedPlatforms]);

  const handleDeleteEvent = React.useCallback((eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setEventToDelete(event);
      setIsConfirmDeleteOpen(true);
      setIsModalOpen(false);
    }
  }, [events, setIsConfirmDeleteOpen, setEventToDelete, setIsModalOpen]);

  const confirmDelete = React.useCallback(() => {
    if (eventToDelete) {
      const updatedEvents = events.filter(e => e.id !== eventToDelete.id);
      setEvents(updatedEvents);
      toast({
        title: 'Post Deleted',
        description: "${eventToDelete.title}",
        variant: 'destructive',
      });
      setSelectedEvent(null);
      setIsConfirmDeleteOpen(false);
      setEventToDelete(null);
    }
  }, [eventToDelete, events, setEvents, toast, setSelectedEvent, setIsConfirmDeleteOpen, setEventToDelete]);

  const handleSelectEvent = React.useCallback((event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, [setSelectedEvent, setIsModalOpen]);

  const handleNavigate = React.useCallback((newDate) => {
    setCurrentDate(newDate);
  }, [setCurrentDate]);

  const handleViewChange = React.useCallback((newView) => {
    setCurrentView(newView);
  }, [setCurrentView]);

  const onEventDrop = React.useCallback(({ event, start, end, isAllDay }) => {
    setDraggedEventInfo({ event, start, end, isAllDay });
    setIsDragConfirmOpen(true);
  }, [setDraggedEventInfo, setIsDragConfirmOpen]);

  const confirmEventDrop = React.useCallback(() => {
    if (draggedEventInfo) {
      const { event, start, end } = draggedEventInfo;
      const updatedEvents = events.map(existingEvent =>
        existingEvent.id === event.id ? { ...existingEvent, start, end } : existingEvent
      );
      setEvents(updatedEvents);
      toast({
        title: 'Post Rescheduled',
        description: "${event.title}",
      });
    }
    setIsDragConfirmOpen(false);
    setDraggedEventInfo(null);
  }, [draggedEventInfo, events, setEvents, toast, setIsDragConfirmOpen, setDraggedEventInfo]);

  const eventPropGetter = React.useCallback(
    (event) => {
      const platformConfig = {
        Facebook: 'facebook',
        Instagram: 'instagram',
        LinkedIn: 'linkedin',
        Twitter: 'twitter',
      };
      const platformClass = platformConfig[event.platform] || 'default-platform';
      return {
        className: platformClass,
      };
    },
    []
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full p-3 sm:p-4 md:p-3 bg-background">
      <motion.div
        className="flex-grow lg:order-1 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CalendarHeader
          onNewPost={() => navigate('/schedule')}
          selectedPlatforms={selectedPlatforms}
          onPlatformToggle={handlePlatformToggle}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
        />
        <Card className="shadow-md border-border/10 bg-card flex-grow rbc-calendar-container">
          <CardContent className="p-1 sm:p-2 md:p-3 h-full">
            <DnDCalendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              selectable
              resizable
              onSelectEvent={handleSelectEvent}
              onEventDrop={onEventDrop}
              onEventResize={onEventDrop}
              defaultView={Views.MONTH}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              view={currentView}
              date={currentDate}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              messages={calendarMessages}
              formats={calendarFormats}
              components={{
                event: CustomEvent,
                toolbar: (toolbarProps) => (
                  <CalendarToolbar
                    {...toolbarProps}
                    currentView={currentView}
                    onViewChange={handleViewChange}
                  />
                ),
              }}
              eventPropGetter={eventPropGetter}
              className="h-full"
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="lg:w-80 xl:w-96 flex-shrink-0 space-y-4 md:space-y-6 lg:order-2 w-full lg:max-w-xs xl:max-w-sm"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <UpcomingPostsSidebar
          posts={filteredEvents}
          selectedDate={currentDate}
          onSelectEvent={handleSelectEvent}
        />
        <StatusSummarySidebar events={events} />
      </motion.div>

      <EventDetailsModal
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={(event) => { navigate('/schedule', { state: { postToEdit: event } }); setIsModalOpen(false); }}
        onDelete={handleDeleteEvent}
        onViewAnalytics={() => toast({ title: "Analytics coming soon!" })}
      />

      <ConfirmDeleteDialog
        isOpen={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        eventToDelete={eventToDelete}
        onConfirmDelete={confirmDelete}
      />

      <Dialog open={isDragConfirmOpen} onOpenChange={setIsDragConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Reschedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to move "{draggedEventInfo?.event?.title}" to the new date/time?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDragConfirmOpen(false); setDraggedEventInfo(null); }}>Cancel</Button>
            <Button onClick={confirmEventDrop}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;