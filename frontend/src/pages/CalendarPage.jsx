import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar as BigCalendar, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

  const [events, setEvents] = React.useState([]);
  const [filteredEvents, setFilteredEvents] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPlatforms, setSelectedPlatforms] = React.useState({
    Facebook: true,
    Instagram: true,
    Twitter: true,
    LinkedIn: true,
  });

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

  // Helper: group events by day (YYYY-MM-DD)
  const groupEventsByDay = (eventsArray) => {
    return eventsArray.reduce((acc, event) => {
      const dayKey = event.start.toISOString().split('T')[0];
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(event);
      return acc;
    }, {});
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/posts');
        const json = await response.json();

        console.log('API response data:', json);

        if (!json.success || !Array.isArray(json.data)) {
          throw new Error('Invalid API response structure');
        }

        const formattedEvents = json.data.map(post => ({
          ...post,
          start: new Date(post.start),
          end: new Date(post.end),
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load calendar posts.',
          variant: 'destructive',
        });
      }
    };

    fetchEvents();
  }, [toast]);

  // Filter events by platform and search term
  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        selectedPlatforms[event.platform] &&
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedPlatforms]);

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platformId]: !prev[platformId],
    }));
  };

  const handleDeleteEvent = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setEventToDelete(event);
      setIsConfirmDeleteOpen(true);
      setIsModalOpen(false);
    }
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      const updated = events.filter((e) => e.id !== eventToDelete.id);
      setEvents(updated);
      toast({
        title: 'Post Deleted',
        description: `${eventToDelete.title}`,
        variant: 'destructive',
      });
      setSelectedEvent(null);
      setIsConfirmDeleteOpen(false);
      setEventToDelete(null);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView) => {
    setCurrentView(newView);
  };

  const onEventDrop = ({ event, start, end, isAllDay }) => {
    setDraggedEventInfo({ event, start, end, isAllDay });
    setIsDragConfirmOpen(true);
  };

  const confirmEventDrop = () => {
    if (draggedEventInfo) {
      const { event, start, end } = draggedEventInfo;
      const updated = events.map((e) =>
        e.id === event.id ? { ...e, start, end } : e
      );
      setEvents(updated);
      toast({
        title: 'Post Rescheduled',
        description: `${event.title}`,
      });
    }
    setIsDragConfirmOpen(false);
    setDraggedEventInfo(null);
  };

  const eventPropGetter = (event) => {
    const platformClass = {
      Facebook: 'facebook',
      Instagram: 'instagram',
      LinkedIn: 'linkedin',
      Twitter: 'twitter',
    }[event.platform] || 'default-platform';

    return { className: platformClass };
  };

  const calendarHeight = currentView === Views.AGENDA ? '700px' : '500px';

  const eventsGroupedByDay = groupEventsByDay(filteredEvents);

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full p-3 sm:p-4 md:p-3 bg-background">
      {/* Main Calendar Section */}
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
          <CardContent className="p-1 sm:p-2 md:p-3" style={{ height: calendarHeight }}>
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
                toolbar: (props) => (
                  <CalendarToolbar
                    {...props}
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

      {/* Sidebar Section */}
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

      {/* Event Modal */}
      <EventDetailsModal
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedEvent(null);
        }}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        onConfirm={confirmDelete}
        eventTitle={eventToDelete?.title}
      />

      {/* Confirm Drag Drop Dialog */}
      <Dialog open={isDragConfirmOpen} onOpenChange={setIsDragConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm reschedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to reschedule the post{' '}
              <strong>{draggedEventInfo?.event.title}</strong> to{' '}
              {draggedEventInfo?.start.toLocaleString()}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDragConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEventDrop}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
