
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Facebook, MessageSquare, Send, Search, Filter, CornerUpLeft, ThumbsUp, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

const initialMockComments = [
    {
        id: 'comment1',
        platform: 'facebook',
        userName: 'Alice Wonderland',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        text: "Great post! Really enjoyed the insights. Keep up the good work!",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        postTitle: 'My Latest Blog Article',
        replies: [],
        likes: 5,
        status: 'unread',
    },
    {
        id: 'comment2',
        platform: 'instagram',
        userName: 'Bob The Builder',
        userAvatar: 'https://i.pravatar.cc/150?img=2',
        text: "Amazing photo! Where was this taken? 😍",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        postTitle: 'Travel Snapshot from Bali',
        replies: [
            { id: 'reply2-1', userName: 'SocialPulse Admin', text: "Thanks, Bob! This was taken in Ubud, Bali.", timestamp: new Date(Date.now() - 1000 * 60 * 55) }
        ],
        likes: 12,
        status: 'read',
    },
    {
        id: 'comment3',
        platform: 'facebook',
        userName: 'Charlie Brown',
        userAvatar: 'https://i.pravatar.cc/150?img=3',
        text: "I have a question regarding your services. Can you please elaborate on the enterprise plan?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        postTitle: 'Our New Service Offerings',
        replies: [],
        likes: 2,
        status: 'unread',
    },
    {
        id: 'comment4',
        platform: 'instagram',
        userName: 'Diana Prince',
        userAvatar: 'https://i.pravatar.cc/150?img=4',
        text: "This is so inspiring! Thank you for sharing. ✨",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        postTitle: 'Motivational Monday Quote',
        replies: [],
        likes: 25,
        status: 'read',
    },
    {
        id: 'comment5',
        platform: 'facebook',
        userName: 'Edward Scissorhands',
        userAvatar: 'https://i.pravatar.cc/150?img=5',
        text: "Could you provide a tutorial on how to use this feature?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30), // 30 hours ago
        postTitle: 'New Feature Announcement!',
        replies: [
            { id: 'reply5-1', userName: 'SocialPulse Admin', text: "Absolutely! We're working on a video tutorial, stay tuned!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) }
        ],
        likes: 8,
        status: 'replied',
    },
];

const PlatformIcon = ({ platform }) => {
    if (platform === 'facebook') return <Facebook className="h-5 w-5 text-blue-600" />;
    if (platform === 'instagram') return <MessageSquare className="h-5 w-5 text-pink-500" />; // Placeholder for Instagram
    return <MessageSquare className="h-5 w-5 text-gray-500" />;
};

const InboxPage = () => {
    const [comments, setComments] = useState(() => {
        const savedComments = localStorage.getItem('inboxComments');
        return savedComments ? JSON.parse(savedComments) : initialMockComments;
    });
    const [selectedComment, setSelectedComment] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read', 'replied'
    const { toast } = useToast();

    useEffect(() => {
        localStorage.setItem('inboxComments', JSON.stringify(comments));
    }, [comments]);

    const handleSelectComment = (comment) => {
        setSelectedComment(comment);
        if (comment.status === 'unread') {
            setComments(prevComments =>
                prevComments.map(c =>
                    c.id === comment.id ? { ...c, status: 'read' } : c
                )
            );
        }
    };

    const handleReply = () => {
        if (!selectedComment || !replyText.trim()) return;
        const newReply = {
            id: `reply${selectedComment.id}-${selectedComment.replies.length + 1}`,
            userName: 'SocialPulse Admin',
            text: replyText,
            timestamp: new Date(),
        };
        setComments(prevComments =>
            prevComments.map(c =>
                c.id === selectedComment.id
                    ? { ...c, replies: [...c.replies, newReply], status: 'replied' }
                    : c
            )
        );
        setSelectedComment(prev => ({
            ...prev,
            replies: [...prev.replies, newReply],
            status: 'replied'
        }));
        setReplyText('');
        toast({ title: "Reply Sent", description: "Your reply has been added to the comment." });
    };

    const handleLikeComment = (commentId) => {
        setComments(prevComments =>
            prevComments.map(c =>
                c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
            )
        );
        if (selectedComment && selectedComment.id === commentId) {
            setSelectedComment(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
        }
        toast({ title: "Comment Liked", description: "You've liked this comment." });
    };

    const handleDeleteComment = (commentId) => {
        setComments(prevComments => prevComments.filter(c => c.id !== commentId));
        if (selectedComment && selectedComment.id === commentId) {
            setSelectedComment(null);
        }
        toast({ title: "Comment Deleted", description: "The comment has been removed.", variant: "destructive" });
    };


    const filteredComments = comments
        .filter(comment => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            return (
                comment.userName.toLowerCase().includes(lowerSearchTerm) ||
                comment.text.toLowerCase().includes(lowerSearchTerm) ||
                comment.postTitle.toLowerCase().includes(lowerSearchTerm)
            );
        })
        .filter(comment => {
            if (filter === 'all') return true;
            return comment.status === filter;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex h-[calc(100vh-10rem)]"
        >
            {/* Comments List Panel */}
            <Card className="w-1/3 h-full flex flex-col rounded-r-none">
                <CardHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Inbox</CardTitle>
                        <Badge variant="secondary">{filteredComments.length} Total</Badge>
                    </div>
                    <CardDescription>Manage comments from your connected accounts.</CardDescription>
                    <div className="mt-4 flex gap-2">
                        <div className="relative flex-grow">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search comments..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="shrink-0">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="mt-2 flex space-x-1">
                        {['all', 'unread', 'read', 'replied'].map(f => (
                            <Button
                                key={f}
                                variant={filter === f ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter(f)}
                                className="text-xs capitalize"
                            >
                                {f} ({f === 'all' ? comments.length : comments.filter(c => c.status === f).length})
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <ScrollArea className="flex-grow">
                    <CardContent className="p-0">
                        {filteredComments.length > 0 ? (
                            filteredComments.map(comment => (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => handleSelectComment(comment)}
                                    className={`p-4 border-b cursor-pointer hover:bg-secondary/50 transition-colors ${selectedComment?.id === comment.id ? 'bg-secondary' : ''}`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                                            <AvatarFallback>{comment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-sm">{comment.userName}</h4>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">on <span className="font-medium">{comment.postTitle}</span></p>
                                            <p className="text-sm mt-1 truncate">{comment.text}</p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-1">
                                            <PlatformIcon platform={comment.platform} />
                                            {comment.status === 'unread' && <Badge variant="destructive" className="text-xs px-1.5 py-0.5">New</Badge>}
                                            {comment.status === 'replied' && <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-green-500 text-green-600">Replied</Badge>}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <p className="p-4 text-center text-muted-foreground">No comments match your criteria.</p>
                        )}
                    </CardContent>
                </ScrollArea>
            </Card>

            {/* Comment Detail and Reply Panel */}
            <Card className="w-2/3 h-full flex flex-col rounded-l-none">
                {selectedComment ? (
                    <>
                        <CardHeader className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={selectedComment.userAvatar} alt={selectedComment.userName} />
                                        <AvatarFallback>{selectedComment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{selectedComment.userName}</CardTitle>
                                        <CardDescription>
                                            Comment on "{selectedComment.postTitle}" via {selectedComment.platform}
                                        </CardDescription>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(selectedComment.timestamp), { addSuffix: true })}
                                </span>
                            </div>
                        </CardHeader>
                        <ScrollArea className="flex-grow p-4">
                            <div className="space-y-6">
                                {/* Original Comment */}
                                <div className="flex items-start space-x-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={selectedComment.userAvatar} alt={selectedComment.userName} />
                                        <AvatarFallback>{selectedComment.userName.substring(0, 1)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-secondary p-3 rounded-lg rounded-tl-none">
                                        <p className="text-sm">{selectedComment.text}</p>
                                        <div className="mt-2 flex items-center space-x-3">
                                            <Button variant="ghost" size="xs" className="text-muted-foreground hover:text-primary" onClick={() => handleLikeComment(selectedComment.id)}>
                                                <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Like ({selectedComment.likes || 0})
                                            </Button>
                                            <Button variant="ghost" size="xs" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteComment(selectedComment.id)}>
                                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Replies */}
                                {selectedComment.replies.map(reply => (
                                    <div key={reply.id} className="flex items-start space-x-3 ml-8">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">SP</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 bg-muted p-3 rounded-lg rounded-tl-none">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-xs font-semibold">{reply.userName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <p className="text-sm">{reply.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <CardContent className="p-4 border-t mt-auto">
                            <div className="flex items-start space-x-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary text-primary-foreground">SP</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 relative">
                                    <Textarea
                                        placeholder={`Reply to ${selectedComment.userName}...`}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        rows={3}
                                        className="pr-12"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="absolute right-2 bottom-2 h-8 w-8"
                                        onClick={handleReply}
                                        disabled={!replyText.trim()}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                        <CornerUpLeft className="h-16 w-16 mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold">Select a comment</h3>
                        <p className="text-sm text-center">Choose a comment from the list to view details and reply.</p>
                    </div>
                )}
            </Card>
        </motion.div>
    );
};

export default InboxPage;
