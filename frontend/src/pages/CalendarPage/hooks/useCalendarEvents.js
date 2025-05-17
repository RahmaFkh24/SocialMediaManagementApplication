import React, { useState, useEffect, useCallback } from 'react';
import { initialEvents, platformOptions } from '@/pages/CalendarPage/calendarConfig';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    platformOptions.reduce((acc, p) => ({ ...acc, [p.id]: true }), {})
  );

  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    let loadedEvents = initialEvents;
    if (storedEvents) {
      try {
        loadedEvents = JSON.parse(storedEvents).map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
      } catch (error) {
        console.error("Failed to parse events from localStorage", error);
        localStorage.removeItem('calendarEvents');
      }
    }
    setEvents(loadedEvents);
    if (!storedEvents) {
        localStorage.setItem('calendarEvents', JSON.stringify(initialEvents));
    }
  }, []);

  useEffect(() => {
    let newFilteredEvents = events.filter(event => selectedPlatforms[event.platform]);
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      newFilteredEvents = newFilteredEvents.filter(event =>
        event.title.toLowerCase().includes(lowerSearchTerm) ||
        (event.notes && event.notes.toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredEvents(newFilteredEvents);
  }, [events, selectedPlatforms, searchTerm]);

  const updateEvents = useCallback((newEvents) => {
    setEvents(newEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
  }, []);

  return {
    events,
    setEvents: updateEvents, 
    filteredEvents,
    searchTerm,
    setSearchTerm,
    selectedPlatforms,
    setSelectedPlatforms,
  };
};