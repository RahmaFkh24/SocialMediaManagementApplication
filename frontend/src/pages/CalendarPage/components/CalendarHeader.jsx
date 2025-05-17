import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PlusCircle, Filter, Search, CalendarDays, ChevronDown } from 'lucide-react';
import { platformOptions } from '@/pages/CalendarPage/calendarConfig';

const CalendarHeader = ({ onNewPost, selectedPlatforms, onPlatformToggle, searchTerm, onSearchTermChange }) => (
  <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
    <div className="flex items-center space-x-2 md:space-x-3">
      <CalendarDays className="h-6 w-6 md:h-7 md:w-7 text-primary" />
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Content Calendar</h1>
    </div>
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      <Button
        onClick={onNewPost}
        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground shadow-md hover:shadow-lg transition-all transform hover:scale-105 w-full sm:w-auto"
        size="sm"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> New Post
      </Button>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto border-border/30 flex-1">
              <Filter className="mr-2 h-4 w-4" /> Platforms <ChevronDown className="ml-auto sm:ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border-border/30">
            <DropdownMenuLabel>Filter by Platform</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/30"/>
            {platformOptions.map((platform) => (
              <DropdownMenuCheckboxItem
                key={platform.id}
                checked={selectedPlatforms[platform.id]}
                onCheckedChange={() => onPlatformToggle(platform.id)}
                className="flex items-center focus:bg-muted/50"
              >
                {platform.icon} {platform.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="relative w-full sm:w-auto flex-1 sm:flex-grow-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-8 w-full shadow-sm focus:shadow-md transition-shadow h-9 border-border/30"
          />
        </div>
      </div>
    </div>
  </div>
);

export default CalendarHeader;
