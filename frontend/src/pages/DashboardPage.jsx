
import React, { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import { Users, FileText, CalendarClock, TrendingUp, PlusCircle, Link as LinkIcon, Facebook, Twitter, CheckCircle, Clock, Lightbulb, Award, Send, BarChart3, CheckSquare, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'; // Added CardFooter import
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dashboardMetrics = [
  { title: "Total Posts (Week)", value: 45, icon: FileText, change: "+10" },
  { title: "Connected Accounts", value: 2, icon: LinkIcon, change: "+0" },
  { title: "Scheduled Today", value: 8, icon: CalendarClock, change: "+3" },
  { title: "Engagement Peak", value: "14.2%", icon: TrendingUp, change: "+1.1%" },
];

const bestTimes = [
  { time: "9:00 AM", day: "Weekday", reason: "Morning check-ins", icon: Clock },
  { time: "1:00 PM", day: "Weekday", reason: "Lunch break scroll", icon: Clock },
  { time: "7:00 PM", day: "Weekday", reason: "Evening relaxation", icon: Clock },
];

const platformMap = { facebook: Facebook, instagram: LinkIcon };
const platformColors = { facebook: 'text-blue-600', instagram: 'text-pink-500' };

const engagementChartData = [
  { name: 'Jan', Facebook: 400, Instagram: 240, LinkedIn: 140 },
  { name: 'Feb', Facebook: 300, Instagram: 139, LinkedIn: 100 },
  { name: 'Mar', Facebook: 200, Instagram: 980, LinkedIn: 300 },
  { name: 'Apr', Facebook: 278, Instagram: 390, LinkedIn: 250 },
  { name: 'May', Facebook: 189, Instagram: 480, LinkedIn: 210 },
  { name: 'Jun', Facebook: 239, Instagram: 380, LinkedIn: 350 },
  { name: 'Jul', Facebook: 349, Instagram: 430, LinkedIn: 310 },
];


const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

const bestTimeItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  hover: { scale: 1.05, backgroundColor: 'hsl(var(--primary)/0.1)', transition: { duration: 0.2 } }
};

const DashboardPage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }
  const [upcomingPosts, setUpcomingPosts] = useState([]);

  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
    const now = new Date();
    const futurePosts = storedPosts
      .filter(post => post.status === 'Scheduled' && new Date(post.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    setUpcomingPosts(futurePosts);
  }, []);


  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Summary Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        {dashboardMetrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            icon={metric.icon}
            change={metric.change}
            delay={index}
            value={
              typeof metric.value === 'number' || (typeof metric.value === 'string' && metric.value.includes('%'))
                ? <AnimatedCounter to={typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value} className="text-3xl font-bold group-hover:text-primary transition-colors" duration={1} />
                : <span className="text-3xl font-bold group-hover:text-primary transition-colors">{metric.value}</span>
            }
          />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Engagement Chart */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" /> Engagement Over Time</CardTitle>
                <CardDescription>Total engagement across all connected platforms (Jan - Jul)</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-2">
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart
                      data={engagementChartData}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorFb" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorIg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }} />
                      <Area type="monotone" dataKey="Facebook" stackId="1" stroke="#8884d8" fillOpacity={1} fill="url(#colorFb)" />
                      <Area type="monotone" dataKey="Instagram" stackId="1" stroke="#82ca9d" fillOpacity={1} fill="url(#colorIg)" />
                      <Area type="monotone" dataKey="LinkedIn" stackId="1" stroke="#ffc658" fillOpacity={1} fill="url(#colorLi)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Connected Accounts Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-md rounded-2xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center"><LinkIcon className="mr-2 h-5 w-5 text-primary" /> Connected Accounts</CardTitle>
                <CardDescription>Manage your social media accounts</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Facebook Account */}
                <Card className="p-4 space-y-2 border-l-4 border-blue-600">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Facebook className="h-6 w-6 text-blue-600" />
                      <h4 className="font-semibold">Social Pulse</h4>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200"><CheckSquare className="h-3 w-3 mr-1" />Connected</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Followers: <span className="font-medium text-foreground">12,580</span></p>
                    <p>Posts: <span className="font-medium text-foreground">124</span></p>
                    <p>Engagement: <span className="font-medium text-foreground">7.2%</span></p>
                  </div>
                  <Progress value={72} className="h-1.5" indicatorClassName="bg-purple-500" />
                </Card>
                {/* Instagram Account */}
                <Card className="p-4 space-y-2 border-l-4 border-pink-500">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="h-6 w-6 text-pink-500" /> {/* Placeholder Icon */}
                      <h4 className="font-semibold">Social Pulse Design</h4>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200"><CheckSquare className="h-3 w-3 mr-1" />Connected</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Followers: <span className="font-medium text-foreground">8,740</span></p>
                    <p>Posts: <span className="font-medium text-foreground">342</span></p>
                    <p>Engagement: <span className="font-medium text-foreground">5.8%</span></p>
                  </div>
                  <Progress value={58} className="h-1.5" indicatorClassName="bg-purple-500" />
                </Card>
              </CardContent>
              <CardFooter className="p-4 sm:p-6 border-t pt-4">
                <Link to="/accounts">
                  <Button variant="outline" size="sm">Manage Accounts</Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>


          {/* Upcoming Posts Section */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="mr-2 h-5 w-5 text-primary" /> Upcoming Posts
                </CardTitle>
                <CardDescription>Your next scheduled posts.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingPosts.length > 0 ? (
                    upcomingPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between space-x-4 pb-2 border-b last:border-b-0"
                      >
                        <div className="flex-grow truncate">
                          <p className="text-sm font-medium text-foreground truncate">{post.content}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(post.date), 'MMM d, h:mm a')}</p>
                        </div>
                        <div className="flex space-x-1 flex-shrink-0">
                          {post.platforms.map(platformId => {
                            const Icon = platformMap[platformId];
                            return Icon ? <Icon key={platformId} className={`h-4 w-4 ${platformColors[platformId] || 'text-muted-foreground'}`} /> : null;
                          })}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No upcoming posts scheduled.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Link to="/scheduler">
                  <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Post
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>


        </div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 max-h-[350px]"
        >
          <Card className="h-full flex flex-col bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardHeader className="py-3 px-4">
              <CardTitle className="flex items-center text-primary text-base">
                <Lightbulb className="mr-2 h-4 w-4" />
                Best Times to Post
              </CardTitle>
              <CardDescription className="text-xs">
                Based on your recent engagement data.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow px-4 pb-4 overflow-y-auto space-y-2">
              <motion.div
                className="space-y-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5, staggerChildren: 0.15 }}
              >
                {bestTimes.slice(0, 4).map((slot, index) => (
                  <motion.div
                    key={index}
                    variants={bestTimeItemVariants}
                    whileHover="hover"
                    className="flex items-center space-x-3 p-2 rounded-md cursor-default transition-colors duration-200 border border-transparent hover:border-primary/20"
                  >
                    <slot.icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {slot.time}{" "}
                        <span className="text-muted-foreground text-xs">({slot.day})</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{slot.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
