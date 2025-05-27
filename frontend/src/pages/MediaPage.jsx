
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Filter, Image as ImageIcon, Video, Trash2, Search, CheckCircle } from 'lucide-react'; // Import CheckCircle
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';

// Mock Media Data
const initialMedia = [
  { id: 1, type: 'image', url: 'placeholder_url_1', name: 'product_launch.jpg', size: '1.2MB', dateAdded: new Date(2025, 4, 1) },
  { id: 2, type: 'image', url: 'placeholder_url_2', name: 'team_photo.png', size: '800KB', dateAdded: new Date(2025, 3, 25) },
  { id: 3, type: 'video', url: 'placeholder_url_3', name: 'tutorial_video.mp4', size: '15MB', dateAdded: new Date(2025, 3, 20) },
  { id: 4, type: 'image', url: 'placeholder_url_4', name: 'infographic.svg', size: '300KB', dateAdded: new Date(2025, 3, 15) },
  { id: 5, type: 'image', url: 'placeholder_url_5', name: 'event_banner.jpg', size: '2.5MB', dateAdded: new Date(2025, 3, 10) },
  { id: 6, type: 'video', url: 'placeholder_url_6', name: 'testimonial.mov', size: '22MB', dateAdded: new Date(2025, 3, 5) },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  hover: { scale: 1.05, transition: { duration: 0.2 } }
};

const MediaPage = () => {
  const [mediaItems, setMediaItems] = useState(initialMedia);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const { toast } = useToast();

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Simulate upload
      const newMedia = Array.from(files).map((file, index) => ({
        id: Date.now() + index, // Simple unique ID generation
        type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'other',
        url: URL.createObjectURL(file), // Create temporary URL for preview
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
        dateAdded: new Date(),
      }));

      setMediaItems(prev => [...newMedia, ...prev]);

      toast({
        title: `${files.length} File(s) Added`,
        description: "Media successfully uploaded (simulation).",
      });
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    setMediaItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    toast({
      title: `${selectedItems.length} Item(s) Deleted`,
      variant: "destructive",
    });
  };

  const filteredMedia = mediaItems.filter(item => {
    const typeMatch = typeFilter === 'all' || item.type === typeFilter;
    const searchMatch = searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <ImageIcon className="mr-2 h-7 w-7" /> Media Library
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-40 sm:w-auto"
            />
          </div>
          {/* Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
          {/* Delete Selected */}
          {selectedItems.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedItems.length})
            </Button>
          )}
          {/* Upload Button */}
          <Button asChild className="cursor-pointer">
            <label htmlFor="media-upload-input">
              <Upload className="mr-2 h-4 w-4" /> Upload Media
              <Input id="media-upload-input" type="file" multiple onChange={handleFileUpload} className="sr-only" />
            </label>
          </Button>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length > 0 ? (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {filteredMedia.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover="hover"
              layout
            >
              <Card
                className={`relative group overflow-hidden cursor-pointer aspect-square transition-all ${selectedItems.includes(item.id) ? 'ring-2 ring-primary ring-offset-2' : 'ring-0'}`}
                onClick={() => toggleSelectItem(item.id)}
              >
                <CardContent className="p-0 h-full flex items-center justify-center">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="object-cover w-full h-full transition-transform group-hover:scale-110"
                    />
                  ) : item.type === 'video' ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Video className="h-12 w-12 text-white opacity-70" />
                    </div>
                  ) : (
                    <div className="text-muted-foreground">?</div>
                  )}
                  {/* Overlay with Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                    <p className="font-semibold truncate">{item.name}</p>
                    <p>{item.size} - {format(item.dateAdded, 'PP')}</p>
                  </div>
                  {/* Selection Checkbox visual */}
                  <div className={`absolute top-2 right-2 h-5 w-5 rounded border border-white bg-black/30 flex items-center justify-center transition-all ${selectedItems.includes(item.id) ? 'bg-primary border-primary' : ''}`}>
                    {selectedItems.includes(item.id) && <CheckCircle size={14} className="text-white" />}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="text-center py-16 text-muted-foreground">
          <p>No media found matching your criteria.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MediaPage;
