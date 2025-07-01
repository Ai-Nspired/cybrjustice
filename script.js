// Initialize Marked.js
marked.setOptions({ breaks: true, gfm: true });

// DOM Elements
const modalOverlay = document.getElementById('modal-overlay');
const truthEngineTrigger = document.getElementById('truth-engine-trigger');
const closeModal = document.getElementById('close-modal');
const queryInput = document.getElementById('queryInput');
const searchButton = document.getElementById('searchButton');
const resultContainer = document.getElementById('resultContainer');
const onboardingOverlay = document.getElementById('onboardingOverlay');
const closeOnboarding = document.getElementById('closeOnboarding');
const startUsingBtn = document.querySelector('.start-using');

// API Configuration
const API_BASE = 'https://justice.ai-n.workers.dev';

// Modal Control Functions
function openModal() {
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  queryInput.focus();
}

function closeModalHandler() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Search Function
async function performTruthQuery() {
  const query = queryInput.value.trim();
  resultContainer.innerHTML = '<div class="search-loading">Searching justice databases...</div>';
  try {
    const response = await fetch(`${API_BASE}/api/ai/truth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    displayResults(data);
  } catch (error) {
    resultContainer.innerHTML = `<div class="search-error">Error: ${error.message}</div>`;
  }
}

function displayResults(data) {
  let html = `<div class="result-content">`;
  html += `<div class="answer">${marked.parse(data.answer)}</div>`;
  if (data.citations?.length) {
    html += `<div class="citations"><h4>Sources:</h4><ul>`;
    data.citations.forEach(citation => {
      html += `<li><a href="${citation.url}" target="_blank">${citation.title}</a></li>`;
    });
    html += `</ul></div>`;
  }
  resultContainer.innerHTML = html + `</div>`;
}

// Onboarding Functions
function showOnboarding() {
  onboardingOverlay.classList.add('active');
}
function hideOnboarding() {
  onboardingOverlay.classList.remove('active');
}

// Event Listeners
truthEngineTrigger.addEventListener('click', openModal);
closeModal.addEventListener('click', closeModalHandler);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModalHandler();
});
searchButton.addEventListener('click', performTruthQuery);
queryInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performTruthQuery();
});

// Onboarding
if (!localStorage.getItem('onboardingShown')) {
  setTimeout(showOnboarding, 1500);
  localStorage.setItem('onboardingShown', 'true');
}
closeOnboarding.addEventListener('click', hideOnboarding);
startUsingBtn.addEventListener('click', hideOnboarding);

// Existing data-search links in nav, hero, etc.
document.querySelectorAll('[data-search]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const searchTerm = link.getAttribute('data-search');
    // Visual feedback
    link.classList.add('active-search');
    setTimeout(() => link.classList.remove('active-search'), 500);
    // Open and search
    if (!modalOverlay.classList.contains('active')) openModal();
    queryInput.value = searchTerm;
    setTimeout(() => searchButton.click(), 300);
  });
});

// Expose modal/query for inline script
window.openModal = openModal;
window.performTruthQuery = performTruthQuery;
