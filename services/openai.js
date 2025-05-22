const OpenAI = require('openai');

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

module.exports = { createStreamingChatCompletion };