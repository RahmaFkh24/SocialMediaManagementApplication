import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [comments, setComments] = useState([]);
    const [replyText, setReplyText] = useState({});
    const [loading, setLoading] = useState({ messages: true, comments: true });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/messages');
                setMessages(response.data.data || []);
                setLoading((prev) => ({ ...prev, messages: false }));
            } catch (err) {
                console.error('Messages fetch error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                });
                setError('Failed to fetch messages: ' + (err.response?.data?.error?.message || err.message));
                setLoading((prev) => ({ ...prev, messages: false }));
            }
        };

        const fetchComments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/comments');
                setComments(response.data.data || []);
                setLoading((prev) => ({ ...prev, comments: false }));
            } catch (err) {
                console.error('Comments fetch error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                });
                setError('Failed to fetch comments: ' + (err.response?.data?.error?.message || err.message));
                setLoading((prev) => ({ ...prev, comments: false }));
            }
        };

        fetchMessages();
        fetchComments();
    }, []);

    const handleReply = async (type, id, text) => {
        if (!text.trim()) return;

        try {
            await axios.post(`http://localhost:5000/api/reply/${type}/${id}`, {
                message: text,
            });
            setReplyText({ ...replyText, [id]: '' });

            if (type === 'message') {
                const response = await axios.get('http://localhost:5000/api/messages');
                setMessages(response.data.data || []);
            } else {
                const response = await axios.get('http://localhost:5000/api/comments');
                setComments(response.data.data || []);
            }
        } catch (err) {
            console.error(`Reply error (${type}):`, {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            setError(`Failed to send ${type}: ` + (err.response?.data?.error?.message || err.message));
        }
    };

    const renderMessageItem = (conversation) => {
        const latestMessage = conversation.messages.data[0];
        const sender = conversation.participants.data.find((p) => p.id !== process.env.REACT_APP_PAGE_ID);

        return (
            <div key={conversation.id} className="border-b py-4 last:border-b-0">
                <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">{sender?.name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDistanceToNow(new Date(latestMessage.created_time), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-sm text-foreground mt-1">{latestMessage.message}</p>
                        <div className="mt-2 flex items-center space-x-2">
                            <Input
                                placeholder="Type your reply..."
                                value={replyText[conversation.id] || ''}
                                onChange={(e) => setReplyText({ ...replyText, [conversation.id]: e.target.value })}
                                className="text-sm"
                            />
                            <Button
                                size="sm"
                                onClick={() => handleReply('message', conversation.id, replyText[conversation.id])}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCommentItem = (comment) => (
        <div key={comment.id} className="border-b py-4 last:border-b-0">
            <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">{comment.from?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(comment.created_time), { addSuffix: true })}
                        </span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{comment.message}</p>
                    <div className="mt-2 flex items-center space-x-2">
                        <Input
                            placeholder="Type your reply..."
                            value={replyText[comment.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                            className="text-sm"
                        />
                        <Button
                            size="sm"
                            onClick={() => handleReply('comment', comment.id, replyText[comment.id])}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 ml-64 min-h-screen">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Inbox
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            {error}
                        </div>
                    )}
                    <Tabs defaultValue="messages" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="messages">Messages</TabsTrigger>
                            <TabsTrigger value="comments">Comments</TabsTrigger>
                        </TabsList>
                        <TabsContent value="messages">
                            {loading.messages ? (
                                <p className="text-muted-foreground text-center">Loading messages...</p>
                            ) : messages.length === 0 ? (
                                <p className="text-muted-foreground text-center">No messages found.</p>
                            ) : (
                                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                                    {messages.map(renderMessageItem)}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="comments">
                            {loading.comments ? (
                                <p className="text-muted-foreground text-center">Loading comments...</p>
                            ) : comments.length === 0 ? (
                                <p className="text-muted-foreground text-center">No comments found.</p>
                            ) : (
                                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                                    {comments.map(renderCommentItem)}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default Inbox;