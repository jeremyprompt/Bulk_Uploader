const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static('.'));

app.post('/api/channels', async (req, res) => {
    try {
        const { subdomain, authToken, payload } = req.body;
        const url = `https://${subdomain}.prompt.io/rest/1.0/org_channels`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'orgAuthToken': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
}); 