const chatSession = {
    sendMessage: async (prompt) => {
        try {
            // We strictly ask for JSON format in the prompt
            const finalPrompt = `
              ${prompt}
              IMPORTANT: Return the response strictly in valid JSON format only. 
              Do not add markdown code blocks like \`\`\`json. 
              Just return the raw JSON string.
            `;

            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are a helpful travel planning assistant. Always output JSON.' },
                        { role: 'user', content: finalPrompt }
                    ],
                    model: 'openai', // This uses GPT-4o-mini for free
                    jsonMode: true   // Helps ensure JSON output
                }),
            });

            const data = await response.text(); // Pollinations returns text directly
            
            // Sometimes AI adds ```json at the start, we clean it just in case
            const cleanJson = data.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "");
            
            return {
                response: {
                    text: () => cleanJson,
                }
            };

        } catch (error) {
            console.error("Error generating trip:", error);
            throw error;
        }
    }
};

module.exports = { chatSession };
