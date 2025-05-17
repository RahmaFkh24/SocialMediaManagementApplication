import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, Image, Video, Link2, Type } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useFacebookApi from '@/hooks/useFacebookApi';

const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const ContentTab = () => {
    const { data: contentData, loading, error } = useFacebookApi('content');

    if (loading) return <div className="flex justify-center p-8 text-muted-foreground">Loading content data...</div>;
    if (error) return <div className="flex justify-center p-8 text-destructive">Error: {error}</div>;

    // Extract data with fallback to hardcoded if API data is unavailable
    const { postsOverTime = [], contentTypes = [] } = contentData?.data || {};

    // Fallback data if API returns empty
    const postsOverTimeData = postsOverTime.length > 0 ? postsOverTime : [
        { name: 'Mon', posts: 0 }, { name: 'Tue', posts: 0 }, { name: 'Wed', posts: 0 },
        { name: 'Thu', posts: 0 }, { name: 'Fri', posts: 0 }, { name: 'Sat', posts: 0 }, { name: 'Sun', posts: 0 }
    ];

    const contentTypesData = contentTypes.length > 0 ? contentTypes : [
        { name: 'Photos', value: 0, icon: 'Image', color: '#0088FE' },
        { name: 'Videos', value: 0, icon: 'Video', color: '#00C49F' },
        { name: 'Links', value: 0, icon: 'Link2', color: '#FFBB28' },
        { name: 'Text', value: 0, icon: 'Type', color: '#FF8042' }
    ];

    // Map icon strings to components
    const iconMap = {
        Image: Image,
        Video: Video,
        Link2: Link2,
        Type: Type
    };

    return (
        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center">
                                        <FileText className="mr-2 h-5 w-5 text-indigo-500" />
                                        Content Performance
                                    </CardTitle>
                                    <CardDescription>Posts over time</CardDescription>
                                </div>
                                <Tabs defaultValue="weekly" className="w-[180px]">
                                    <TabsList className="grid w-full grid-cols-2 text-xs h-8">
                                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="weekly">
                                <TabsContent value="weekly">
                                    {postsOverTimeData.every(d => d.posts === 0) ? (
                                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                            No posts data available
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart
                                                data={postsOverTimeData}
                                                margin={{ top: 5, right: 0, left: -25, bottom: 5 }}
                                            >
                                                <XAxis
                                                    dataKey="name"
                                                    stroke="hsl(var(--muted-foreground))"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="hsl(var(--muted-foreground))"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--background))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: 'var(--radius)'
                                                    }}
                                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                                    cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.3 }}
                                                />
                                                <Bar dataKey="posts" name="Posts Published" radius={[4, 4, 0, 0]} barSize={30}>
                                                    {postsOverTimeData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-pot-${index}`}
                                                            fill={contentTypesData[index % contentTypesData.length].color}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </TabsContent>
                                <TabsContent value="monthly">
                                    <div className="h-[300px] flex items-center justify-center text-muted-foreground italic">
                                        Monthly posts data coming soon.
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Type className="mr-2 h-5 w-5 text-orange-500" />
                                Content Types
                            </CardTitle>
                            <CardDescription>Performance by content format</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {contentTypesData.length === 0 || contentTypesData.every(t => t.value === 0) ? (
                                <div className="text-center text-muted-foreground">No content type data available</div>
                            ) : (
                                contentTypesData.map((type) => {
                                    const IconComponent = iconMap[type.icon];
                                    return (
                                        <div key={type.name}>
                                            <div className="flex justify-between text-sm mb-1 items-center">
                                                <span className="flex items-center">
                                                    <IconComponent className="h-4 w-4 mr-2" style={{ color: type.color }} />
                                                    {type.name}
                                                </span>
                                                <span>{type.value}%</span>
                                            </div>
                                            <Progress
                                                value={type.value}
                                                style={{ '--progress-indicator-color': type.color }}
                                                indicatorClassName="transition-all"
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ContentTab;