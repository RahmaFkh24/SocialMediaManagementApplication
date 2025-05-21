require('dotenv').config({ path: './.env' });
const express = require('express');
const colors = require('colors');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const axios = require('axios');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const port = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = ['PAGE_ACCESS_TOKEN', 'PAGE_ID', 'FB_APP_ID', 'FB_APP_SECRET', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(colors.red('Missing required environment variables:'));
    missingEnvVars.forEach(envVar => {
        console.error(colors.red(`- ${envVar}`));
    });
    process.exit(1);
}

// Database connection
connectDB();

const app = express();

// Middleware configuration
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// MongoDB Schema for Accounts
const accountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    platform: { type: String, required: true },
    facebookId: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String },
    accessToken: { type: String, required: true },
    status: { type: String, default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

const Account = mongoose.model('Account', accountSchema);

// Passport Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_APP_SECRET,
    callbackURL: 'http://localhost:5000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos'],
    scope: ['pages_messaging', 'pages_read_engagement', 'pages_show_list']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Placeholder userId for development; in production, extract from JWT
        const userId = process.env.NODE_ENV === 'development' ? '67fffab1c369bf68cde43ad7' : null;
        if (!userId) {
            return done(new Error('User not authenticated'));
        }

        // Fetch pages the user manages
        const response = await axios.get('https://graph.facebook.com/v22.0/me/accounts', {
            params: {
                access_token: accessToken,
                fields: 'id,name,picture,access_token'
            }
        });

        const pages = response.data.data;
        if (!pages || pages.length === 0) {
            return done(new Error('No pages found for this account'));
        }

        // Store or update each page as an account
        for (const page of pages) {
            const existingAccount = await Account.findOne({ facebookId: page.id });
            if (existingAccount) {
                existingAccount.accessToken = page.access_token || accessToken;
                existingAccount.name = page.name;
                existingAccount.avatar = page.picture?.data?.url;
                existingAccount.status = 'Active';
                await existingAccount.save();
            } else {
                await Account.create({
                    userId,
                    platform: 'Facebook',
                    facebookId: page.id,
                    name: page.name,
                    avatar: page.picture?.data?.url,
                    accessToken: page.access_token || accessToken,
                    status: 'Active'
                });
            }
        }

        return done(null, profile);
    } catch (error) {
        return done(error);
    }
}));

