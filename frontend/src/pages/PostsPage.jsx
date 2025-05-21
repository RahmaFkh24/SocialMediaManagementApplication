import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui'; // Your UI lib
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Filter,
  Clock,
  Pencil,
  Trash2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
};
const platformColors = {
  facebook: 'text-blue-600',
  instagram: 'text-pink-500',
  twitter: 'text-sky-400',
  linkedin: 'text-blue-700',
};
const statusColors = {
  Published: 'bg-green-100 text-green-800',
  Scheduled: 'bg-blue-100 text-blue-800',
  Failed: 'bg-red-100 text-red-800',
};

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('desc');
  const [postsPerPage, setPostsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPost, setEditingPost] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      // Override status for Facebook posts as "Published"
      const fixedPosts = (response.data.data || []).map(post => {
        if (post.platforms?.includes('facebook')) {
          return { ...post, status: 'Published' };
        }
        return post;
      });
      setPosts(fixedPosts);
    } catch (err) {
      setError('Erreur lors du chargement des posts : ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter & sort posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter(post => post.message?.toLowerCase().includes(filter.toLowerCase()))
      .filter(post => platformFilter === 'all' || post.platforms?.includes(platformFilter))
      .filter(post => statusFilter === 'all' || post.status === statusFilter)
      .sort((a, b) => {
        const dateA = new Date(a.created_time);
        const dateB = new Date(b.created_time);
        return sort === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [posts, filter, platformFilter, statusFilter, sort]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`);
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
      console.error(err);
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/posts/${editingPost.id}`, {
        message: editedMessage,
      });
      setPosts(prev =>
        prev.map(post =>
          post.id === editingPost.id ? { ...post, message: editedMessage } : post
        )
      );
      setEditingPost(null);
    } catch (err) {
      alert("Erreur lors de la modification.");
      console.error(err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex flex-col min-h-screen w-full p-4 md:p-6 bg-muted/50">
      <div className="flex flex-col max-w-7xl mx-auto flex-grow w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Toutes les publications</h1>

        {/* Filters & Controls */}
        <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-1/3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select
              value={platformFilter}
              onValueChange={value => {
                setPlatformFilter(value);
                setCurrentPage(1);
              }}
              aria-label="Filtrer par plateforme"
            >
              <SelectTrigger className="w-40">
                <SelectValue>{platformFilter === 'all' ? 'Toutes plateformes' : platformFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes plateformes</SelectItem>
                {Object.keys(platformIcons).map(plat => (
                  <SelectItem key={plat} value={plat}>
                    {plat.charAt(0).toUpperCase() + plat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-1/3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={value => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              aria-label="Filtrer par statut"
            >
              <SelectTrigger className="w-40">
                <SelectValue>{statusFilter === 'all' ? 'Tous statuts' : statusFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                {Object.keys(statusColors).map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Filtrer par message"
            className="w-full sm:w-1/3"
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <Button
            onClick={() => navigate('/scheduler')}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Créer un post
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Afficher :</span>
            <Select
              value={postsPerPage.toString()}
              onValueChange={value => {
                setPostsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue>{postsPerPage}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground flex-grow">Chargement des publications...</p>
        ) : currentPosts.length === 0 ? (
          <p className="text-center text-muted-foreground flex-grow">Aucune publication trouvée.</p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="overflow-x-auto rounded-md shadow-md border border-border"
          >
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Plateforme</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {currentPosts.map(post => {
                    const Icon = platformIcons[post.platforms?.[0]] || Facebook;
                    const platform = post.platforms?.[0] || 'facebook';
                    const status = post.platforms?.includes('facebook') ? 'Published' : post.status || 'Published';

                    return (
                      <motion.tr
                        key={post.id}
                        layout
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="even:bg-muted/30"
                      >
                        <TableCell className="flex items-center gap-2">
                          <Icon className={`${platformColors[platform]} w-6 h-6`} />
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </TableCell>
                        <TableCell className="whitespace-pre-wrap max-w-xs">{post.message}</TableCell>
                        <TableCell>
                          <time title={new Date(post.created_time).toLocaleString()}>
                            {formatDistanceToNow(new Date(post.created_time), { addSuffix: true })}
                          </time>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[status]}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label={`Modifier le post ${post.id}`}
                            onClick={() => {
                              setEditingPost(post);
                              setEditedMessage(post.message);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            aria-label={`Supprimer le post ${post.id}`}
                            onClick={() => {
                              if (window.confirm('Voulez-vous vraiment supprimer ce post ?')) {
                                handleDelete(post.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </motion.div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-center items-center gap-4 flex-wrap">
          <Button
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          >
            Précédent
          </Button>
          <span>
            Page {currentPage} sur {totalPages || 1}
          </span>
          <Button
            size="sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          >
            Suivant
          </Button>
        </div>

        {/* Edit Modal */}
        <Dialog open={!!editingPost} onOpenChange={open => !open && setEditingPost(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la publication</DialogTitle>
            </DialogHeader>
            <textarea
              className="w-full p-2 border border-border rounded resize-y min-h-[100px]"
              value={editedMessage}
              onChange={e => setEditedMessage(e.target.value)}
            />
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditingPost(null)}>Annuler</Button>
              <Button onClick={handleEdit} disabled={editedMessage.trim() === ''}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PostsPage;
