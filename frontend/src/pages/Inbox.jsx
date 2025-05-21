import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const ConfirmModal = ({ open, onClose, onConfirm, title, description }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-lg">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="mb-4">{description}</p>
                <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>Supprimer</Button>
                </div>
            </div>
        </div>
    );
};

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [comments, setComments] = useState([]);
    const [replyText, setReplyText] = useState({});
    const [loading, setLoading] = useState({ messages: true, comments: true });
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false, type: null, id: null });

    const [searchMessages, setSearchMessages] = useState('');
    const [searchComments, setSearchComments] = useState('');

    const [platformFilter, setPlatformFilter] = useState('all');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState({ messages: 1, comments: 1 });

    useEffect(() => {
        fetchMessages();
        fetchComments();
    }, []);

    const fetchMessages = async () => {
        setLoading(prev => ({ ...prev, messages: true }));
        try {
            const res = await axios.get('http://localhost:5000/api/messages');
            setMessages(res.data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(prev => ({ ...prev, messages: false }));
        }
    };

    const fetchComments = async () => {
        setLoading(prev => ({ ...prev, comments: true }));
        try {
            const res = await axios.get('http://localhost:5000/api/comments');
            setComments(res.data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(prev => ({ ...prev, comments: false }));
        }
    };

    const handleReply = async (type, id, text) => {
        if (!text.trim()) return;
        try {
            await axios.post(`http://localhost:5000/api/reply/${type}/${id}`, { message: text });
            setReplyText(prev => ({ ...prev, [id]: '' }));
            if (type === 'message') fetchMessages();
            else fetchComments();
            setToast({ type: 'success', message: 'Réponse envoyée' });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (type, id) => {
        try {
            await axios.delete(`http://localhost:5000/api/${type}/${id}`);
            if (type === 'messages') fetchMessages();
            else fetchComments();
            setToast({ type: 'success', message: `${type === 'messages' ? 'Message' : 'Commentaire'} supprimé` });
        } catch (err) {
            setError(err.message);
        }
    };

    const openDeleteConfirm = (type, id) => {
        setConfirmModal({ open: true, type, id });
    };

    const renderItem = (item, type) => (
        <div key={item.id} className="border-b py-4 last:border-0">
            <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                    <div className="flex justify-between">
                        <span className="font-semibold text-sm">{item.from?.name || 'Inconnu'}</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(item.created_time), { addSuffix: true })}
                        </span>
                    </div>
                    <p className="text-sm mt-1">{item.message}</p>

                    {item.replies?.length > 0 && (
                        <div className="mt-3 ml-6 border-l-2 border-muted-foreground pl-3 space-y-2">
                            {item.replies.map(reply => {
                                const isPage = reply.from?.name === 'Page';
                                return (
                                    <div
                                        key={reply.id}
                                        className={`text-sm ${isPage ? 'text-muted-foreground italic' : ''}`}
                                        title={isPage ? 'Réponse de la page' : ''}
                                    >
                                        <User className="inline h-3 w-3 mr-1" />
                                        {reply.message}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-2 flex items-center space-x-2">
                        <Input
                            placeholder="Répondre..."
                            value={replyText[item.id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [item.id]: e.target.value }))}
                        />
                        <Button size="sm" onClick={() => handleReply(type === 'messages' ? 'message' : 'comment', item.id, replyText[item.id])}>
                            <Send className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openDeleteConfirm(type, item.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    const applyFilters = (items, search, page) => {
        const filtered = items.filter(i =>
            (i.from?.name?.toLowerCase().includes(search.toLowerCase()) || false) ||
            (i.message?.toLowerCase().includes(search.toLowerCase()) || false)
        ).filter(i => platformFilter === 'all' || i.platform === platformFilter);

        const start = (page - 1) * itemsPerPage;
        return {
            paginated: filtered.slice(start, start + itemsPerPage),
            totalPages: Math.ceil(filtered.length / itemsPerPage)
        };
    };

    const { paginated: filteredMessages, totalPages: totalMessagesPages } = applyFilters(messages, searchMessages, currentPage.messages);
    const { paginated: filteredComments, totalPages: totalCommentsPages } = applyFilters(comments, searchComments, currentPage.comments);

    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-50">
            <div className="flex-1 overflow-auto p-4">
                <div className="max-w-5xl mx-auto w-full">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl">
                                <MessageSquare className="h-5 w-5 mr-2" /> Inbox
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
                            {toast && <div className="p-3 bg-green-100 text-green-700 rounded">{toast.message}</div>}

                            <Tabs defaultValue="messages" className="w-full">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="messages">Messages</TabsTrigger>
                                    <TabsTrigger value="comments">Commentaires</TabsTrigger>
                                </TabsList>

                                <TabsContent value="messages">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Rechercher un message..." value={searchMessages} onChange={(e) => setSearchMessages(e.target.value)} />
                                        <Select onValueChange={setPlatformFilter}>
                                            <SelectTrigger className="w-36"><SelectValue placeholder="Plateforme" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Toutes</SelectItem>
                                                <SelectItem value="facebook">Facebook</SelectItem>
                                                <SelectItem value="instagram">Instagram</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select onValueChange={(val) => setItemsPerPage(Number(val))}>
                                            <SelectTrigger className="w-20"><SelectValue placeholder="10 / page" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="15">15</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {loading.messages ? (
                                        <div>Chargement des messages...</div>
                                    ) : filteredMessages.length > 0 ? (
                                        <>
                                            {filteredMessages.map(msg => renderItem(msg, 'messages'))}
                                            <div className="flex justify-between items-center mt-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setCurrentPage(p => ({ ...p, messages: Math.max(p.messages - 1, 1) }))}
                                                    disabled={currentPage.messages === 1}
                                                >Précédent</Button>
                                                <span className="text-sm">Page {currentPage.messages} / {totalMessagesPages}</span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setCurrentPage(p => ({ ...p, messages: Math.min(p.messages + 1, totalMessagesPages) }))}
                                                    disabled={currentPage.messages === totalMessagesPages}
                                                >Suivant</Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Aucun message trouvé.</div>
                                    )}
                                </TabsContent>

                                <TabsContent value="comments">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Rechercher un commentaire..."
                                            value={searchComments}
                                            onChange={(e) => setSearchComments(e.target.value)}
                                        />
                                        <Select onValueChange={setPlatformFilter}>
                                            <SelectTrigger className="w-36"><SelectValue placeholder="Plateforme" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Toutes</SelectItem>
                                                <SelectItem value="facebook">Facebook</SelectItem>
                                                <SelectItem value="instagram">Instagram</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>


                                    {loading.comments ? (
                                        <div>Chargement des commentaires...</div>
                                    ) : filteredComments.length > 0 ? (
                                        <>
                                            {filteredComments.map(comment => renderItem(comment, 'comments'))}
                                            <div className="flex justify-between items-center mt-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setCurrentPage(p => ({ ...p, comments: Math.max(p.comments - 1, 1) }))}
                                                    disabled={currentPage.comments === 1}
                                                >Précédent</Button>
                                                <span className="text-sm">Page {currentPage.comments} / {totalCommentsPages}</span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setCurrentPage(p => ({ ...p, comments: Math.min(p.comments + 1, totalCommentsPages) }))}
                                                    disabled={currentPage.comments === totalCommentsPages}
                                                >Suivant</Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Aucun commentaire trouvé.</div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ConfirmModal
                open={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, type: null, id: null })}
                onConfirm={() => handleDelete(confirmModal.type, confirmModal.id)}
                title="Confirmation"
                description="Es-tu sûr de vouloir supprimer cet élément ? Cette action est irréversible."
            />
        </div>
    );
};

export default Inbox;
