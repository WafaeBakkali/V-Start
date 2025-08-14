import { copyToClipboard } from '../ui.js';

const galleryData = {
    subject: { title: "Subject, Scene & Action", examples: [ { title: "Complex Subject", prompt: "A hyper-realistic, cinematic portrait of a wise, androgynous shaman...draped in ceremonial robes...holding a gnarled wooden staff...", youtubeId: "GKOpOcs8IF8" }, { title: "Portrait", prompt: "A cinematic portrait of a woman looking thoughtfully out a window, with soft, natural light and beautiful bokeh.", youtubeId: "Ol66pK2N7L0" }, { title: "Sequencing of Actions", prompt: "A gloved hand carefully slices open the spine of an ancient, leather-bound book... then delicately extracts a tiny, metallic data chip... The character's eyes widen in alarm...", youtubeId: "EbCAqMF2DBo" }, { title: "Emotional Expression", prompt: "A close-up on a woman's face. Her expression shifts from neutral to a look of profound surprise and joy, her eyes widening and a smile forming.", youtubeId: "lYMjzZHykCo" } ] },
    camera: { title: "Camera Work", examples: [ { title: "Low Angle Shot", prompt: "Dynamic low-angle shot of a basketball player soaring for a slam dunk, stadium lights flaring.", youtubeId: "zCZ91E7tPeE" }, { title: "Drone Shot", prompt: "Sweeping aerial drone shot flying over a tropical island chain.", youtubeId: "gvPtt5f-kKc" }, { title: "Zoom In Shot", prompt: "A slow, dramatic zoom in on a mysterious, ancient compass lying on a dusty map...", youtubeId: "izn8VHHFy3c" }, { title: "Over-the-Shoulder", prompt: "An over-the-shoulder shot from behind a seasoned detective, looking at a nervous informant sitting across a table in a dimly lit interrogation room.", youtubeId: "z73bvXtUC_0" }, { title: "Rack Focus", prompt: "A medium shot of a detective's hand in the foreground, holding a single, spent bullet casing. The camera then performs a slow rack focus...", youtubeId: "-p6W4mCYuvc" }, { title: "Handheld Camera", prompt: "An intense handheld camera shot during a chaotic marketplace chase. The camera struggles to keep up, with jerky movements...", youtubeId: "csnE4FNogJQ" } ] },
    style: { title: "Visual & Temporal Styles", examples: [ { title: "Anime Style", prompt: "A dynamic scene in a vibrant Japanese anime style. A magical girl with silver hair and glowing blue eyes walks in a forest...", youtubeId: "vu2ZFw-9ZMI" }, { title: "Lens Flare", prompt: "A cinematic shot of a couple embracing on a beach at sunset. As the sun dips below the horizon..., a warm, anamorphic lens flare streaks across the frame.", youtubeId: "jY3gQS73614" }, { title: "Jump Cut", prompt: "A person sitting in the same position but wearing different outfits, with sharp jump cuts between each outfit change...", youtubeId: "d-cGj3kAnsQ" }, { title: "Time-Lapse", prompt: "A time-lapse of a bustling city skyline as day transitions to night...the city lights begin to twinkle on, with streaks of car headlights...", youtubeId: "CT0PIze9w0Y" }, { title: "Cyberpunk Lighting", prompt: "A hyper-realistic, cinematic shot of a rain-slicked cyberpunk alleyway at midnight. Pulsating pink and teal neon signs reflect off puddles...", youtubeId: "bKIZ-pdCJnA" }, { title: "Vintage Style", prompt: "A vintage 1920s street scene, sepia toned, film grain, with characters in period attire.", youtubeId: "WJwj6y7p8SI" } ] },
    audio: { title: "Audio", examples: [ { title: "Ambient Noise", prompt: "A static, wide shot of a vast, ancient library at night. The only sounds are the soft, rhythmic ticking of a grandfather clock, the gentle rustle of turning pages...", youtubeId: "WsXXBDhO7l0" }, { title: "Dialogue", prompt: "A medium shot in a dimly lit interrogation room. The seasoned detective says: Your story has holes. The nervous informant, sweating under a single bare bulb, replies: I'm telling you everything I know. The only other sounds are the slow, rhythmic ticking of a wall clock and the faint sound of rain against the window", youtubeId: "yGcMvkFK9Zo" } ] }
};

