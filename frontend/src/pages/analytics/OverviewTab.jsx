import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, Heart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import useFacebookApi from '@/hooks/useFacebookApi';

const OverviewTab = () => {
    const { data: insights, loading, error } = useFacebookApi('overview');

    if (loading) return <div className="flex justify-center p-8 text-muted-foreground">Loading insights...</div>;
    if (error) return <div className="flex justify-center p-8 text-destructive">Error: {error}</div>;

    // Extract data
    const { stats = [], chartData = [] } = insights?.data || {};

    // Define icons for stats
    const getIcon = (title) => {
        switch (title) {
            case 'Total Impressions':
                return <Eye className="h-6 w-6 text-blue-500" />;
            case 'Page Likes':
                return <Heart className="h-6 w-6 text-red-500" />;
            default:
                return <Eye className="h-6 w-6 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                {getIcon(stat.title)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value || 'N/A'}</div>
                                <p
                                    className={`text-xs ${stat.trend === 'up'
                                            ? 'text-green-500'
                                            : stat.trend === 'down'
                                                ? 'text-red-500'
                                                : 'text-muted-foreground'
                                        }`}
                                >
                                    {stat.change >= 0 ? '+' : ''}{stat.change}% from last week
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5" />
                            Impressions Over Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {chartData.length === 0 ? (
                            <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                                No impressions data available
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `${value} impressions`} />
                                    <Area
                                        type="monotone"
                                        dataKey="impressions"
                                        stroke="#8884d8"
                                        fill="#8884d8"
                                        fillOpacity={0.2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default OverviewTab;