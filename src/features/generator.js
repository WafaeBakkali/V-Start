import { callGeminiApi } from '../api.js';
import { showToast, copyToClipboard } from '../ui.js';

const textVideoSelectData = {
    camera_angle: { label: "Camera Angles", options: ["Eye-Level Shot", "Low-Angle Shot", "High-Angle Shot", "Bird's-Eye View", "Top-Down Shot", "Worm's-Eye View", "Dutch Angle", "Canted Angle", "Close-Up", "Extreme Close-Up", "Medium Shot", "Full Shot", "Long Shot", "Wide Shot", "Establishing Shot", "Over-the-Shoulder Shot", "Point-of-View (POV) Shot"] },
    camera_movement: { label: "Camera Movements", options: ["Static Shot (or fixed)", "Pan (left)", "Pan (right)", "Tilt (up)", "Tilt (down)", "Dolly (In)", "Dolly (Out)", "Zoom (In)", "Zoom (Out)", "Truck (Left)", "Truck (Right)", "Pedestal (Up)", "Pedestal (Down)", "Crane Shot", "Aerial Shot", "Drone Shot", "Handheld", "Shaky Cam", "Whip Pan", "Arc Shot"] },
    lens_effect: { label: "Lens & Optical Effects", options: ["Wide-Angle Lens (e.g., 24mm)", "Telephoto Lens (e.g., 85mm)", "Shallow Depth of Field", "Bokeh", "Deep Depth of Field", "Lens Flare", "Rack Focus", "Fisheye Lens Effect", "Vertigo Effect (Dolly Zoom)"] },
    visual_style: { label: "Visual Style & Aesthetics", options: ["Photorealistic", "Cinematic", "Vintage", "Japanese anime style", "Claymation style", "Stop-motion animation", "In the style of Van Gogh", "Surrealist painting", "Monochromatic black and white", "Vibrant and saturated", "Film noir style", "High-key lighting", "Low-key lighting", "Golden hour glow", "Volumetric lighting", "Backlighting to create a silhouette"] },
    temporal_element: { label: "Temporal Elements", options: ["Slow-motion", "Fast-paced action", "Time-lapse", "Hyperlapse", "Pulsating light", "Rhythmic movement"] },
    sound_effects: { label: "Sound Effects & Ambience", options: ["Sound of a phone ringing", "Water splashing", "Soft house sounds", "Ticking clock", "City traffic and sirens", "Waves crashing", "Quiet office hum"] }
};

function createInputComponent(id, labelText, placeholder) {
    const container = document.createElement('div');
    const label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'block text-sm font-medium text-gray-700 mb-1';
    label.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'text';
    input.id = id;
    input.className = 'w-full p-2 border border-gray-300 rounded-md shadow-sm';
    input.placeholder = placeholder;
    container.appendChild(label);
    container.appendChild(input);
    return container;
}

function createSelectComponent(id, data) {
    const container = document.createElement('div');
    const label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'block text-sm font-medium text-gray-700 mb-1';
    label.textContent = data.label;
    const select = document.createElement('select');
    select.id = id;
    select.className = 'w-full p-2 border border-gray-300 rounded-md shadow-sm';
    select.innerHTML = `<option value="">-- None --</option>` + data.options.map(o => `<option value="${o}">${o}</option>`).join('') + `<option value="custom">Custom...</option>`;
    const customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.id = `${id}-custom`;
    customInput.className = 'custom-input w-full p-2 mt-2 border border-gray-300 rounded-md hidden';
    customInput.placeholder = 'Enter custom value...';
    select.onchange = () => {
        customInput.style.display = select.value === 'custom' ? 'block' : 'none';
    };
    container.appendChild(label);
    container.appendChild(select);
    container.appendChild(customInput);
    return container;
}

function populateTextToVideoForm() {
    const container = document.querySelector('#text-to-video-content .grid');
    if (!container) return;
    container.innerHTML = '';
    const elements = [
        { type: 'input', id: 'subject-input', label: 'Subject', placeholder: 'e.g., A dog' },
        { type: 'input', id: 'action-input', label: 'Action', placeholder: 'e.g., running' },
        { type: 'input', id: 'scene-input', label: 'Scene / Context', placeholder: 'e.g., on a sunny beach' },
        ...Object.keys(textVideoSelectData).map(key => ({ type: 'select', id: key, data: textVideoSelectData[key] })),
        { type: 'input', id: 'dialogue-input', label: 'Dialogue', placeholder: `e.g., Let's go!` }
    ];
    elements.forEach(el => {
        if (el.type === 'input') container.appendChild(createInputComponent(el.id, el.label, el.placeholder));
        else if (el.type === 'select') container.appendChild(createSelectComponent(el.id, el.data));
    });
}

