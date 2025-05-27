
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Facebook, Instagram, Twitter, Linkedin, CheckCircle, Clock, XCircle, Edit, Trash2, BarChart2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const platformMap = { facebook: Facebook, instagram: Instagram, twitter: Twitter, linkedin: Linkedin };
const platformColors = { facebook: 'text-facebook', instagram: 'text-instagram', twitter: 'text-twitter', linkedin: 'text-linkedin' };
const statusMap = { Published: CheckCircle, Scheduled: Clock, Failed: XCircle };
const statusColors = { Published: 'bg-green-100 text-green-800', Scheduled: 'bg-blue-100 text-blue-800', Failed: 'bg-red-100 text-red-800' };

const PostDetailModal = ({ post, isOpen, onClose, onEdit, onDelete, onViewAnalytics }) => {
  if (!post) return null;

  const StatusIcon = statusMap[post.status] || Clock;
  const statusColorClass = statusColors[post.status] || 'bg-gray-100 text-gray-800';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] md:max-w-[650px] max-h-[90vh] overflow-y-auto bg-card/90 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Post Details</DialogTitle>
          <DialogDescription>
            {post.status} post for {format(post.start || post.date, 'PPp')} {/* Use start for calendar event, date for list */}
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 py-4"
        >
          {/* Content */}
          <div className="prose dark:prose-invert max-w-none text-sm bg-secondary/30 p-4 rounded-md">
            <p className="whitespace-pre-wrap">{post.title || post.content}</p>
          </div>

          {/* Media Preview */}
          {post.thumbnail && (
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Media</Label>
              <div className="rounded-md overflow-hidden border max-h-60 flex justify-center items-center bg-secondary/20">
                <img-replace src={post.thumbnail} alt="Post media" className="object-contain max-h-60" />
              </div>
            </div>
          )}
          {!post.thumbnail && post.mediaType === 'image' && (
            <div className="rounded-md border h-40 flex justify-center items-center bg-secondary/20 text-muted-foreground">
              <ImageIcon size={32} />
            </div>
          )}

          <Separator />

          {/* Platforms & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Platforms</Label>
              <div className="flex space-x-2">
                {(post.platforms || []).map(platformId => {
                  const Icon = platformMap[platformId];
                  return Icon ? <Icon key={platformId} className={`h-6 w-6 ${platformColors[platformId] || 'text-muted-foreground'}`} /> : null;
                })}
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Status</Label>
              <Badge variant="outline" className={`border-0 ${statusColorClass}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {post.status}
              </Badge>
            </div>
          </div>

        </motion.div>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={onViewAnalytics} size="sm">
            <BarChart2 className="mr-1 h-4 w-4" /> Analytics
          </Button>
          <div className="flex-grow" /> {/* Spacer */}
          <Button variant="ghost" onClick={onEdit} size="sm">
            <Edit className="mr-1 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={onDelete} size="sm">
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