// Enhanced Facebook Graph API Client with validation
const facebookClient = {
    get: async (endpoint, params = {}) => {
        try {
            if (!process.env.PAGE_ACCESS_TOKEN) {
                throw new Error('Facebook Page Access Token is not configured');
            }
            if (!process.env.PAGE_ID) {
                throw new Error('Facebook Page ID is not configured');
            }

            const token = process.env.PAGE_ACCESS_TOKEN.trim();
            if (!token.startsWith('EAA')) {
                throw new Error('Invalid Facebook Page Access Token format. Token should start with "EAA"');
            }

            console.log('Token validation:', {
                hasToken: !!token,
                tokenLength: token.length,
                tokenPrefix: token.substring(0, 4) + '...',
                pageId: process.env.PAGE_ID
            });

            let pageAccessToken = token;
            let pageInfo;
            try {
                const accountsResponse = await axios.get(
                    `https://graph.facebook.com/v22.0/me/accounts`,
                    {
                        params: {
                            access_token: token,
                            fields: 'id,name,access_token'
                        }
                    }
                );

                if (!accountsResponse.data.data || accountsResponse.data.data.length === 0) {
                    throw new Error('No Facebook pages found for this token. Please use a token with page access.');
                }

                const targetPage = accountsResponse.data.data.find(page => page.id === process.env.PAGE_ID);
                if (!targetPage) {
                    console.error('Available pages:', accountsResponse.data.data.map(p => ({ id: p.id, name: p.name })));
                    throw new Error(`Page ID ${process.env.PAGE_ID} not found in available pages. Please check your Page ID or use a token with access to this page.`);
                }

                pageInfo = targetPage;
                console.log('Token validation successful:', {
                    pageName: pageInfo.name,
                    pageId: pageInfo.id
                });

                pageAccessToken = pageInfo.access_token;
            } catch (tokenError) {
                console.error('Token validation failed:', {
                    error: tokenError.response?.data?.error || tokenError.message,
                    status: tokenError.response?.status
                });
                throw new Error(tokenError.message || 'Invalid or expired Facebook Access Token');
            }

            console.log(`Making Facebook API request to: ${endpoint}`);
            console.log('Request params:', JSON.stringify(params, null, 2));

            const response = await axios.get(
                `https://graph.facebook.com/v22.0/${endpoint}`,
                {
                    params: {
                        access_token: pageAccessToken,
                        ...params
                    },
                    timeout: 10000
                }
            );

            console.log('Facebook API response status:', response.status);
            return response.data;
        } catch (error) {
            console.error('Facebook API Error:', {
                endpoint,
                params,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            const errorMessage = error.response?.data?.error?.message || error.message || 'Facebook API Error';
            const errorCode = error.response?.data?.error?.code || 500;
            throw new Error(`${errorCode}: ${errorMessage}`);
        }
    },
    post: async (endpoint, data = {}, params = {}) => {
        try {
            if (!process.env.PAGE_ACCESS_TOKEN) {
                throw new Error('Facebook Page Access Token is not configured');
            }
            if (!process.env.PAGE_ID) {
                throw new Error('Facebook Page ID is not configured');
            }

            const token = process.env.PAGE_ACCESS_TOKEN.trim();
            if (!token.startsWith('EAA')) {
                throw new Error('Invalid Facebook Page Access Token format. Token should start with "EAA"');
            }

            console.log('Token validation for POST:', {
                hasToken: !!token,
                tokenLength: token.length,
                tokenPrefix: token.substring(0, 4) + '...',
                pageId: process.env.PAGE_ID
            });

            let pageAccessToken = token;
            let pageInfo;
            try {
                const accountsResponse = await axios.get(
                    `https://graph.facebook.com/v22.0/me/accounts`,
                    {
                        params: {
                            access_token: token,
                            fields: 'id,name,access_token'
                        }
                    }
                );

                if (!accountsResponse.data.data || accountsResponse.data.data.length === 0) {
                    throw new Error('No Facebook pages found for this token.');
                }

                const targetPage = accountsResponse.data.data.find(page => page.id === process.env.PAGE_ID);
                if (!targetPage) {
                    console.error('Available pages:', accountsResponse.data.data.map(p => ({ id: p.id, name: p.name })));
                    throw new Error(`Page ID ${process.env.PAGE_ID} not found.`);
                }

                pageInfo = targetPage;
                console.log('Token validation successful:', {
                    pageName: pageInfo.name,
                    pageId: pageInfo.id
                });

                pageAccessToken = pageInfo.access_token;
            } catch (tokenError) {
                console.error('Token validation failed:', {
                    error: tokenError.response?.data?.error || tokenError.message,
                    status: tokenError.response?.status
                });
                throw new Error(tokenError.message || 'Invalid or expired Facebook Access Token');
            }

            console.log(`Making Facebook API POST request to: ${endpoint}`);
            console.log('Request data:', JSON.stringify(data, null, 2));

            const response = await axios.post(
                `https://graph.facebook.com/v22.0/${endpoint}`,
                data,
                {
                    params: {
                        access_token: pageAccessToken,
                        ...params
                    },
                    timeout: 10000
                }
            );

            console.log('Facebook API POST response status:', response.status);
            return response.data;
        } catch (error) {
            console.error('Facebook API POST Error:', {
                endpoint,
                data,
                params,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            const errorMessage = error.response?.data?.error?.message || error.message || 'Facebook API Error';
            const errorCode = error.response?.data?.error?.code || 500;
            throw new Error(`${errorCode}: ${errorMessage}`);
        }
    }
};

// Facebook OAuth Routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { session: false }), (req, res) => {
    // Redirect back to frontend with success
    res.redirect('http://localhost:5173/accounts?success=true');
});
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const userId = process.env.NODE_ENV === 'development' ? '67fffab1c369bf68cde43ad7' : null;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        let user = await User.findById(userId);
        if (!user) {
            user = await User.create({
                _id: userId,
                email: 'test@example.com', // Replace with actual user email if available
                subscription: { status: 'inactive' }
            });
        }

        let customerId = user.subscription.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: userId.toString() }
            });
            customerId = customer.id;
            user.subscription.stripeCustomerId = customerId;
            await user.save();
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{
                price: 'price_1RNuaaCiykpQ4EXWtvRnnxE1',
                quantity: 1
            }],
            mode: 'subscription',
            subscription_data: {
                trial_period_days: 7,
                trial_settings: {
                    end_behavior: { missing_payment_method: 'cancel' }
                }
            },
            success_url: `${process.env.FRONTEND_URL}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout?canceled=true`,
            metadata: { userId: userId.toString() }
        });

        res.json({ success: true, url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                const subscription = event.data.object;
                const userId = subscription.metadata.userId;
                const user = await User.findById(userId);
                if (user) {
                    user.subscription = {
                        status: subscription.status,
                        stripeCustomerId: subscription.customer,
                        stripeSubscriptionId: subscription.id,
                        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
                    };
                    await user.save();
                    console.log(`Updated subscription for user ${userId}: ${subscription.status}`);
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send(`Webhook Error: ${error.message}`);
    }
});
// Account Management Endpoints
app.get('/api/accounts', async (req, res) => {
    try {
        // Placeholder userId for development; in production, extract from JWT
        const userId = process.env.NODE_ENV === 'development' ? '67fffab1c369bf68cde43ad7' : null;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const accounts = await Account.find({ userId });
        res.json(accounts);
    } catch (error) {
        console.error('Error in /api/accounts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/accounts/:id', async (req, res) => {
    try {
        const userId = process.env.NODE_ENV === 'development' ? '67fffab1c369bf68cde43ad7' : null;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const account = await Account.findOneAndDelete({ _id: req.params.id, userId });
        if (!account) {
            return res.status(404).json({ success: false, error: 'Account not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error in /api/accounts/:id:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});




// Facebook Posts Endpoint

app.get('/api/analytics/posts', async (req, res) => {
    try {
        const postsResponse = await facebookClient.get(`/${process.env.PAGE_ID}/posts`, {
            params: {
                fields: 'id,message,created_time,full_picture,permalink_url',
                limit: 10 // Or any number you prefer
            }
        });

        const posts = postsResponse.data?.data || [];

        res.json({
            success: true,
            data: posts
        });

    } catch (error) {
        console.error('Error fetching Facebook posts:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Comments Endpoint
app.get('/api/comments', async (req, res, next) => {
    try {
        const response = await facebookClient.get(`${process.env.PAGE_ID}/posts`, {
            fields: 'id,created_time,message,comments{message,from,created_time,id}'
        });
        const comments = response.data?.flatMap(post => post.comments?.data || []) || [];
        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Error in /api/comments:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                facebookError: error.response?.data?.error
            }
        });
    }
});

// Messages Endpoint
app.get('/api/messages', async (req, res, next) => {
    try {
        const response = await facebookClient.get(`${process.env.PAGE_ID}/conversations`, {
            fields: 'id,messages{message,from,created_time},participants'
        });
        res.json({
            success: true,
            data: response.data || []
        });
    } catch (error) {
        console.error('Error in /api/messages:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                facebookError: error.response?.data?.error
            }
        });
    }
});

// Reply Endpoint
app.post('/api/reply/:type/:id', async (req, res, next) => {
    const { type, id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({
            success: false,
            error: { message: 'Reply message cannot be empty' }
        });
    }

    try {
        const endpoint = type === 'message' ? `${id}/messages` : `${id}/comments`;
        await facebookClient.post(endpoint, { message });
        res.json({ success: true });
    } catch (error) {
        console.error(`Error in /api/reply/${type}/${id}:`, error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                facebookError: error.response?.data?.error
            }
        });
    }
});


// Analytics Endpoints
app.get('/api/analytics/overview', async (req, res, next) => {
    try {
        let followersCount = 0;
        try {
            const pageInfo = await facebookClient.get(process.env.PAGE_ID, {
                fields: 'followers_count'
            });
            followersCount = pageInfo.followers_count || 0;
        } catch (pageError) {
            console.warn('Failed to fetch followers_count:', pageError.message);
        }

        const metrics = ['page_impressions', 'page_fans'];
        const currentMetrics = {};
        for (const metric of metrics) {
            try {
                const insight = await facebookClient.get(`${process.env.PAGE_ID}/insights`, {
                    metric,
                    period: 'week'
                });
                currentMetrics[metric] = insight.data[0]?.values[0]?.value || 0;
            } catch (insightError) {
                console.warn(`Failed to fetch ${metric}:`, insightError.message);
                currentMetrics[metric] = 0;
            }
        }

        currentMetrics.page_fans = currentMetrics.page_fans || followersCount;

        const previousMetrics = {};
        for (const metric of metrics) {
            try {
                const insight = await facebookClient.get(`${process.env.PAGE_ID}/insights`, {
                    metric,
                    period: 'week',
                    since: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    until: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
                previousMetrics[metric] = insight.data[0]?.values[0]?.value || 0;
            } catch (insightError) {
                console.warn(`Failed to fetch previous ${metric}:`, insightError.message);
                previousMetrics[metric] = 0;
            }
        }
        previousMetrics.page_fans = previousMetrics.page_fans || followersCount;

        let chartData = [];
        try {
            const dailyImpressions = await facebookClient.get(`${process.env.PAGE_ID}/insights`, {
                metric: 'page_impressions',
                period: 'day',
                since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                until: new Date().toISOString().split('T')[0]
            });
            chartData = dailyImpressions.data
                .find((d) => d.name === 'page_impressions')
                ?.values.map((value, index) => ({
                    name: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                        weekday: 'short'
                    }),
                    impressions: value.value || 0
                })) || [];
        } catch (chartError) {
            console.warn('Failed to fetch daily page_impressions:', chartError.message);
        }

        const calculateTrend = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            const change = ((current - previous) / previous) * 100;
            return Number(change.toFixed(1));
        };

        const stats = [
            {
                title: 'Total Impressions',
                value: currentMetrics.page_impressions || 0,
                change: calculateTrend(currentMetrics.page_impressions || 0, previousMetrics.page_impressions || 0),
                trend: (currentMetrics.page_impressions || 0) >= (previousMetrics.page_impressions || 0) ? 'up' : 'down'
            },
            {
                title: 'Page Likes',
                value: currentMetrics.page_fans || 0,
                change: calculateTrend(currentMetrics.page_fans || 0, previousMetrics.page_fans || 0),
                trend: (currentMetrics.page_fans || 0) >= (previousMetrics.page_fans || 0) ? 'up' : 'down'
            }
        ];

        res.json({
            success: true,
            data: {
                stats,
                chartData
            }
        });
    } catch (error) {
        console.error('Error in /api/analytics/overview:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                facebookError: error.response?.data?.error
            }
        });
    }
});

app.get('/api/analytics/engagement', async (req, res, next) => {
    try {
        console.log('Fetching engagement data...');
        console.log('Fetching current week data...');
        const currentWeekData = await facebookClient.get(
            `${process.env.PAGE_ID}/insights`,
            {
                metric: ['page_impressions'].join(','),
                period: 'week'
            }
        );
        console.log('Current week data received:', JSON.stringify(currentWeekData, null, 2));

        if (!currentWeekData.data || currentWeekData.data.length === 0) {
            console.warn('No insights data available for the requested metrics');
            return res.json({
                success: true,
                data: {
                    total: 0,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    trends: []
                }
            });
        }

        console.log('Fetching historical data...');
        const historicalData = await facebookClient.get(
            `${process.env.PAGE_ID}/insights`,
            {
                metric: ['page_impressions'].join(','),
                period: 'day',
                since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                until: new Date().toISOString().split('T')[0]
            }
        );
        console.log('Historical data received:', JSON.stringify(historicalData, null, 2));

        const processMetricsData = (data) => {
            const metrics = {
                total: 0,
                likes: 0,
                comments: 0,
                shares: 0
            };

            data.forEach(metric => {
                switch (metric.name) {
                    case 'page_impressions':
                        metrics.total = metric.values[0]?.value || 0;
                        break;
                }
            });

            return metrics;
        };

        const currentMetrics = processMetricsData(currentWeekData.data);

        const trends = [];
        if (!historicalData.data || !historicalData.data[0]?.values) {
            console.error('Invalid historical data structure:', historicalData);
            return res.json({
                success: true,
                data: {
                    total: currentMetrics.total,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    trends: []
                }
            });
        }

        const dates = historicalData.data[0].values.map(v => v.end_time.split('T')[0]);
        dates.forEach(date => {
            trends.push({
                date,
                likes: 0,
                comments: 0,
                shares: 0,
                total: 0
            });
        });

        historicalData.data.forEach((metric) => {
            metric.values.forEach((value) => {
                const date = value.end_time.split('T')[0];
                const trendIndex = trends.findIndex(t => t.date === date);
                if (trendIndex !== -1) {
                    switch (metric.name) {
                        case 'page_impressions':
                            trends[trendIndex].total = value.value || 0;
                            break;
                    }
                }
            });
        });

        const response = {
            success: true,
            data: {
                total: currentMetrics.total,
                likes: currentMetrics.likes,
                comments: currentMetrics.comments,
                shares: currentMetrics.shares,
                trends: trends.sort((a, b) => new Date(a.date) - new Date(b.date))
            }
        };

        console.log('Sending response:', JSON.stringify(response, null, 2));
        res.json(response);
    } catch (error) {
        console.error('Error in /api/analytics/engagement:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });

        let availableMetrics;
        try {
            console.log('Attempting to fetch available metrics...');
            availableMetrics = await facebookClient.get(
                `${process.env.PAGE_ID}/insights`,
                {
                    metric: 'page_impressions',
                    period: 'week'
                }
            );
            console.log('Available metrics response:', JSON.stringify(availableMetrics, null, 2));
        } catch (metricsError) {
            console.error('Error fetching available metrics:', metricsError.message);
        }

        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                facebookError: error.response?.data?.error,
                availableData: availableMetrics?.data
            }
        });
    }
});

app.get('/api/analytics/audience', async (req, res, next) => {
    try {
        let totalFans = 0;
        try {
            const fansData = await facebookClient.get(`${process.env.PAGE_ID}`, {
                fields: 'followers_count'
            });
            totalFans = fansData.followers_count || 0;
            console.log('Followers count:', totalFans);
        } catch (fansError) {
            console.warn('Failed to fetch followers_count:', fansError.message);
        }

        let countryDistribution = {};
        try {
            const countryData = await facebookClient.get(`${process.env.PAGE_ID}/insights`, {
                metric: 'page_fans_country',
                period: 'lifetime'
            });
            countryDistribution = countryData.data.find(d => d.name === 'page_fans_country')?.values[0]?.value || {};
            console.log('Country distribution:', countryDistribution);
        } catch (countryError) {
            console.warn('Failed to fetch page_fans_country:', countryError.message);
        }

        let genderAgeDistribution = {};
        try {
            if (totalFans >= 100) {
                const genderAgeData = await facebookClient.get(`${process.env.PAGE_ID}/insights`, {
                    metric: 'page_fans_gender_age',
                    period: 'lifetime'
                });
                genderAgeDistribution = genderAgeData.data.find(d => d.name === 'page_fans_gender_age')?.values[0]?.value || {};
                console.log('Gender age distribution:', genderAgeDistribution);
            } else {
                console.log('Skipping page_fans_gender_age: followers_count < 100');
            }
        } catch (genderAgeError) {
            console.warn('Failed to fetch page_fans_gender_age:', genderAgeError.message);
        }

        res.json({
            success: true,
            data: {
                totalFans,
                countryDistribution,
                genderAgeDistribution
            }
        });
    } catch (error) {
        console.error('Error in /api/analytics/audience:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                facebookError: error.response?.data?.error
            }
        });
    }
});

