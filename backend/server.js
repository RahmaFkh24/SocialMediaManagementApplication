require('dotenv').config({ path: './.env' });
const express = require('express');
const colors = require('colors');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const axios = require('axios');

const port = process.env.PORT || 5000;

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

// Enhanced Facebook Graph API Client
const facebookClient = {
    get: async (endpoint, params = {}) => {
        try {
            const response = await axios.get(
                `https://graph.facebook.com/v19.0/${endpoint}`,
                {
                    params: {
                        access_token: process.env.PAGE_ACCESS_TOKEN,
                        ...params
                    },
                    timeout: 10000
                }
            );
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Facebook API Error';
            const errorCode = error.response?.data?.error?.code || 500;
            throw new Error(`${errorCode}: ${errorMessage}`);
        }
    }
};

// Analytics Endpoints
app.get('/api/analytics/overview', async (req, res, next) => {
    try {
        const [pageInfo, insights] = await Promise.all([
            facebookClient.get(process.env.PAGE_ID, {
                fields: 'followers_count,posts.limit(1){created_time}'
            }),
            facebookClient.get(`${process.env.PAGE_ID}/insights`, {
                metric: 'page_fans,page_post_engagements',
                period: 'week'
            })
        ]);

        res.json({
            success: true,
            data: {
                followers: pageInfo.followers_count || 0,
                posts: pageInfo.posts?.data?.length || 0,
                engagement: insights.data[0]?.values[0]?.value || 0,
                reach: insights.data[1]?.values[0]?.value || 0
            }
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/analytics/engagement', async (req, res, next) => {
    try {
        const { data } = await facebookClient.get(
            `${process.env.PAGE_ID}/insights`,
            {
                metric: [
                    'page_post_engagements',
                    'page_actions_post_reactions_like_total',
                    'page_actions_post_reactions_comment_total',
                    'page_actions_post_reactions_share_total'
                ].join(','),
                period: 'week'
            }
        );

        res.json({
            success: true,
            data: {
                total: data[0].values[0].value,
                likes: data[1].values[0].value,
                comments: data[2].values[0].value,
                shares: data[3].values[0].value
            }
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/analytics/audience', async (req, res, next) => {
    try {
        const { data } = await facebookClient.get(
            `${process.env.PAGE_ID}/insights`,
            {
                metric: 'page_fans_gender_age',
                period: 'lifetime'
            }
        );

        const demographics = data[0].values[0].value
            .reduce((acc, { key, value }) => {
                const [gender, age] = key.split('.');
                acc[gender] = acc[gender] || [];
                acc[gender].push({ age, value });
                return acc;
            }, {});

        res.json({
            success: true,
            data: demographics
        });
    } catch (error) {
        next(error);
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