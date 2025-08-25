/*
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { callGeminiApi } from '../api.js';
import { showToast } from '../ui.js';

let alignmentResults = [];
let loadedPairs = [];

// --- HELPER FUNCTIONS ---

function extractJSON(text) {
    try {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
    } catch (e) { /* Fallback */ }
    throw new Error(`Failed to parse valid JSON from the API response.`);
}

function getScoreColor(score) {
    if (score >= 80) return { 
        bg: 'bg-green-100 dark:bg-green-900', 
        text: 'text-green-800 dark:text-green-200', 
        border: 'border-green-500 dark:border-green-400', 
        label: 'Excellent', 
        emoji: '🎯' 
    };
    if (score >= 60) return { 
        bg: 'bg-blue-100 dark:bg-blue-900', 
        text: 'text-blue-800 dark:text-blue-200', 
        border: 'border-blue-500 dark:border-blue-400', 
        label: 'Good', 
        emoji: '👍' 
    };
    if (score >= 40) return { 
        bg: 'bg-yellow-100 dark:bg-yellow-900', 
        text: 'text-yellow-800 dark:text-yellow-200', 
        border: 'border-yellow-500 dark:border-yellow-400', 
        label: 'Fair', 
        emoji: '⚠️' 
    };
    return { 
        bg: 'bg-red-100 dark:bg-red-900', 
        text: 'text-red-800 dark:text-red-200', 
        border: 'border-red-500 dark:border-red-400', 
        label: 'Poor', 
        emoji: '👎' 
    };
}

function parsePromptsFromCSV(textContent) {
    // For file uploads, splitting by newlines is the standard.
    return textContent
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

async function getVideoAsBase64(videoSource) {
    let blob;
    if (videoSource instanceof File) {
        blob = videoSource;
    } else if (typeof videoSource === 'string') {
        const response = await fetch(`/api/proxy-video?url=${encodeURIComponent(videoSource)}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch video via proxy: ${response.statusText}`);
        }
        blob = await response.blob();
    } else {
        throw new Error('Invalid video source provided.');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
            base64Data: reader.result.split(',')[1],
            mimeType: blob.type
        });
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// --- HTML TEMPLATE ---

export function getAlignmentEvalContent() {
    return `
        <div id="alignment-eval-content">
            <section id="alignment-eval">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Prompt-Video Alignment Evaluation</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">Load one or more prompt-video pairs to evaluate how well the videos match their prompts.</p>
                    
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-600">
                        <h4 class="font-semibold text-gray-900 dark:text-gray-200 mb-3">Input Pairs</h4>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prompts (Upload .txt/.csv or Paste Semicolon-Separated List)</label>
                                <input type="file" accept=".csv,.txt" id="prompts-csv-input" class="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white dark:file:bg-gray-600 hover:file:bg-gray-100 dark:hover:file:bg-gray-500 file:text-gray-700 dark:file:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                <textarea id="prompts-text-input" rows="2" class="mt-2 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="A lion roaring; A bird flying..."></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Videos (Select local files OR paste URLs, one per line)</label>
                                <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Tip: Name your video files numerically (e.g., 01_video.mp4, 02_video.mp4) to ensure correct order.</div>
                                <input type="file" accept="video/*" multiple id="batch-videos-input" class="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white dark:file:bg-gray-600 hover:file:bg-gray-100 dark:hover:file:bg-gray-500 file:text-gray-700 dark:file:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                <p class="text-center text-xs text-gray-500 dark:text-gray-400 my-2 font-semibold">OR</p>
                                <textarea id="videos-url-input" rows="2" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="https://storage.googleapis.com/bucket/video1.mp4\nhttps://example.com/video2.webm..."></textarea>
                            </div>
                            
                            <div class="flex gap-4 pt-2">
                                <button id="load-batch-btn" class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700">Load Pairs</button>
                                <button id="clear-all-btn" class="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">Clear All</button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="alignment-pairs-container" class="space-y-2"></div>

                    <div id="eval-actions-container" class="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 hidden">
                        <button id="start-alignment-eval-btn" class="w-full flex items-center justify-center bg-cyan-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-cyan-700">
                            Evaluate All Loaded Pairs
                        </button>
                    </div>

                    <div id="alignment-results-container" class="mt-8 space-y-6 hidden"></div>
                    <div id="download-alignment-results-container" class="mt-8 text-center hidden">
                        <button id="download-alignment-results-btn" class="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700">
                            Download Detailed Results (CSV)
                        </button>
                    </div>
                </div>
            </section>
        </div>
    `;
}

// --- INITIALIZATION AND LOGIC ---

