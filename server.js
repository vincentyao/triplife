const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001; // Port for our proxy server

// Enable CORS for requests from our frontend (adjust origin if needed)
// For development, allowing all origins is often okay, but be more specific in production.
app.use(cors());

// Endpoint to handle recommendation requests
app.get('/recommendations', async (req, res) => {
    const destinationName = req.query.destinationName;
    const apiKey = "c66acb647b3d883b051f7eccf8cf3af1024e99143e9f6b0d0242d6c4a317c17c"; // Your SerpApi Key

    if (!destinationName) {
        return res.status(400).json({ error: 'Missing destinationName query parameter' });
    }

    const query = `${destinationName} Destinations`;
    const serpApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKey}`;

    try {
        console.log(`Proxying request for: ${destinationName} to ${serpApiUrl}`);
        const response = await axios.get(serpApiUrl);

        // Check if SerpApi returned top_sights
        if (response.data && response.data.top_sights && Array.isArray(response.data.top_sights.sights)) {
             console.log(`Found ${response.data.top_sights.sights.length} top sights for: ${destinationName}`);
             // Send the whole top_sights object back, as the frontend might need the structure
             res.json(response.data.top_sights);
        } else {
            // Send back an empty structure if no top sights found
            console.log(`No top sights found in SerpApi response for: ${destinationName}`);
            // Return a structure consistent with what the frontend expects when empty
            res.json({ sights: [] });
        }
    } catch (error) {
        console.error('Error fetching from SerpApi:', error.response ? error.response.data : error.message);
        // Send a generic error message back to the client
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to fetch recommendations from SerpApi',
            details: error.response ? error.response.data : error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
