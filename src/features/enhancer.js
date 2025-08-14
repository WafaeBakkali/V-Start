import { callGeminiApi } from '../api.js';
import { showToast } from '../ui.js';

export function getEnhancerContent() {
    return `
        <div id="enhancer-content">
            <section id="enhancer">
                <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Prompt Enhancer</h3>
                    <p class="text-gray-600 mb-4">Paste your existing prompt below and let Gemini make it more cinematic and descriptive.</p>
                    <div>
                        <label for="enhancer-input" class="block text-sm font-medium text-gray-700 mb-1">Your Prompt</label>
                        <textarea id="enhancer-input" rows="4" class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., A cat sitting on a couch."></textarea>
                    </div>
                    <div class="mt-6">
                        <button id="enhance-prompt-btn" class="w-full flex items-center justify-center bg-purple-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8l-3.354-1.935a1 1 0 010-1.732L10.146 7.2A1 1 0 0112 2z" clip-rule="evenodd" /></svg>
                            Enhance Prompt
                        </button>
                    </div>
                    <div id="enhancer-output-container" class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200" style="display: none;">
                        <div class="flex justify-between items-center mb-2">
                            <h4 class="font-semibold text-purple-700">Enhanced Prompt:</h4>
                            <button onclick="copyToClipboard('enhancer-output')" class="p-1 text-gray-500 hover:text-purple-600 rounded-md" title="Copy Enhanced Prompt">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                        </div>
                        <p id="enhancer-output" class="text-gray-700 bg-white p-3 rounded-md whitespace-pre-wrap"></p>
                    </div>
                </div>
            </section>
        </div>
    `;
}

export function initEnhancer() {
    // --- Get references to the UI elements ---
    const enhanceBtn = document.getElementById('enhance-prompt-btn');
    const enhancerInput = document.getElementById('enhancer-input');
    const outputContainer = document.getElementById('enhancer-output-container');
    const outputElement = document.getElementById('enhancer-output');

    // --- Add the click event listener to the button ---
    enhanceBtn.addEventListener('click', async () => {
        const originalPrompt = enhancerInput.value;

        // 1. Validate the input
        if (!originalPrompt.trim()) {
            showToast('Please enter a prompt to enhance.', 'error');
            return;
        }

        // 2. Define the system prompt for the API call
        const systemPrompt = `You are a creative assistant who enhances user-provided prompts to be more vivid, descriptive, and cinematic for a text-to-video AI model. Rewrite the following prompt: "${originalPrompt}"`;

        // 3. Handle UI loading state
        enhanceBtn.disabled = true;
        enhanceBtn.textContent = 'Enhancing...';
        outputContainer.style.display = 'block';
        outputElement.textContent = 'Generating a more cinematic version...';

        // 4. Call the API and handle the response
        try {
            const enhancedPrompt = await callGeminiApi(systemPrompt);
            outputElement.textContent = enhancedPrompt;
        } catch (error) {
            outputElement.textContent = `Error: ${error.message}`;
            outputElement.classList.add('text-red-500');
            showToast('Failed to enhance the prompt.', 'error');
        } finally {
            // 5. Reset the button state
            enhanceBtn.disabled = false;
            enhanceBtn.textContent = 'Enhance Prompt';
        }
    });
}