app.get('/api/analytics/content', async (req, res, next) => {
    try {
        let postsData = { data: [] };
        try {
            postsData = await facebookClient.get(`${process.env.PAGE_ID}/posts`, {
                fields: 'id,created_time,attachments{media_type},message',
                since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                until: new Date().toISOString().split('T')[0],
                limit: 100
            });
        } catch (postsError) {
            console.warn('Failed to fetch posts:', postsError.message);
        }

        const postsOverTime = [];
        const days = Array(7).fill(0).map((_, i) => {
            const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
            return {
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.toISOString().split('T')[0],
                posts: 0
            };
        });

        postsData.data.forEach(post => {
            const postDate = new Date(post.created_time).toISOString().split('T')[0];
            const day = days.find(d => d.date === postDate);
            if (day) day.posts += 1;
        });

        postsOverTime.push(...days.map(({ name, posts }) => ({ name, posts })));

        const contentTypes = {
            Photos: 0,
            Videos: 0,
            Links: 0,
            Text: 0
        };

        postsData.data.forEach(post => {
            const attachment = post.attachments?.data[0];
            if (attachment?.media_type === 'photo') {
                contentTypes.Photos += 1;
            } else if (attachment?.media_type === 'video') {
                contentTypes.Videos += 1;
            } else if (attachment?.media_type === 'link' || post.message?.includes('http')) {
                contentTypes.Links += 1;
            } else {
                contentTypes.Text += 1;
            }
        });

        const totalPosts = Object.values(contentTypes).reduce((sum, val) => sum + val, 0);
        const contentTypesData = [
            { name: 'Photos', value: totalPosts ? Number(((contentTypes.Photos / totalPosts) * 100).toFixed(1)) : 0, icon: 'Image', color: '#0088FE' },
            { name: 'Videos', value: totalPosts ? Number(((contentTypes.Videos / totalPosts) * 100).toFixed(1)) : 0, icon: 'Video', color: '#00C49F' },
            { name: 'Links', value: totalPosts ? Number(((contentTypes.Links / totalPosts) * 100).toFixed(1)) : 0, icon: 'Link2', color: '#FFBB28' },
            { name: 'Text', value: totalPosts ? Number(((contentTypes.Text / totalPosts) * 100).toFixed(1)) : 0, icon: 'Type', color: '#FF8042' }
        ].filter(type => type.value > 0);

        res.json({
            success: true,
            data: {
                postsOverTime,
                contentTypes: contentTypesData
            }
        });
    } catch (error) {
        console.error('Error in /api/analytics/content:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                facebookError: error.response?.data?.error
            }
        });
    }
});



