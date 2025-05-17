import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, MapPin, Cake } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import MetricCard from '@/components/MetricCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import useFacebookApi from '@/hooks/useFacebookApi';

// Country code to name mapping
const COUNTRY_NAMES = {
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    DE: 'Germany',
    FR: 'France',
    IN: 'India',
    BR: 'Brazil',
    TN: 'Tunisia',
    Other: 'Other'
};

// Consistent color scheme
const COLORS = {
    female: '#F06292', // Pink for female
    male: '#42A5F5',   // Blue for male
    ageGroups: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
    geographic: ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#0088FE', '#00C49F'],
    background: '#ffffff',
    text: '#000000'
};

const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const AudienceTab = () => {
    const { data: audienceData, loading, error } = useFacebookApi('audience');

    if (loading) return (
        <div className="flex justify-center items-center p-8 text-muted-foreground">
            Loading audience data...
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center p-8 text-destructive">
            Error: {error}
        </div>
    );

    // Extract data
    const { totalFans = 0, fanTrend = { change: 0, trend: 'up' }, demographics = { F: [], M: [] }, countries = [] } = audienceData?.data || {};

    // Prepare age distribution data
    const ageGroups = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
    const ageDistributionData = ageGroups.map((age, index) => {
        const femaleValue = demographics.F?.find(item => item.age === age)?.value || 0;
        const maleValue = demographics.M?.find(item => item.age === age)?.value || 0;
        const totalValue = (femaleValue + maleValue) / (totalFans || 1) * 100; // Percentage
        return {
            name: age,
            value: Number(totalValue.toFixed(1)),
            color: COLORS.ageGroups[index % COLORS.ageGroups.length]
        };
    }).filter(item => item.value > 0);

    // Prepare gender distribution data
    const genderDistributionData = [
        {
            name: 'Female',
            value: demographics.F?.reduce((sum, item) => sum + (item.value || 0), 0) / (totalFans || 1) * 100,
            color: COLORS.female
        },
        {
            name: 'Male',
            value: demographics.M?.reduce((sum, item) => sum + (item.value || 0), 0) / (totalFans || 1) * 100,
            color: COLORS.male
        }
    ].map(item => ({ ...item, value: Number(item.value.toFixed(1)) })).filter(item => item.value > 0);

    // Prepare geographic data
    const geographicData = countries.length > 0 ? countries.map((country, index) => ({
        name: COUNTRY_NAMES[country.name] || country.name,
        value: country.value,
        color: COLORS.geographic[index % COLORS.geographic.length]
    })) : [];

    return (
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
            style={{ backgroundColor: COLORS.background }}
        >
            {/* Total Audience Metric Card */}
            <motion.div variants={itemVariants}>
                <MetricCard
                    title="Total Audience"
                    value={<AnimatedCounter to={totalFans} />}
                    icon={Users}
                    change={`${fanTrend.change >= 0 ? '+' : ''}${fanTrend.change}%`}
                    trend={fanTrend.trend}
                    delay={0}
                    style={{ color: COLORS.text }}
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Cake className="mr-2 h-5 w-5" style={{ color: COLORS.female }} />
                                Audience Demographics
                            </CardTitle>
                            <CardDescription>Age and gender distribution</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium mb-2">Age Distribution</h3>
                                {ageDistributionData.length === 0 ? (
                                    <div className="text-center text-muted-foreground">No age distribution data available</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart
                                            data={ageDistributionData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                        >
                                            <XAxis type="number" hide />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                stroke={COLORS.text}
                                                fontSize={12}
                                                width={50}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: COLORS.background,
                                                    border: `1px solid ${COLORS.text}`,
                                                    color: COLORS.text
                                                }}
                                                formatter={(value) => `${value}%`}
                                            />
                                            <Bar dataKey="value" name="Percentage" radius={[0, 4, 4, 0]} barSize={20}>
                                                {ageDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-age-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-medium mb-2">Gender Distribution</h3>
                                {genderDistributionData.length === 0 ? (
                                    <div className="text-center text-muted-foreground">No gender distribution data available</div>
                                ) : (
                                    genderDistributionData.map((gender, index) => (
                                        <div key={index} className="mb-2">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>{gender.name}</span>
                                                <span>{gender.value}%</span>
                                            </div>
                                            <Progress
                                                value={gender.value}
                                                style={{ '--progress-indicator-color': gender.color }}
                                                indicatorClassName="transition-all"
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="mr-2 h-5 w-5" style={{ color: COLORS.geographic[0] }} />
                                Geographic Distribution
                            </CardTitle>
                            <CardDescription>Where your audience is located</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {geographicData.length === 0 ? (
                                <div className="text-center text-muted-foreground">No geographic data available</div>
                            ) : (
                                <div className="space-y-3 mb-4">
                                    {geographicData.map((geo, index) => (
                                        <div key={geo.name}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="flex items-center">
                                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: geo.color }}></span>
                                                    {geo.name}
                                                </span>
                                                <span>{geo.value}%</span>
                                            </div>
                                            <Progress
                                                value={geo.value}
                                                style={{ '--progress-indicator-color': geo.color }}
                                                indicatorClassName="transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="h-40 bg-muted rounded flex flex-col items-center justify-center text-muted-foreground italic border border-dashed">
                                <MapPin className="h-8 w-8 mb-2" />
                                <span>Detailed Map View Placeholder</span>
                                <span className="font-semibold text-xs mt-1">
                                    {geographicData[0]?.name || 'No Country'} {geographicData[0]?.name ? '🇺🇳' : ''} Highlighted
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AudienceTab;