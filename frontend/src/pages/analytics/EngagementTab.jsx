import React from 'react';
import { motion } from 'framer-motion';
import MetricCard from '@/components/MetricCard';
import { ThumbsUp, MessageSquare, Share2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import AnimatedCounter from '@/components/AnimatedCounter';
import useFacebookApi from '@/hooks/useFacebookApi';

// Use consistent color format (hex) for animations
const COLORS = {
  total: '#FF8042', // New color for total engagements
  likes: '#0088FE',
  comments: '#00C49F',
  shares: '#FFBB28',
  background: '#ffffff',
  text: '#000000'
};

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

const EngagementTab = () => {
  const { data: engagementData, loading, error } = useFacebookApi('engagement');

  if (loading) return (
    <div className="flex justify-center items-center p-8 text-muted-foreground">
      Loading engagement data...
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center p-8 text-destructive">
      Error: {error}
    </div>
  );

  const { total, likes, comments, shares, trends } = engagementData?.data || { total: 0, likes: 0, comments: 0, shares: 0, trends: [] };

  // Calculate percentage changes
  const calculateChange = (current, previous = 0) => {
    if (!previous) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Calculate change for total (compare latest trend to previous)
  const totalChange = trends && trends.length >= 2
    ? calculateChange(total, trends[trends.length - 2].total)
    : '+0%';

  const engagementMetrics = {
    total: total || 0,
    totalChange,
    likes: likes || 0,
    likesChange: calculateChange(likes),
    comments: comments || 0,
    commentsChange: calculateChange(comments),
    shares: shares || 0,
    sharesChange: calculateChange(shares),
  };

  const engagementBreakdownData = [
    { name: 'Total Impressions', value: total || 0, color: COLORS.total },
    { name: 'Likes', value: likes || 0, color: COLORS.likes },
    { name: 'Comments', value: comments || 0, color: COLORS.comments },
    { name: 'Shares', value: shares || 0, color: COLORS.shares }
  ];

  // Calculate percentages for the breakdown
  const totalEngagement = engagementBreakdownData.reduce((sum, item) => sum + item.value, 0);
  const engagementBreakdownPercentages = engagementBreakdownData.map(item => ({
    ...item,
    value: totalEngagement ? Math.round((item.value / totalEngagement) * 100) : 0
  }));

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
      style={{ backgroundColor: COLORS.background }}
    >
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Impressions"
          value={<AnimatedCounter to={engagementMetrics.total} />}
          icon={Activity}
          change={engagementMetrics.totalChange}
          delay={0}
          style={{ color: COLORS.total }}
        />
        <MetricCard
          title="Likes"
          value={<AnimatedCounter to={engagementMetrics.likes} />}
          icon={ThumbsUp}
          change={engagementMetrics.likesChange}
          delay={1}
          style={{ color: COLORS.likes }}
        />
        <MetricCard
          title="Comments"
          value={<AnimatedCounter to={engagementMetrics.comments} />}
          icon={MessageSquare}
          change={engagementMetrics.commentsChange}
          delay={2}
          style={{ color: COLORS.comments }}
        />
        <MetricCard
          title="Shares"
          value={<AnimatedCounter to={engagementMetrics.shares} />}
          icon={Share2}
          change={engagementMetrics.sharesChange}
          delay={3}
          style={{ color: COLORS.shares }}
        />
      </motion.div>

      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-4">
          <TabsTrigger value="breakdown">Engagement Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Engagement Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Distribution</CardTitle>
              <CardDescription>Breakdown of engagement types over the last week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={engagementBreakdownPercentages}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {engagementBreakdownPercentages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>Daily engagement metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trends || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: COLORS.text }}
                      stroke={COLORS.text}
                    />
                    <YAxis
                      tick={{ fill: COLORS.text }}
                      stroke={COLORS.text}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: COLORS.background,
                        border: `1px solid ${COLORS.text}`,
                        color: COLORS.text
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke={COLORS.total}
                      name="Total Impressions"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="likes"
                      stroke={COLORS.likes}
                      name="Likes"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="comments"
                      stroke={COLORS.comments}
                      name="Comments"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="shares"
                      stroke={COLORS.shares}
                      name="Shares"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EngagementTab;