function populateImageToVideoForm() {
    const container = document.getElementById('image-to-video-fields');
    if (!container) return;
    container.innerHTML = '';
    const elements = [
        { type: 'input', id: 'image-action-input', label: 'Action', placeholder: 'e.g., snow falling gently' },
        { type: 'input', id: 'image-scene-input', label: 'Scene / Context', placeholder: 'e.g., steam rising from a coffee cup' },
        ...Object.keys(textVideoSelectData).map(key => ({ type: 'select', id: `image-${key}`, data: textVideoSelectData[key] })),
        { type: 'input', id: 'image-dialogue-input', label: 'Dialogue', placeholder: `e.g., a character sighs` }
    ];
    elements.forEach(el => {
        if (el.type === 'input') container.appendChild(createInputComponent(el.id, el.label, el.placeholder));
        else if (el.type === 'select') container.appendChild(createSelectComponent(el.id, el.data));
    });
}

export function getGeneratorContent() {
    return `
        <div id="generator-content">
            <section id="generator">
                <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    <div class="flex border-b mb-6 space-x-1">
                        <button id="text-to-video-tab" class="py-2 px-4 font-semibold border-b-2 border-indigo-500 rounded-t-lg">Text-to-Video</button>
                        <button id="image-to-video-tab" class="py-2 px-4 font-semibold text-gray-500 border-b-2 border-transparent rounded-t-lg">Image-to-Video</button>
                    </div>
                    <div id="text-to-video-content">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
                        <div class="mt-8">
                            <button id="generate-text-prompt-btn" class="w-full flex items-center justify-center bg-indigo-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                Generate Prompt
                            </button>
                        </div>
                        <div id="text-prompt-output-container" class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 hidden"></div>
                    </div>
                    <div id="image-to-video-content" class="hidden">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 class="text-lg font-semibold text-gray-800 mb-2">1. Upload Image</h4>
                                <input type="file" id="image-upload" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
                                <div id="image-preview-container" class="mt-4 hidden"><img id="image-preview" src="#" alt="Image Preview" class="max-h-48 rounded-lg shadow-md mx-auto"/></div>
                            </div>
                        </div>
                        <h4 class="text-lg font-semibold text-gray-800 mt-6 mb-2">2. Add Details</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="image-to-video-fields"></div>
                        <div class="mt-8">
                            <button id="generate-image-prompt-btn" class="w-full flex items-center justify-center bg-indigo-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Generate Prompt
                            </button>
                        </div>
                        <div id="image-prompt-output-container" class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 hidden"></div>
                    </div>
                </div>
            </section>
        </div>
    `;
}