export function getGalleryContent() {
    return `
        <div id="gallery-content">
            <section id="gallery" class="mb-12">
                 <h2 class="text-3xl font-bold mb-4">Prompt Gallery</h2>
                 <p class="text-gray-600 mb-8">Choose a category to browse video examples and the prompts that created them.</p>
                 <div id="gallery-categories" class="flex flex-wrap gap-3 mb-8"></div>
                 <div id="gallery-sliders-container"></div>
            </section>
        </div>
    `;
}

export function initGallery() {
    // FIX: Make the imported function available to the global scope for onclick attributes
    window.copyToClipboard = copyToClipboard;

    const catContainer = document.getElementById('gallery-categories');
    const slidersContainer = document.getElementById('gallery-sliders-container');
    catContainer.innerHTML = '';
    slidersContainer.innerHTML = '';
    
    Object.keys(galleryData).forEach(key => {
        const button = document.createElement('button');
        button.className = 'gallery-category-button py-2 px-5 rounded-full font-semibold shadow-sm';
        button.textContent = galleryData[key].title;
        button.onclick = () => showGalleryCategory(key);
        catContainer.appendChild(button);
        slidersContainer.appendChild(createSlider(key, galleryData[key]));
    });

    showGalleryCategory('subject'); // Show the first category by default
}

function createSlider(categoryId, categoryData) {
    const sliderWrapper = document.createElement('div');
    sliderWrapper.id = `gallery-${categoryId}`;
    sliderWrapper.className = 'gallery-examples relative';
    sliderWrapper.innerHTML = `<div class="slider-container flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4">${categoryData.examples.map((ex, index) => {
        const promptId = `gallery-prompt-${categoryId}-${index}`;
        const thumbnailUrl = ex.youtubeId ? `https://i.ytimg.com/vi/${ex.youtubeId}/hqdefault.jpg` : 'https://placehold.co/600x400/1f2937/FFFFFF?text=No+Video';
        return `<div class="slider-item snap-start flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 bg-white rounded-xl shadow-lg overflow-hidden card-hover no-underline flex flex-col">
                    <a href="${ex.youtubeId ? `https://www.youtube.com/watch?v=${ex.youtubeId}` : '#'}" target="_blank" rel="noopener noreferrer">
                        <div class="video-container">
                            <img src="${thumbnailUrl}" alt="${ex.title}">
                            <div class="play-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.002v3.996a1 1 0 001.555.832l3.197-2a1 1 0 000-1.664l-3.197-2z" clip-rule="evenodd" /></svg></div>
                        </div>
                    </a>
                    <div class="p-6 flex-grow flex flex-col">
                        <h4 class="font-semibold text-lg mb-2">${ex.title}</h4>
                        <p id="${promptId}" class="text-gray-700 text-sm flex-grow">${ex.prompt}</p>
                        <button onclick="copyToClipboard('${promptId}')" class="mt-4 self-start flex items-center gap-2 text-sm py-1 px-3 bg-gray-100 rounded-md hover:bg-gray-200">Copy Prompt</button>
                    </div>
                </div>`;
    }).join('')}</div>`;
    return sliderWrapper;
}

function showGalleryCategory(category) {
    document.querySelectorAll('.gallery-examples').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.gallery-category-button').forEach(el => el.classList.remove('category-button-active'));
    
    const activeBtn = Array.from(document.querySelectorAll('.gallery-category-button')).find(btn => btn.textContent === galleryData[category].title);
    if (activeBtn) {
        document.getElementById(`gallery-${category}`).style.display = 'block';
        activeBtn.classList.add('category-button-active');
    }
}