// GET /api/posts
app.get('/api/posts', async (req, res) => {
    try {
        const response = await facebookClient.get(`${process.env.PAGE_ID}/posts`, {
            fields: 'id,message,created_time,attachments{media,type,url}'
        });

        const posts = response.data?.flatMap(post => {
            // Sécurité : skip si post est nul
            if (!post || typeof post !== 'object') return [];

            return [{
                id: post.id,
                message: post.message || '',
                created_time: post.created_time,
                media_url: post.attachments?.data?.[0]?.media?.image?.src || null
            }];
        }) || [];

        res.json({
            success: true,
            data: posts
        });

    } catch (error) {
        console.error('Error in /api/posts:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                facebookError: error.response?.data?.error
            }
        });
    }
});


app.get('/api/analytics/dashboard', async (req, res, next) => {
    try {
        let postsData = { data: [] };
        let previousPostsData = { data: [] };
        try {
            postsData = await facebookClient.get(`${process.env.PAGE_ID}/posts`, {
                fields: 'id,created_time',
                since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                until: new Date().toISOString().split('T')[0],
                limit: 100
            });
            previousPostsData = await facebookClient.get(`${process.env.PAGE_ID}/posts`, {
                fields: 'id,created_time',
                since: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                until: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                limit: 100
            });
            console.log('Posts data:', { current: postsData.data.length, previous: previousPostsData.data.length });
        } catch (postsError) {
            console.warn('Failed to fetch posts:', postsError.message);
        }

        const totalPosts = postsData.data.length;
        const previousTotalPosts = previousPostsData.data.length;
        const calculateTrend = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            const change = ((current - previous) / previous) * 100;
            return Number(change.toFixed(1));
        };
        const postsTrend = {
            change: calculateTrend(totalPosts, previousTotalPosts),
            trend: totalPosts >= previousTotalPosts ? 'up' : 'down'
        };

        let scheduledToday = 0;
        try {
            const today = new Date().toISOString().split('T')[0];
            const scheduledPosts = await facebookClient.get(`${process.env.PAGE_ID}/scheduled_posts`, {
                fields: 'id,scheduled_publish_time',
                limit: 50
            });
            scheduledToday = scheduledPosts.data.filter(post => {
                const postDate = new Date(post.scheduled_publish_time).toISOString().split('T')[0];
                return postDate === today;
            }).length;
            console.log('Scheduled posts today:', scheduledToday);
        } catch (scheduledError) {
            console.warn('Failed to fetch scheduled_posts:', scheduledError.message);
        }

        let engagementPeak = 0;
        try {
            const postsWithInsights = await facebookClient.get(`${process.env.PAGE_ID}/posts`, {
                fields: 'id,insights.metric(post_impressions,post_engaged_users)',
                since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                until: new Date().toISOString().split('T')[0],
                limit: 100
            });
            engagementPeak = postsWithInsights.data.reduce((max, post) => {
                const impressions = post.insights?.data.find(d => d.name === 'post_impressions')?.values[0]?.value || 0;
                const engagedUsers = post.insights?.data.find(d => d.name === 'post_engaged_users')?.values[0]?.value || 0;
                const rate = impressions > 0 ? (engagedUsers / impressions) * 100 : 0;
                return Math.max(max, rate);
            }, 0);
            engagementPeak = Number(engagementPeak.toFixed(1));
            console.log('Engagement peak:', engagementPeak);
        } catch (insightsError) {
            console.warn('Failed to fetch post insights:', insightsError.message);
        }

        let engagementChartData = [];
        try {
            const dailyEngagement = await facebookClient.get(`${process.env.PAGE_ID}/insights`, {
                metric: 'page_impressions',
                period: 'day',
                since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                until: new Date().toISOString().split('T')[0]
            });
            engagementChartData = dailyEngagement.data
                .find(d => d.name === 'page_impressions')
                ?.values.map((value, index) => ({
                    name: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                    Facebook: value.value || 0
                })) || [];
            console.log('Engagement chart data:', engagementChartData);
        } catch (chartError) {
            console.warn('Failed to fetch daily page_impressions:', chartError.message);
            engagementChartData = Array(7).fill(0).map((_, i) => ({
                name: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                Facebook: 0
            }));
        }

        res.json({
            success: true,
            data: {
                totalPosts: {
                    value: totalPosts,
                    change: postsTrend.change,
                    trend: postsTrend.trend
                },
                scheduledToday: {
                    value: scheduledToday,
                    change: 0,
                    trend: 'up'
                },
                engagementPeak: {
                    value: engagementPeak,
                    change: 0,
                    trend: 'up'
                },
                engagementChartData
            }
        });
    } catch (error) {
        console.error('Error in /api/analytics/dashboard:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                facebookError: error.response?.data?.error
            }
        });
    }
});

// Existing routes
app.use('/api/users', require('./routes/userRoutes'));

// Central error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    if (process.env.NODE_ENV === 'development') {
        console.error(colors.red(`[ERROR] ${statusCode}: ${message}`));
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        error: {
            code: statusCode,
            message: message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    });
});

app.listen(port, () => {
    console.log(colors.yellow(`Server running in ${process.env.NODE_ENV} mode on port ${port}`));
});