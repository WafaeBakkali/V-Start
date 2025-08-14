import { initGenerator, getGeneratorContent } from './features/generator.js';

const mainContent = document.getElementById('main-content');
const tabs = {
    generator: { getContent: getGeneratorContent, init: initGenerator }
    // Add other features here, e.g., enhancer: { getContent: getEnhancerContent, init: initEnhancer }
};

function showMainTab(tabName) {
    mainContent.innerHTML = ''; 
    const feature = tabs[tabName];
    if (feature) {
        mainContent.innerHTML = feature.getContent();
        feature.init();
    }
    Object.keys(tabs).forEach(tabKey => {
        const tabEl = document.getElementById(`${tabKey}-main-tab`);
        if (tabEl) tabEl.classList.toggle('main-tab-active', tabKey === tabName);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    showMainTab('generator'); 
    Object.keys(tabs).forEach(tabKey => {
        const tabEl = document.getElementById(`${tabKey}-main-tab`);
        if(tabEl) tabEl.addEventListener('click', () => showMainTab(tabKey));
    });
});