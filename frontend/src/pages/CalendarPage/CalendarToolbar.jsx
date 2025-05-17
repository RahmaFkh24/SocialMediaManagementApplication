import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarPlus as CalendarToday, View as ViewDay, View as ViewWeek, View as ViewModule } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CalendarToolbar = (props) => {
  const { label, onNavigate, onView, view, views } = props;

  const navigate = (action) => {
    onNavigate(action);
  };

  const viewNamesGroup = [
    { view: 'month', label: 'Month', Icon: ViewModule },
    { view: 'week', label: 'Week', Icon: ViewWeek },
    { view: 'day', label: 'Day', Icon: ViewDay },
    { view: 'agenda', label: 'Agenda', Icon: CalendarToday },
  ];

  return (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group">
        <Button variant="outline" size="sm" onClick={() => navigate('PREV')} aria-label="Previous Period">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('TODAY')} aria-label="Today">
          <CalendarToday className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Today</span>
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('NEXT')} aria-label="Next Period">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <span className="rbc-toolbar-label">{label}</span>

      <div className="rbc-btn-group hidden sm:flex">
        {viewNamesGroup.map(item => (
          <Button
            key={item.view}
            variant={view === item.view ? 'default' : 'outline'}
            size="sm"
            onClick={() => onView(item.view)}
            aria-label={`View ${item.label}`}
            className={view === item.view ? 'bg-primary text-primary-foreground' : ''}
          >
            <item.Icon className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">{item.label}</span>
          </Button>
        ))}
      </div>
      <div className="sm:hidden">
        <Select value={view} onValueChange={(newView) => onView(newView)}>
          <SelectTrigger className="w-[120px] h-9" aria-label="Select View">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            {viewNamesGroup.map(item => (
              <SelectItem key={item.view} value={item.view}>
                <div className="flex items-center">
                  <item.Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CalendarToolbar;
