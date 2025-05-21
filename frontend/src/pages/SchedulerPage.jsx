
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PlatformChip from '@/components/PlatformChip';
import { DateTimePicker } from '@/components/DateTimePicker';
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import { Facebook, Instagram, Twitter, Linkedin, Image as ImageIcon, Video, Smile, Send } from 'lucide-react';

const platformOptions = [
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-600 text-white' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-500 text-white' },
    // Removed Twitter and LinkedIn based on user request in follow-up prompt implicitly
    // { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'bg-blue-400 text-white' },
    // { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700 text-white' },
];

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
};


const SchedulerPage = () => {
    const navigate = useNavigate(); // Hook for navigation
    const { toast } = useToast(); // Hook for toasts
    const [postContent, setPostContent] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [scheduleDate, setScheduleDate] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null); // URL of the uploaded media
    const [isLoading, setIsLoading] = useState(false); // Loading state

    const togglePlatform = (platformId) => {
        setSelectedPlatforms((prev) =>
            prev.includes(platformId)
                ? prev.filter((p) => p !== platformId)
                : [...prev, platformId]
        );
    };

    const handleMediaUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setMediaPreview(null);
        }
    };

    // Function to handle post submission/scheduling
    const handlePostSubmit = async () => {
        if (!postContent || selectedPlatforms.length === 0) {
            toast({
                title: "Missing Information",
                description: "Please add content and select at least one platform.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        // Simulate API call / saving data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

        try {
            // Simulate saving to localStorage
            const posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
            const newPost = {
                id: Date.now(), // Simple unique ID
                content: postContent,
                platforms: selectedPlatforms,
                status: scheduleDate && scheduleDate > new Date() ? 'Scheduled' : 'Published', // Determine status based on date
                date: scheduleDate || new Date(),
                thumbnail: mediaPreview, // Store preview URL (in real app, store actual URL)
                // Add platformIcons, statusIcon, statusColor based on logic in PostsPage if needed here
            };
            posts.push(newPost);
            localStorage.setItem('scheduledPosts', JSON.stringify(posts));

            toast({
                title: `Post ${newPost.status}!`,
                description: `Your post has been successfully ${newPost.status.toLowerCase()}.`,
            });

            // Reset form (optional)
            // setPostContent('');
            // setSelectedPlatforms([]);
            // setScheduleDate(null);
            // setMediaPreview(null);

            navigate('/posts'); // Navigate to the posts page after success

        } catch (error) {
            toast({
                title: "Error Saving Post",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight">Create & Schedule Post</motion.h1>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Compose Your Post</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Text Area */}
                        <div className="space-y-2">
                            <Label htmlFor="post-content">Content</Label>
                            <div className="relative">
                                <Textarea
                                    id="post-content"
                                    placeholder="What's on your mind?"
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    className="min-h-[150px] pr-10"
                                    disabled={isLoading}
                                />
                                <Button variant="ghost" size="icon" className="absolute bottom-2 right-2 text-muted-foreground hover:text-primary" disabled={isLoading}>
                                    <Smile className="h-5 w-5" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground text-right">{postContent.length} characters</p>
                        </div>

                        {/* Media Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="media-upload">Add Image/Video</Label>
                            <div className="flex items-center space-x-2">
                                <Input id="media-upload" type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="flex-grow" disabled={isLoading} />
                                {mediaPreview && (
                                    <Button variant="outline" size="icon" onClick={() => setMediaPreview(null)} className="text-destructive" disabled={isLoading}>
                                        <ImageIcon className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {mediaPreview && (
                                <div className="mt-2 border rounded-md overflow-hidden max-h-40 w-fit">
                                    {mediaPreview.startsWith('data:image') ? (
                                        <img-replace src={mediaPreview} alt="Media preview" className="object-contain max-h-40" />
                                    ) : mediaPreview.startsWith('data:video') ? (
                                        <video src={mediaPreview} controls className="object-contain max-h-40" />
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Platform Selector */}
                        <div className="space-y-2">
                            <Label>Select Platforms</Label>
                            <motion.div
                                className="flex flex-wrap gap-2"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {platformOptions.map((platform) => (
                                    <motion.div key={platform.id} variants={itemVariants}>
                                        <PlatformChip
                                            icon={platform.icon}
                                            label={platform.label}
                                            isSelected={selectedPlatforms.includes(platform.id)}
                                            onClick={() => !isLoading && togglePlatform(platform.id)}
                                            color={platform.color}
                                            disabled={isLoading} // Add disabled prop to PlatformChip if it supports it
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Date Time Picker */}
                        <div className="space-y-2">
                            <Label>Schedule Date & Time (Optional)</Label>
                            <DateTimePicker date={scheduleDate} setDate={setScheduleDate} disabled={isLoading} />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <Button
                                size="lg"
                                onClick={handlePostSubmit}
                                disabled={!postContent || selectedPlatforms.length === 0 || isLoading}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isLoading
                                    ? 'Processing...'
                                    : scheduleDate && scheduleDate > new Date()
                                        ? 'Schedule Post'
                                        : 'Post Now'}
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                {/* Preview Section */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                        <CardDescription>See how your post might look.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 bg-secondary/50 p-4 rounded-md min-h-[300px]">
                        {selectedPlatforms.length > 0 ? (
                            <div className="space-y-2">
                                <Label>Previewing on: {platformOptions.find(p => p.id === selectedPlatforms[0])?.label || 'Platform'}</Label>
                                <div className="border rounded-lg p-4 bg-background shadow-sm">
                                    {/* Simple Preview Structure */}
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Avatar>
                                            <AvatarImage src="https://i.pravatar.cc/150?img=3" />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold">Your Profile</p>
                                            <p className="text-xs text-muted-foreground">Just now</p>
                                        </div>
                                    </div>
                                    {postContent && <p className="text-sm whitespace-pre-wrap mb-2">{postContent}</p>}
                                    {mediaPreview && (
                                        <div className="mt-2 rounded-md overflow-hidden max-h-60 flex justify-center">
                                            {mediaPreview.startsWith('data:image') ? (
                                                <img-replace src={mediaPreview} alt="Preview media" className="object-contain max-h-60" />
                                            ) : mediaPreview.startsWith('data:video') ? (
                                                <video src={mediaPreview} controls className="object-contain max-h-60" />
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>Select a platform and add content to see preview.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default SchedulerPage;
