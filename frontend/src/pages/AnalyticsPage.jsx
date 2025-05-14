
import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from '@/pages/analytics/OverviewTab';
import EngagementTab from '@/pages/analytics/EngagementTab';
import AudienceTab from '@/pages/analytics/AudienceTab';
import ContentTab from '@/pages/analytics/ContentTab';
import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const AnalyticsPage = () => {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Social Media Analytics</h1>
            </motion.div>

            <Tabs defaultValue="overview" className="w-full">
                <motion.div variants={itemVariants}>
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-muted p-1 rounded-lg">
                        <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <BarChart3 className="h-4 w-4" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="engagement" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <TrendingUp className="h-4 w-4" /> Engagement
                        </TabsTrigger>
                        <TabsTrigger value="audience" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Users className="h-4 w-4" /> Audience
                        </TabsTrigger>
                        <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <FileText className="h-4 w-4" /> Content
                        </TabsTrigger>
                    </TabsList>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-6">
                    <TabsContent value="overview">
                        <OverviewTab />
                    </TabsContent>
                    <TabsContent value="engagement">
                        <EngagementTab />
                    </TabsContent>
                    <TabsContent value="audience">
                        <AudienceTab />
                    </TabsContent>
                    <TabsContent value="content">
                        <ContentTab />
                    </TabsContent>
                </motion.div>
            </Tabs>
        </motion.div>
    );
};

export default AnalyticsPage;
