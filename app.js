const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 6000;
const PERSISTENT_DIR = "/path/to/your/persistent/volume";

app.use(bodyParser.json());

// Store file API
app.post('/store-file', (req, res) => {
    const { file, data } = req.body;

    if (!file || !data) {
        return res.status(400).json({ file: null, error: "Invalid JSON input." });
    }

    const filePath = path.join(PERSISTENT_DIR, file);

    fs.writeFile(filePath, data, (err) => {
        if (err) {
            return res.status(500).json({ file, error: "Error while storing the file to the storage." });
        }

        res.json({ file, message: "Success." });
    });
});

// Calculate API
app.post('/calculate', async (req, res) => {
    const { file, product } = req.body;

    if (!file || !product) {
        return res.status(400).json({ file: null, error: "Invalid JSON input." });
    }

    const filePath = path.join(PERSISTENT_DIR, file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ file, error: "File not found." });
    }

    try {
        const response = await axios.post('http://container2-service-url/calculate', { file, product });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ file, error: "Error communicating with container 2." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
