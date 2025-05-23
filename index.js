require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verifyFirebaseToken } = require('./firebase');
const { createStreamingChatCompletion, handleNearbyRequest } = require('./services/openai');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.post('/respond', verifyFirebaseToken, async (req, res) => {
    try {
        const { message, selectedModel, threadMessages, parameters, latitude, longitude } = req.body;

        const messages = Array.isArray(threadMessages) ? threadMessages : [];

        const currentMessage = {
            id: Date.now().toString(),
            content: message,
            isUser: true,
            timestamp: new Date()
        };

        const messageExists = messages.some(m =>
            m.isUser && m.content === message
        );

        const allMessages = messageExists
            ? messages
            : [...messages, currentMessage];

        if (latitude !== undefined && longitude !== undefined) {
            return await handleNearbyRequest(latitude, longitude, res,allMessages,parameters);
        }

        await createStreamingChatCompletion(allMessages, {
            ...parameters,
            selectedModel
        }, res);

    } catch (error) {
        console.error('Error in /respond endpoint:', error);

        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        } else {
            try {
                res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
                res.end();
            } catch (streamError) {
                console.error('Error sending error in stream:', streamError);
            }
        }
    }
});

app.listen(PORT, () => {
    console.log(`Health chatbot server running on port ${PORT}`);
});