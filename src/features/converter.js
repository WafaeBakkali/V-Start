import { callGeminiApi } from '../api.js';
import { showToast } from '../ui.js';

export function getConverterContent() {
    return `
        <div id="converter-content">
            <section id="converter">
                <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Prompt Format Converter</h3>
                    <p class="text-gray-600 mb-4">Convert a prompt between plain text, JSON, YAML, or XML.</p>
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div class="md:col-span-4">
                            <label for="converter-input" class="block text-sm font-medium text-gray-700 mb-1">Input Text</label>
                            <textarea id="converter-input" rows="6" class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Paste your prompt in any format..."></textarea>
                        </div>
                        <div>
                            <label for="format-select" class="block text-sm font-medium text-gray-700 mb-1">Convert To</label>
                            <select id="format-select" class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option>JSON</option>
                                <option>YAML</option>
                                <option>XML</option>
                                <option>Plain Text</option>
                            </select>
                        </div>
                    </div>
                    <div class="mt-6">
                        <button id="convert-format-btn" class="w-full flex items-center justify-center bg-teal-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M15.28 4.72a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 000 1.06l4.25 4.25a.75.75 0 11-1.06 1.06l-4.25-4.25a2.25 2.25 0 010-3.18l4.25-4.25a.75.75 0 011.06 0zm-8.56 0a.75.75 0 011.06 0l4.25 4.25a2.25 2.25 0 010 3.18l-4.25 4.25a.75.75 0 11-1.06-1.06l4.25-4.25a.75.75 0 000-1.06L4.72 5.78a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>
                            Convert Format
                        </button>
                    </div>
                    <div id="converter-output-container" class="mt-6 p-4 bg-gray-900 text-white rounded-lg" style="display: none;">
                        <div class="flex justify-between items-center mb-2">
                            <h4 class="font-semibold text-teal-300">Converted Output:</h4>
                            <button onclick="copyToClipboard('converter-output')" class="p-1 text-gray-300 hover:text-teal-300 rounded-md" title="Copy Output">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                        </div>
                        <pre><code id="converter-output" class="text-sm"></code></pre>
                    </div>
                </div>
            </section>
        </div>
    `;
}

export function initConverter() {
    // --- Get references to the UI elements ---
    const convertBtn = document.getElementById('convert-format-btn');
    const converterInput = document.getElementById('converter-input');
    const formatSelect = document.getElementById('format-select');
    const outputContainer = document.getElementById('converter-output-container');
    const outputElement = document.getElementById('converter-output');

    // --- Add the click event listener to the button ---
    convertBtn.addEventListener('click', async () => {
        const inputText = converterInput.value;
        const targetFormat = formatSelect.value;

        // 1. Validate the input
        if (!inputText.trim()) {
            showToast('Please enter some text to convert.', 'error');
            return;
        }

        // 2. Define the system prompt for the API call
        const systemPrompt = `You are a data format converter. Convert the following text into the ${targetFormat} format. Provide only the converted text as a raw string, without any additional explanation or markdown code fences (e.g., \`\`\`json). Text to convert:\n\n${inputText}`;

        // 3. Handle UI loading state
        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';
        outputContainer.style.display = 'block';
        outputElement.textContent = `Converting to ${targetFormat}...`;

        // 4. Call the API and handle the response
        try {
            const convertedText = await callGeminiApi(systemPrompt);
            // Using textContent is safer here to prevent HTML injection
            outputElement.textContent = convertedText;
        } catch (error) {
            outputElement.textContent = `Error: ${error.message}`;
            showToast('Failed to convert the format.', 'error');
        } finally {
            // 5. Reset the button state
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert Format';
        }
    });
}