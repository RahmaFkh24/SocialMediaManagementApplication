import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Filter, Image as ImageIcon, Video, Trash2, Search, CheckCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';

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
  const [mediaItems, setMediaItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const { toast } = useToast();

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await res.json();
      setMediaItems(data.media);
    } catch (err) {
      console.error('Failed to fetch media', err);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('media', file);
    }

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData
      });

      if (res.ok) {
        toast({
          title: `${files.length} File(s) Uploaded`,
          description: "Media successfully saved to your account.",
        });
        fetchMedia(); // Refresh list
      } else {
        const errorData = await res.json();
        toast({
          title: "Upload failed",
          description: errorData.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Upload error', err);
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;

    try {
      const res = await fetch('/api/media/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ ids: selectedItems })
      });

      if (res.ok) {
        toast({
          title: `${selectedItems.length} Item(s) Deleted`,
          variant: "destructive",
        });
        fetchMedia();
        setSelectedItems([]);
      } else {
        toast({
          title: "Delete Failed",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
    }
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
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <ImageIcon className="mr-2 h-7 w-7" /> Media Library
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
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

          {selectedItems.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedItems.length})
            </Button>
          )}

          <Button asChild className="cursor-pointer">
            <label htmlFor="media-upload-input">
              <Upload className="mr-2 h-4 w-4" /> Upload Media
              <Input id="media-upload-input" type="file" multiple onChange={handleFileUpload} className="sr-only" />
            </label>
          </Button>
        </div>
      </div>

      {filteredMedia.length > 0 ? (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {filteredMedia.map((item) => (
            <motion.div
              key={item._id}
              variants={itemVariants}
              whileHover="hover"
              layout
            >
              <Card
                className={`relative group overflow-hidden cursor-pointer aspect-square transition-all ${selectedItems.includes(item._id) ? 'ring-2 ring-primary ring-offset-2' : 'ring-0'}`}
                onClick={() => toggleSelectItem(item._id)}
              >
                <CardContent className="p-0 h-full flex items-center justify-center">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="object-cover w-full h-full transition-transform group-hover:scale-110"
                    />
                  ) : item.type === 'video' ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <div className="text-muted-foreground">?</div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                    <p className="font-semibold truncate">{item.name}</p>
                    <p>{item.size} - {format(new Date(item.dateAdded), 'PP')}</p>
                  </div>
                  <div className={`absolute top-2 right-2 h-5 w-5 rounded border border-white bg-black/30 flex items-center justify-center transition-all ${selectedItems.includes(item._id) ? 'bg-primary border-primary' : ''}`}>
                    {selectedItems.includes(item._id) && <CheckCircle size={14} className="text-white" />}
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
