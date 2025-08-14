export function getEvalContent() {
    return `
        <div id="eval-content">
          <div id="choice-section" class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md text-center">
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900">VeoEval</h1>
              <p class="text-gray-500 text-sm">by wafaeb@</p>
              <p class="text-gray-600 mt-4 mb-8">A tool for blind A/B video evaluation.</p>
              <div class="space-y-4">
                  <button id="participate-button" class="w-full bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition duration-300">
                      Participate in Blind Video Study
                  </button>
                  <button id="create-button" class="w-full bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-300 transition duration-300">
                      Create Your Own Evaluation
                  </button>
              </div>
          </div>

          <div id="setup-section" class="hidden max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 text-center">Create Your Own A/B Evaluation</h1>
              <p class="text-gray-600 mt-4 mb-6 text-center">Upload multiple videos for Group A and Group B to create randomized pairs for blind comparison.</p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="bg-gray-50 p-4 rounded-lg border">
                      <label for="videos-a-input" class="block text-lg font-semibold text-gray-700 mb-2">Group A Videos</label>
                      <input type="file" id="videos-a-input" multiple accept="video/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                      <div id="videos-a-count" class="text-sm text-gray-600 mt-2">0 files selected</div>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg border">
                      <label for="videos-b-input" class="block text-lg font-semibold text-gray-700 mb-2">Group B Videos</label>
                      <input type="file" id="videos-b-input" multiple accept="video/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                      <div id="videos-b-count" class="text-sm text-gray-600 mt-2">0 files selected</div>
                  </div>
              </div>

              <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button id="back-button-creator" class="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-300">
                      Back
                  </button>
                  <button id="start-eval-button-creator" class="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled>
                      Start Evaluation
                  </button>
              </div>
              <p id="setup-error" class="text-red-500 text-sm mt-2 text-center" style="display: none;"></p>
          </div>
        
          <div id="main-eval-content" style="display: none;">
              <header class="text-center mb-8 relative">
                  <button id="back-to-menu-button" class="absolute top-0 left-0 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300 text-sm">
                      &larr; Back to Menu
                  </button>
                <h1 class="text-3xl md:text-4xl font-bold text-gray-900">A/B Video Evaluation</h1>
                <p class="text-gray-600 mt-2">Which video do you prefer?</p>
              </header>

              <main id="evaluation-section">
                  <div class="text-center mb-4">
                      <p id="progress-counter" class="text-lg font-semibold text-gray-700"></p>
                  </div>
                  <div id="video-comparison" class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
                      <div id="video-container-a" class="bg-white p-4 rounded-lg shadow-md">
                          <h2 class="text-xl font-semibold mb-4 text-center">Video A</h2>
                          <div class="aspect-w-16 aspect-h-9 bg-black rounded-md overflow-hidden">
                              <video id="video-a" controls class="w-full h-full"></video>
                          </div>
                      </div>
                      <div id="video-container-b" class="bg-white p-4 rounded-lg shadow-md">
                          <h2 class="text-xl font-semibold mb-4 text-center">Video B</h2>
                          <div class="aspect-w-16 aspect-h-9 bg-black rounded-md overflow-hidden">
                              <video id="video-b" controls class="w-full h-full"></video>
                          </div>
                      </div>
                  </div>

                  <div id="questions-section" class="bg-white p-6 rounded-lg shadow-md">
                      <div id="questions-container" class="flex justify-center items-center gap-4">
                          <button id="vote-a-button" class="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300">Prefer Video A</button>
                          <button id="vote-b-button" class="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition duration-300">Prefer Video B</button>
                          <button id="vote-tie-button" class="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-700 transition duration-300">They are about the same</button>
                      </div>
                      <p id="loading-message" class="text-center text-gray-500 mt-4" style="display: none;">Loading next pair...</p>
                  </div>
              </main>
          </div>

          <div id="thank-you-section" class="text-center py-16" style="display: none;">
              <h2 class="text-3xl font-bold text-green-600">Evaluation Complete!</h2>
              <p class="text-gray-700 mt-4 text-lg">Here are the results:</p>
              <div id="results-summary" class="mt-6 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-left space-y-2"></div>
              <div class="mt-8">
                  <a id="download-results" class="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out" href="#">
                      Download Results (CSV)
                  </a>
              </div>
              <p class="text-gray-600 mt-4">Please download your results and share the file with <a href="mailto:wafaeb@google.com" class="text-indigo-600 hover:underline">wafaeb@google.com</a>.</p>
          </div>
        </div>
    `;
}

