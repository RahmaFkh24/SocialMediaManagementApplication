import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Clock, AlertCircle, ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts');
        setPosts(response.data.data || []);
      } catch (err) {
        console.error('Posts fetch error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError('Failed to fetch posts: ' + (err.response?.data?.error?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const renderPostItem = (post) => (
    <div key={post.id} className="border-b py-4 last:border-b-0">
      <div className="flex items-start space-x-3">
        <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm">Facebook Page</span>
            <span className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(post.created_time), { addSuffix: true })}
            </span>
          </div>
          {post.message && <p className="text-sm text-foreground mt-1">{post.message}</p>}
          {post.media_url && (
            <img
              src={post.media_url}
              alt="Post media"
              className="mt-2 max-w-xs rounded-lg border"
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 ml-64 min-h-screen">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ScrollText className="h-5 w-5 mr-2" />
            Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
          {loading ? (
            <p className="text-muted-foreground text-center">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground text-center">No posts found.</p>
          ) : (
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {posts.map(renderPostItem)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PostsPage;
