import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  CalendarPlus as CalendarToday,
  View as ViewModule,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CalendarToolbar = (props) => {
  const { label, onNavigate, onView, view } = props;

  const navigate = (action) => {
    onNavigate(action);
  };

  const viewNamesGroup = [
    { view: 'month', label: 'Month', Icon: ViewModule },
    { view: 'agenda', label: 'Agenda', Icon: CalendarToday },
  ];

  return (
    <div className="rbc-toolbar flex flex-wrap justify-between items-center gap-2">
      {/* Navigation buttons (bigger size) */}
      <div className="rbc-btn-group flex gap-2">
        <Button
          variant="outline"
          size="default"
          className="px-4 py-2 text-base"
          onClick={() => navigate('PREV')}
          aria-label="Previous Period"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="default"
          className="px-4 py-2 text-base flex items-center"
          onClick={() => navigate('TODAY')}
          aria-label="Today"
        >
          <CalendarToday className="h-5 w-5 mr-2" />
          <span>Today</span>
        </Button>

        <Button
          variant="outline"
          size="default"
          className="px-4 py-2 text-base"
          onClick={() => navigate('NEXT')}
          aria-label="Next Period"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Label */}
      <span className="rbc-toolbar-label font-semibold text-lg">{label}</span>

      {/* View buttons */}
      <div className="rbc-btn-group hidden sm:flex gap-2">
        {viewNamesGroup.map((item) => (
          <Button
            key={item.view}
            variant={view === item.view ? 'default' : 'outline'}
            size="sm"
            onClick={() => onView(item.view)}
            aria-label={`View ${item.label}`}
            className={`flex items-center ${view === item.view ? 'bg-primary text-primary-foreground' : ''
              }`}
          >
            <item.Icon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{item.label}</span>
          </Button>
        ))}
      </div>

      {/* Mobile dropdown */}
      <div className="sm:hidden">
        <Select value={view} onValueChange={(newView) => onView(newView)}>
          <SelectTrigger className="w-[140px] h-10 text-sm" aria-label="Select View">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            {viewNamesGroup.map((item) => (
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