export function initAlignmentEval() {
    alignmentResults = [];
    loadedPairs = [];

    const loadBatchBtn = document.getElementById('load-batch-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const startEvalBtn = document.getElementById('start-alignment-eval-btn');
    const downloadBtn = document.getElementById('download-alignment-results-btn');
    const pairsContainer = document.getElementById('alignment-pairs-container');
    const evalActionsContainer = document.getElementById('eval-actions-container');

    const renderLoadedPairs = () => {
        pairsContainer.innerHTML = '';
        if (loadedPairs.length === 0) {
            return;
        }

        const header = document.createElement('h4');
        header.className = 'font-semibold text-gray-900 dark:text-gray-200 mb-3';
        header.textContent = 'Loaded Pairs (Please Verify Order)';
        pairsContainer.appendChild(header);

        const list = document.createElement('div');
        list.className = 'space-y-2';
        loadedPairs.forEach(pair => {
            const pairDiv = document.createElement('div');
            pairDiv.className = 'flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg';
            pairDiv.innerHTML = `
                <div class="font-bold text-gray-500 dark:text-gray-400">${pair.id}.</div>
                <div class="flex-1 text-sm text-gray-800 dark:text-gray-200" title="${pair.prompt}">Prompt #${pair.id}</div>
                <div class="flex-1 text-sm text-gray-600 dark:text-gray-400 truncate text-right" title="${pair.videoName}">Video: ${pair.videoName}</div>
            `;
            list.appendChild(pairDiv);
        });
        pairsContainer.appendChild(list);
    };

    const loadBatchPairs = async () => {
        const csvInput = document.getElementById('prompts-csv-input');
        const textInput = document.getElementById('prompts-text-input');
        const videosFileInput = document.getElementById('batch-videos-input');
        const videosUrlInput = document.getElementById('videos-url-input');
        
        let prompts = [];
        if (csvInput.files.length > 0) {
            prompts = parsePromptsFromCSV(await csvInput.files[0].text());
        } else if (textInput.value.trim()) {
            // **FINAL FIX**: Reverted to semicolon-only splitting for text input.
            prompts = textInput.value.split(';').map(p => p.trim()).filter(p => p);
        }
        
        let videoSources = [];
        if (videosFileInput.files.length > 0) {
            // **FINAL FIX**: Removed the alphabetical sort to respect the browser's file order.
            videoSources = Array.from(videosFileInput.files);
        } else if (videosUrlInput.value.trim()) {
            videoSources = videosUrlInput.value.split(/\r?\n/).map(url => url.trim()).filter(url => url);
        }

        if (prompts.length === 0 || videoSources.length === 0) {
            showToast('Please provide both prompts and videos.', 'error');
            return;
        }
        if (prompts.length !== videoSources.length) {
            showToast(`Mismatch: ${prompts.length} prompts for ${videoSources.length} videos. Please ensure they match.`, 'error');
            return;
        }
        
        loadedPairs = prompts.map((prompt, i) => {
            const source = videoSources[i];
            const name = (source instanceof File) ? source.name : source.split('/').pop();
            return { id: i + 1, prompt, videoSource: source, videoName: name };
        });
        
        renderLoadedPairs();
        evalActionsContainer.classList.remove('hidden');
        showToast(`Loaded ${loadedPairs.length} prompt-video pairs successfully! Please verify the order.`, 'success');
    };

    const clearAllPairs = () => {
        loadedPairs = [];
        alignmentResults = [];
        pairsContainer.innerHTML = '';
        
        evalActionsContainer.classList.add('hidden');
        document.getElementById('alignment-results-container').classList.add('hidden');
        document.getElementById('download-alignment-results-container').classList.add('hidden');
        
        document.getElementById('prompts-csv-input').value = '';
        document.getElementById('prompts-text-input').value = '';
        document.getElementById('batch-videos-input').value = '';
        document.getElementById('videos-url-input').value = '';
    };

    const startAlignmentEvaluation = async () => {
        const btn = document.getElementById('start-alignment-eval-btn');
        const resultsContainer = document.getElementById('alignment-results-container');
        
        btn.disabled = true;
        btn.innerHTML = 'Evaluating...';
        resultsContainer.classList.remove('hidden');
        resultsContainer.innerHTML = '';
        document.getElementById('download-alignment-results-container').classList.add('hidden');
        alignmentResults = [];

        for (const pair of loadedPairs) {
            const resultCard = document.createElement('div');
            resultCard.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700';
            resultCard.innerHTML = `
                <div class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 class="font-bold text-lg">Pair #${pair.id}: Evaluating...</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate" title="${pair.videoName}">${pair.videoName}</p>
                </div>
                <div class="p-6">
                    <p class="text-center text-gray-500 dark:text-gray-400" id="progress-text-${pair.id}">Step 1: Preparing video data...</p>
                </div>
            `;
            resultsContainer.appendChild(resultCard);
            const progressText = document.getElementById(`progress-text-${pair.id}`);

            try {
                const { base64Data, mimeType } = await getVideoAsBase64(pair.videoSource);
                
                const videoParts = [{ 
                    inline_data: { mime_type: mimeType, data: base64Data }
                }];
                
                progressText.textContent = 'Step 2: Analyzing video and generating score...';

                const systemPrompt = `You are an AI video evaluation expert. Your task is to evaluate the alignment between a video and a prompt.

Prompt: "${pair.prompt}"

Perform these steps:
1.  Identify the single most important **core subject** from the prompt.
2.  Analyze the video to see if this **core subject** is present.
3.  Generate 2-4 specific, verifiable questions derived *directly* from details in the prompt.
4.  Answer these questions based on the video with only "Yes", "No", or "Uncertain".
5.  Based on the presence of the core subject and the answers to the questions, calculate a final **holistic alignment score** from 0 to 100. If the core subject is missing, the score must be very low (0-10).

Respond with a single JSON object with four keys: "core_subject" (a string), "core_subject_present" (true or false), "holistic_alignment_score" (an integer from 0-100), and "answers" (an array of objects with "question" and "answer" keys). You MUST output ONLY the raw JSON object.`;
                
                const resultRaw = await callGeminiApi(systemPrompt, videoParts);
                const resultData = extractJSON(resultRaw);

                const { answers, core_subject, core_subject_present, holistic_alignment_score } = resultData;
                const score = holistic_alignment_score || 0;
                
                alignmentResults.push({
                    pairId: pair.id, prompt: pair.prompt, videoName: pair.videoName,
                    score, core_subject, core_subject_present, answers
                });
                
                const colorScheme = getScoreColor(score);
                resultCard.innerHTML = `
                    <div class="${colorScheme.bg} p-4 rounded-t-lg border-b-4 ${colorScheme.border}">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-bold text-lg ${colorScheme.text}">Pair #${pair.id} ${colorScheme.emoji}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate" title="${pair.videoName}">${pair.videoName}</p>
                            </div>
                            <div class="text-right flex-shrink-0 ml-4">
                                <p class="text-4xl font-bold ${colorScheme.text}">${score}%</p>
                                <p class="text-xs uppercase tracking-wide font-semibold ${colorScheme.text}">${colorScheme.label}</p>
                            </div>
                        </div>
                    </div>
                    <div class="p-4 bg-white dark:bg-gray-800">
                        <details>
                            <summary class="cursor-pointer font-semibold text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">View Detailed Evaluation</summary>
                            <div class="mt-3 space-y-3">
                                <div class="flex items-start text-sm">
                                    <span class="${core_subject_present ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'} mr-2 font-bold">${core_subject_present ? '✔' : '✘'}</span>
                                    <div class="flex-1">
                                        <p class="font-semibold text-gray-800 dark:text-gray-200">Core Subject: "${core_subject}"</p>
                                        <p class="${core_subject_present ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}">${core_subject_present ? 'Present' : 'Missing'}</p>
                                    </div>
                                </div>
                                ${answers.map(a => {
                                    const answer = a.answer.toLowerCase();
                                    const answerColor = answer === 'yes' ? 'text-green-700 dark:text-green-400' : answer === 'no' ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400';
                                    const answerIcon = answer === 'yes' ? '✔' : answer === 'no' ? '✘' : '?';
                                    return `
                                        <div class="flex items-start text-sm">
                                            <span class="${answerColor} mr-2 font-bold">${answerIcon}</span>
                                            <div class="flex-1">
                                                <p class="font-semibold text-gray-800 dark:text-gray-200">${a.question}</p>
                                                <p class="${answerColor}">${a.answer}</p>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </details>
                    </div>
                `;
            } catch (error) {
                console.error(`Error evaluating Pair #${pair.id}:`, error);
                resultCard.innerHTML = `<div class="p-4 bg-white dark:bg-gray-800"><h3 class="font-bold text-lg text-red-700 dark:text-red-400 mb-2">Error evaluating Pair #${pair.id}</h3><p class="text-red-600 dark:text-red-400 text-sm">${error.message}</p></div>`;
                showToast(`Error on pair #${pair.id}: ${error.message}`, 'error');
            }
        }
        
        if (alignmentResults.length > 0) document.getElementById('download-alignment-results-container').classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = 'Evaluate All Loaded Pairs';
    };

    const downloadAlignmentResults = () => {
        if (alignmentResults.length === 0) {
            showToast("No results to download.", "error");
            return;
        }

        const headers = ["Pair ID", "Prompt", "Video Name", "Overall Score", "Core Subject", "Core Subject Present", "Question", "Answer"];
        let csvRows = [headers.join(',')];

        alignmentResults.forEach(r => {
            const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
            if (r.answers && r.answers.length > 0) {
                r.answers.forEach(answer => {
                    const row = [ r.pairId, escapeCsv(r.prompt), escapeCsv(r.videoName), r.score, escapeCsv(r.core_subject), r.core_subject_present, escapeCsv(answer.question), escapeCsv(answer.answer) ];
                    csvRows.push(row.join(','));
                });
            } else {
                const row = [ r.pairId, escapeCsv(r.prompt), escapeCsv(r.videoName), r.score, escapeCsv(r.core_subject), r.core_subject_present, "N/A", "N/A" ];
                csvRows.push(row.join(','));
            }
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'alignment_evaluation_results.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("Results downloaded successfully!", "success");
    };
    
    // Attach event listeners to the buttons
    loadBatchBtn.addEventListener('click', loadBatchPairs);
    clearAllBtn.addEventListener('click', clearAllPairs);
    startEvalBtn.addEventListener('click', startAlignmentEvaluation);
    downloadBtn.addEventListener('click', downloadAlignmentResults);
}
