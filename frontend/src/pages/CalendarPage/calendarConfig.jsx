import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export const initialEvents = [
  {
    id: 1,
    title: 'Morning FB Post: New Product Launch! Check out our latest innovation. #NewProduct #Tech',
    start: new Date(2025, 4, 15, 10, 0, 0),
    end: new Date(2025, 4, 15, 10, 30, 0),
    platform: 'Facebook',
    status: 'Published',
    media: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMGxhdW5jaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    notes: 'Boosted post for 3 days.',
  },
  {
    id: 2,
    title: 'IG Story Poll: Which feature do you love most? A or B? 📊 #InstagramPoll #Feedback',
    start: new Date(2025, 4, 16, 14, 0, 0),
    end: new Date(2025, 4, 16, 14, 15, 0),
    platform: 'Instagram',
    status: 'Scheduled',
    media: 'https://images.unsplash.com/photo-1611162616805-6CD94c999474?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aW5zdGFncmFtJTIwc3Rvcnl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    notes: 'Track poll results closely.',
  },
  {
    id: 3,
    title: 'LinkedIn Article: The Future of Remote Work - Insights and Trends. #RemoteWork #FutureOfWork',
    start: new Date(2025, 4, 17, 9, 0, 0),
    end: new Date(2025, 4, 17, 9, 30, 0),
    platform: 'LinkedIn',
    status: 'Scheduled',
    media: null,
    notes: 'Share in relevant LI groups.',
  },
  {
    id: 4,
    title: 'Twitter Thread: 5 Tips for Better Time Management 🧵 #ProductivityHacks #TimeManagement',
    start: new Date(2025, 4, 18, 11, 0, 0),
    end: new Date(2025, 4, 18, 11, 15, 0),
    platform: 'Twitter',
    status: 'Published',
    media: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGltZSUyMG1hbmFnZW1lbnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    notes: 'Engage with replies.',
  },
  {
    id: 5,
    title: 'FB Live Q&A: Ask Me Anything about our services! 🎙️ #FacebookLive #AMA',
    start: new Date(2025, 4, 20, 18, 0, 0),
    end: new Date(2025, 4, 20, 19, 0, 0),
    platform: 'Facebook',
    status: 'Scheduled',
    media: 'https://images.unsplash.com/photo-1554200876-56c2f25224fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGl2ZSUyMHQlMjZhfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    notes: 'Prepare key talking points.',
  },
  {
    id: 6,
    title: 'Instagram Reel: Behind the scenes of our new campaign shoot! 🎬 #BTS #CampaignLaunch',
    start: new Date(2025, 4, 22, 15, 30, 0),
    end: new Date(2025, 4, 22, 15, 35, 0),
    platform: 'Instagram',
    status: 'Published',
    media: 'https://images.unsplash.com/photo-1516788879873-4ebb0658c637?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmVoaW5kJTIwdGhlJTIwc2NlbmVzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    notes: 'Add trending audio.',
  },
];

export const platformOptions = [
  { id: 'Facebook', name: 'Facebook', icon: <Facebook className="h-4 w-4 mr-2 text-blue-600" /> },
  { id: 'Instagram', name: 'Instagram', icon: <Instagram className="h-4 w-4 mr-2 text-pink-500" /> },
  { id: 'LinkedIn', name: 'LinkedIn', icon: <Linkedin className="h-4 w-4 mr-2 text-sky-700" /> },
  { id: 'Twitter', name: 'Twitter', icon: <Twitter className="h-4 w-4 mr-2 text-sky-500" /> },
];