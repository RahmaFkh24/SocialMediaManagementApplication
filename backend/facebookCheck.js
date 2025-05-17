//run this with "node facebookCheck.js"
// This is a simple script to check if the Facebook connection is working properly or not.
const axios = require('axios');

const verifyFacebookConnection = async () => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${process.env.PAGE_ID}`,
            {
                params: {
                    access_token: process.env.PAGE_ACCESS_TOKEN,
                    fields: 'id,name'
                }
            }
        );

        console.log('Facebook Connection Successful:');
        console.log('Page Name:', response.data.name);
        console.log('Page ID:', response.data.id);
    } catch (error) {
        console.error('Facebook Connection Failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data.error);
    }
};

verifyFacebookConnection();