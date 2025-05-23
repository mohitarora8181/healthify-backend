const OpenAI = require('openai');
const { getNearbyHealthcareResources } = require('./dummyData');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Create a streaming chat completion
 * @param {Array} messages - Chat messages array
 * @param {Object} parameters - Additional parameters for the OpenAI request
 * @param {Response} res - Express response object for streaming
 */
async function createStreamingChatCompletion(messages, parameters, res) {
    try {
        const formattedMessages = messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
        }));

        if (parameters.system_prompt) {
            formattedMessages.unshift({
                role: 'system',
                content: parameters.system_prompt
            });
        }

        const completionOptions = {
            model: parameters.selectedModel || 'gpt-4o',
            messages: formattedMessages,
            temperature: parameters.temperature || 0.7,
            max_tokens: parameters.maxTokens || 1024,
            top_p: parameters.topP || 0.9,
            stream: true
        };

        const stream = await openai.chat.completions.create(completionOptions);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
                const content = chunk.choices[0].delta.content;
                res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Error in OpenAI streaming:', error);

        if (!res.headersSent) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
        }

        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    }
}


/**
 * Handle location-based requests for nearby healthcare resources
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {Response} res - Express response object
 * @param messages - All messages
 * @param parameters
 */
async function handleNearbyRequest(latitude, longitude, res, messages, parameters) {
    try {
        console.log(`Processing location-based request: Lat ${latitude}, Long ${longitude}`);

        const formattedMessages = messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
        }));

        const analysis = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `
                        You are a healthcare assistant. Based on the user message, determine what healthcare resources they need.
                        Respond ONLY with a JSON object in this format:
                        {
                          "resourceType": "doctors|medicines|chemists|hospitals|all",
                          "specialization": "optional specialization if doctors",
                          "urgency": "high|medium|low",
                          "condition": "brief description of medical condition"
                        }
                    `
                },
                ...formattedMessages
            ],
            temperature: 0.3,
            max_tokens: 150
        });

        const analysisText = analysis.choices[0].message.content;
        let resourceNeeds;

        try {
            // Parse the JSON response
            resourceNeeds = JSON.parse(analysisText);
        } catch (err) {
            console.error("Failed to parse OpenAI response:", err);
            resourceNeeds = { resourceType: "all" };
        }

        // Get nearby healthcare resources based on the analysis
        const nearbyResources = getNearbyHealthcareResources(
            latitude,
            longitude,
            resourceNeeds.resourceType,
            resourceNeeds.specialization
        );

        // Send response to client
        return res.json({
            id: Date.now().toString(),
            content: `Here are nearby healthcare resources based on your location:`,
            isUser: false,
            timestamp: new Date(),
            resources: nearbyResources,
            analysis: resourceNeeds
        });
    } catch (error) {
        console.error("Error handling location-based request:", error);
        return res.status(500).json({ error: "Failed to process location-based request" });
    }
}

module.exports = { createStreamingChatCompletion, handleNearbyRequest };