export function initEval() {
    // --- State Management Variables ---
    let videosA = [];
    let videosB = [];
    let evaluationPairs = [];
    let results = [];
    let currentPairIndex = 0;

    // --- DOM Element References ---
    const sections = ['choice-section', 'setup-section', 'main-eval-content', 'thank-you-section'];
    const choiceSection = document.getElementById('choice-section');
    const setupSection = document.getElementById('setup-section');
    const mainEvalContent = document.getElementById('main-eval-content');
    const thankYouSection = document.getElementById('thank-you-section');
    
    const createBtn = document.getElementById('create-button');
    const backBtnCreator = document.getElementById('back-button-creator');
    const startEvalBtn = document.getElementById('start-eval-button-creator');
    const backToMenuBtn = document.getElementById('back-to-menu-button');
    
    const inputA = document.getElementById('videos-a-input');
    const inputB = document.getElementById('videos-b-input');
    const countA = document.getElementById('videos-a-count');
    const countB = document.getElementById('videos-b-count');
    const setupError = document.getElementById('setup-error');
    
    const videoPlayerA = document.getElementById('video-a');
    const videoPlayerB = document.getElementById('video-b');
    const progressCounter = document.getElementById('progress-counter');
    
    const voteA_Btn = document.getElementById('vote-a-button');
    const voteB_Btn = document.getElementById('vote-b-button');
    const voteTie_Btn = document.getElementById('vote-tie-button');

    // --- Helper Functions ---
    const showSection = (sectionId) => {
        sections.forEach(id => {
            document.getElementById(id).style.display = (id === sectionId) ? 'block' : 'none';
        });
    };

    const resetState = () => {
        videosA = [];
        videosB = [];
        evaluationPairs = [];
        results = [];
        currentPairIndex = 0;
        inputA.value = '';
        inputB.value = '';
        countA.textContent = '0 files selected';
        countB.textContent = '0 files selected';
        startEvalBtn.disabled = true;
        showSection('choice-section');
    };

    const validateInputs = () => {
        videosA = Array.from(inputA.files);
        videosB = Array.from(inputB.files);
        countA.textContent = `${videosA.length} files selected`;
        countB.textContent = `${videosB.length} files selected`;

        if (videosA.length > 0 && videosA.length === videosB.length) {
            startEvalBtn.disabled = false;
            setupError.style.display = 'none';
        } else {
            startEvalBtn.disabled = true;
            if (videosA.length !== videosB.length && videosB.length > 0) {
                setupError.textContent = 'Group A and Group B must have the same number of videos.';
                setupError.style.display = 'block';
            } else {
                 setupError.style.display = 'none';
            }
        }
    };

    // Fisher-Yates shuffle algorithm
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const createPairs = () => {
        const shuffledA = shuffle([...videosA]);
        const shuffledB = shuffle([...videosB]);
        evaluationPairs = shuffledA.map((videoA, index) => {
            const videoB = shuffledB[index];
            // Randomly assign to left/right positions
            if (Math.random() < 0.5) {
                return { left: videoA, right: videoB, leftGroup: 'A', rightGroup: 'B' };
            } else {
                return { left: videoB, right: videoA, leftGroup: 'B', rightGroup: 'A' };
            }
        });
    };

    const loadPair = (index) => {
        if (index >= evaluationPairs.length) {
            displayResults();
            return;
        }
        progressCounter.textContent = `Pair ${index + 1} of ${evaluationPairs.length}`;
        const pair = evaluationPairs[index];
        videoPlayerA.src = URL.createObjectURL(pair.left);
        videoPlayerB.src = URL.createObjectURL(pair.right);
    };
    
    const recordVote = (preference) => {
        const pair = evaluationPairs[currentPairIndex];
        results.push({
            pair: currentPairIndex + 1,
            videoA_file: (pair.leftGroup === 'A' ? pair.left.name : pair.right.name),
            videoB_file: (pair.leftGroup === 'B' ? pair.left.name : pair.right.name),
            preference: preference,
        });

        currentPairIndex++;
        loadPair(currentPairIndex);
    };
    
    const displayResults = () => {
        const summaryContainer = document.getElementById('results-summary');
        let groupAWins = results.filter(r => r.preference === 'A').length;
        let groupBWins = results.filter(r => r.preference === 'B').length;
        let ties = results.filter(r => r.preference === 'Tie').length;
        
        summaryContainer.innerHTML = `
            <p><strong>Group A Wins:</strong> ${groupAWins}</p>
            <p><strong>Group B Wins:</strong> ${groupBWins}</p>
            <p><strong>Ties:</strong> ${ties}</p>
        `;
        
        generateCSV();
        showSection('thank-you-section');
    };
    
    const generateCSV = () => {
        const headers = ['Pair', 'Video_A_File', 'Video_B_File', 'Preference'];
        const rows = results.map(r => [r.pair, r.videoA_file, r.videoB_file, r.preference]);
        let csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
        
        const downloadLink = document.getElementById('download-results');
        downloadLink.href = encodeURI(csvContent);
        downloadLink.download = `veo_eval_results_${new Date().toISOString()}.csv`;
    };

    // --- Initial Setup and Event Listeners ---
    createBtn.addEventListener('click', () => showSection('setup-section'));
    document.getElementById('participate-button').addEventListener('click', () => {
        // In a real app, this would fetch pre-defined videos. For now, it also goes to the setup screen.
        showSection('setup-section');
    });

    backBtnCreator.addEventListener('click', () => showSection('choice-section'));
    backToMenuBtn.addEventListener('click', resetState);
    
    inputA.addEventListener('change', validateInputs);
    inputB.addEventListener('change', validateInputs);

    startEvalBtn.addEventListener('click', () => {
        createPairs();
        loadPair(currentPairIndex);
        showSection('main-eval-content');
    });
    
    voteA_Btn.addEventListener('click', () => recordVote('A'));
    voteB_Btn.addEventListener('click', () => recordVote('B'));
    voteTie_Btn.addEventListener('click', () => recordVote('Tie'));
    
    resetState(); // Initialize to the first screen
}
