// SECURE VERSION: This calls your own server, not Google's.

export async function callGeminiApi(systemPrompt, contentParts = []) {
    const authMethod = document.getElementById('auth-method-select').value;
    
    // The frontend only sends the non-sensitive parts
    const payload = {
        authMethod: authMethod,
        systemPrompt: systemPrompt,
        contentParts: contentParts
    };

    try {
        // Call your own server's new endpoint
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API Error: ${errorBody.error || 'Unknown server error'}`);
        }

        const result = await response.json();
        return result.text; // Your server will return just the text

    } catch (error) {
        console.error("Error calling backend service:", error);
        throw error;
    }
}