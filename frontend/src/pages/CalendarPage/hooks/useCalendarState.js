import React from 'react';
import { Views } from 'react-big-calendar';

export const useCalendarState = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [currentView, setCurrentView] = React.useState(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
  const [eventToDelete, setEventToDelete] = React.useState(null);
  const [isDragConfirmOpen, setIsDragConfirmOpen] = React.useState(false);
  const [draggedEventInfo, setDraggedEventInfo] = React.useState(null);


  return {
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
  };
};
