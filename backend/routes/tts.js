const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// Endpoint to generate audio
router.post('/speak', (req, res) => {
    const { text, speed } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Text is required' });
    }

    // Path to python script
    const scriptPath = path.join(__dirname, '../python_services/tts_gen.py');

    // Spawn python process
    // args: text, speed
    const pythonProcess = spawn('python3', [scriptPath, text, speed || '1.0']);

    res.setHeader('Content-Type', 'audio/mpeg');

    // Pipe stdout directly to response
    pythonProcess.stdout.pipe(res);

    pythonProcess.stderr.on('data', (data) => {
        console.error(`TTS Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            // Only log, response might have already partially sent
            console.error(`TTS process exited with code ${code}`);
        }
    });
});

module.exports = router;