export function initGenerator() {
    window.copyToClipboard = copyToClipboard;
    
    // This is the most important part: these functions create the form inputs.
    // They MUST run before the event listeners are added.
    populateTextToVideoForm();
    populateImageToVideoForm();

    const textTab = document.getElementById('text-to-video-tab');
    const imageTab = document.getElementById('image-to-video-tab');
    const textContent = document.getElementById('text-to-video-content');
    const imageContent = document.getElementById('image-to-video-content');
    const imageUpload = document.getElementById('image-upload');
    const generateTextBtn = document.getElementById('generate-text-prompt-btn');
    const generateImageBtn = document.getElementById('generate-image-prompt-btn');

    textTab.addEventListener('click', () => {
        textContent.classList.remove('hidden');
        imageContent.classList.add('hidden');
        textTab.classList.add('border-indigo-500');
        textTab.classList.remove('text-gray-500', 'border-transparent');
        imageTab.classList.add('text-gray-500', 'border-transparent');
        imageTab.classList.remove('border-indigo-500');
    });

    imageTab.addEventListener('click', () => {
        imageContent.classList.remove('hidden');
        textContent.classList.add('hidden');
        imageTab.classList.add('border-indigo-500');
        imageTab.classList.remove('text-gray-500', 'border-transparent');
        textTab.classList.add('text-gray-500', 'border-transparent');
        textTab.classList.remove('border-indigo-500');
    });

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('image-preview').src = e.target.result;
                document.getElementById('image-preview-container').classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    });

    generateTextBtn.addEventListener('click', async () => {
        const keywords = [];
        ['subject-input', 'action-input', 'scene-input', 'dialogue-input'].forEach(id => {
            const element = document.getElementById(id);
            if (element && element.value) {
                keywords.push(id === 'dialogue-input' ? `A character says: '${element.value}'` : element.value);
            }
        });

        Object.keys(textVideoSelectData).forEach(key => {
            const select = document.getElementById(key);
            if (!select) return;
            let value = select.value;
            if (value === 'custom') {
                const customInput = document.getElementById(`${key}-custom`);
                value = customInput ? customInput.value : '';
            }
            if (value) keywords.push(value);
        });

        if (keywords.length === 0) {
            showToast("Please provide at least one keyword.", 'error');
            return;
        }

        const systemPrompt = `You are an expert video prompt engineer. Construct the most effective prompt using these keywords: [${keywords.join(', ')}]. Synthesize them into a single, cinematic instruction. Output ONLY the final prompt string.`;
        const outputContainer = document.getElementById('text-prompt-output-container');
        const originalButtonHtml = generateTextBtn.innerHTML;

        generateTextBtn.disabled = true;
        generateTextBtn.innerHTML = 'Generating...';
        outputContainer.classList.remove('hidden');
        outputContainer.innerHTML = '<p class="text-center">Processing...</p>';

        try {
            const result = await callGeminiApi(systemPrompt);
            const outputId = 'text-prompt-output';
            outputContainer.innerHTML = `<div class="flex justify-between items-center mb-2"><h4 class="font-semibold text-indigo-700">Generated Prompt:</h4><button onclick="window.copyToClipboard('${outputId}')" class="p-1 text-gray-500 hover:text-indigo-600 rounded-md" title="Copy Prompt"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button></div><p id="${outputId}" class="text-gray-700 bg-white p-3 rounded-md break-words">${result}</p>`;
        } catch (error) {
            showToast(error.message, 'error');
            outputContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        } finally {
            generateTextBtn.disabled = false;
            generateTextBtn.innerHTML = originalButtonHtml;
        }
    });

    generateImageBtn.addEventListener('click', async () => {
        if (!imageUpload.files || imageUpload.files.length === 0) {
            showToast("Please upload an image first.", "error");
            return;
        }
        
        const keywords = [];
        ['image-action-input', 'image-scene-input', 'image-dialogue-input'].forEach(id => {
            const element = document.getElementById(id);
            if (element && element.value) {
                keywords.push(id.includes('dialogue') ? `A character says: '${element.value}'` : element.value);
            }
        });

        Object.keys(textVideoSelectData).forEach(key => {
            const select = document.getElementById(`image-${key}`);
            if (!select) return;
            let value = select.value;
            if (value === 'custom') {
                const customInput = document.getElementById(`image-${key}-custom`);
                value = customInput ? customInput.value : '';
            }
            if (value) keywords.push(value);
        });

        if (keywords.length === 0) {
            showToast("Please add at least one detail to guide the animation.", 'error');
            return;
        }
        
        const systemPrompt = `Given an input image, animate it based on these instructions: [${keywords.join(', ')}]. Synthesize them into a single, cinematic instruction for an image-to-video model. Output ONLY the final prompt string.`;
        const outputContainer = document.getElementById('image-prompt-output-container');
        const originalButtonHtml = generateImageBtn.innerHTML;

        generateImageBtn.disabled = true;
        generateImageBtn.innerHTML = 'Generating...';
        outputContainer.classList.remove('hidden');
        outputContainer.innerHTML = '<p class="text-center">Processing...</p>';

        try {
            const result = await callGeminiApi(systemPrompt); 
            const outputId = 'image-prompt-output';
            outputContainer.innerHTML = `<div class="flex justify-between items-center mb-2"><h4 class="font-semibold text-indigo-700">Generated Prompt:</h4><button onclick="window.copyToClipboard('${outputId}')" class="p-1 text-gray-500 hover:text-indigo-600 rounded-md" title="Copy Prompt"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button></div><p id="${outputId}" class="text-gray-700 bg-white p-3 rounded-md break-words">${result}</p>`;
        } catch (error) {
            showToast(error.message, 'error');
            outputContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        } finally {
            generateImageBtn.disabled = false;
            generateImageBtn.innerHTML = originalButtonHtml;
        }
    });
}