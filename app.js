const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 6000;
const PERSISTENT_DIR = "/home/nikulpokukadiya1998";
const CONTAINER_2_URL = "http://kubernetes-service1/calculate";

// Store file API for container 1 image
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

// Calculate API for container 1
app.post('/calculate', async (req, res) => {

    const {file, product} = req.body;

    if (!file) {
        return res.status(400).json({
            "file": null,
            error: "Invalid JSON input."
        });
    }
    const filePath = path.join(PERSISTENT_DIR, file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
             file,
            error: "File not found."
        });
    }

    try {
        const response = await axios.post(CONTAINER_2_URL, {file, product});
        res.status(response.status).json(response.data);
    } catch (error) {
        console.log(error);
        res.status(400).json({ file, error: "Input file not in CSV format." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
