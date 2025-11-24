/**
 * Text Intelligence HTML Starter - Frontend Application
 *
 * This is a vanilla JavaScript frontend that provides a text intelligence UI
 * for Deepgram's Text Intelligence service. It's designed to be easily
 * modified and extended for your own projects.
 *
 * Key Features:
 * - Text or URL input for analysis
 * - Multiple intelligence features (summarization, topics, sentiment, intents)
 * - History management with localStorage
 * - Responsive UI with Deepgram design system
 *
 * Architecture:
 * - Pure vanilla JavaScript (no frameworks required)
 * - Uses native Fetch API for HTTP requests
 * - LocalStorage for history persistence
 * - Event-driven UI updates
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * API endpoint for text intelligence requests
 */
const API_ENDPOINT = '/text-intelligence/analyze';

/**
 * LocalStorage key for history persistence
 */
const HISTORY_KEY = 'deepgram_text_intelligence_history';

/**
 * Maximum number of history entries to store
 */
const MAX_HISTORY_ENTRIES = 10;

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * DOM Elements - Cached references
 */
let textInput;
let urlInput;
let textModeBtn;
let urlModeBtn;
let textInputSection;
let urlInputSection;
let featureSummarize;
let featureTopics;
let featureSentiment;
let featureIntents;
let languageSelect;
let analyzeBtn;
let mainContent;
let statusContainer;
let statusMessage;
let metadataContainer;
let metadataGrid;
let historyTitle;
let historySidebarContent;
let clearHistoryBtn;

/**
 * Current input mode ('text' or 'url')
 */
let inputMode = 'text';

/**
 * Currently active analysis ID
 */
let activeAnalysisId = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  textInput = document.getElementById('textInput');
  urlInput = document.getElementById('urlInput');
  textModeBtn = document.getElementById('textModeBtn');
  urlModeBtn = document.getElementById('urlModeBtn');
  textInputSection = document.getElementById('textInputSection');
  urlInputSection = document.getElementById('urlInputSection');
  featureSummarize = document.getElementById('featureSummarize');
  featureTopics = document.getElementById('featureTopics');
  featureSentiment = document.getElementById('featureSentiment');
  featureIntents = document.getElementById('featureIntents');
  languageSelect = document.getElementById('language');
  analyzeBtn = document.getElementById('analyzeBtn');
  mainContent = document.getElementById('mainContent');
  statusContainer = document.getElementById('statusContainer');
  statusMessage = document.getElementById('statusMessage');
  metadataContainer = document.getElementById('metadataContainer');
  metadataGrid = document.getElementById('metadataGrid');
  historyTitle = document.getElementById('historyTitle');
  historySidebarContent = document.getElementById('historySidebarContent');
  clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // Set up event listeners
  textModeBtn.addEventListener('click', () => switchInputMode('text'));
  urlModeBtn.addEventListener('click', () => switchInputMode('url'));
  analyzeBtn.addEventListener('click', handleAnalyze);
  clearHistoryBtn.addEventListener('click', handleClearHistory);

  // Load and render history
  renderHistory();
});

// ============================================================================
// INPUT MODE MANAGEMENT
// ============================================================================

/**
 * Switch between text and URL input modes
 */
function switchInputMode(mode) {
  inputMode = mode;

  if (mode === 'text') {
    textModeBtn.classList.add('active');
    urlModeBtn.classList.remove('active');
    textInputSection.style.display = 'block';
    urlInputSection.style.display = 'none';
  } else {
    urlModeBtn.classList.add('active');
    textModeBtn.classList.remove('active');
    urlInputSection.style.display = 'block';
    textInputSection.style.display = 'none';
  }
}

// ============================================================================
// API INTERACTION
// ============================================================================

/**
 * Handle analyze button click
 */
async function handleAnalyze() {
  // Get input value based on mode
  const inputValue = inputMode === 'text' ? textInput.value.trim() : urlInput.value.trim();

  if (!inputValue) {
    showError('Please enter text or URL to analyze');
    return;
  }

  // Get selected features
  const features = {
    summarize: featureSummarize.checked,
    topics: featureTopics.checked,
    sentiment: featureSentiment.checked,
    intents: featureIntents.checked,
  };

  // Ensure at least one feature is selected
  if (!Object.values(features).some(v => v)) {
    showError('Please select at least one intelligence feature');
    return;
  }

  // Build query parameters
  const params = new URLSearchParams();
  if (features.summarize) params.append('summarize', 'true');
  if (features.topics) params.append('topics', 'true');
  if (features.sentiment) params.append('sentiment', 'true');
  if (features.intents) params.append('intents', 'true');
  params.append('language', languageSelect.value);

  // Build request body
  const body = inputMode === 'text'
    ? { text: inputValue }
    : { url: inputValue };

  // Generate request ID
  const requestId = `request_${Date.now()}`;

  // Show working state
  showWorking('Analyzing text...');
  setFormDisabled(true);

  try {
    const response = await fetch(`${API_ENDPOINT}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Analysis failed');
    }

    // Hide status, show results
    hideStatus();

    // Save to history
    const historyEntry = {
      id: requestId,
      timestamp: new Date().toISOString(),
      input: inputValue,
      inputMode,
      features,
      results: data.results,
    };
    saveToHistory(historyEntry);

    // Display results
    displayResults(data.results, features);

    // Display metadata
    displayMetadata(requestId, inputMode, inputValue);

    activeAnalysisId = requestId;

  } catch (error) {
    console.error('Analysis error:', error);
    showError(error.message || 'Failed to analyze text');
  } finally {
    setFormDisabled(false);
  }
}

// ============================================================================
// RESULTS DISPLAY
// ============================================================================

/**
 * Display analysis results in main content area
 */
function displayResults(results, features) {
  const container = document.createElement('div');
  container.className = 'results-container';

  // Summary
  if (features.summarize && results.summary) {
    container.appendChild(createSummarySection(results.summary));
  }

  // Topics
  if (features.topics && results.topics) {
    container.appendChild(createTopicsSection(results.topics));
  }

  // Sentiment
  if (features.sentiment && results.sentiments) {
    container.appendChild(createSentimentSection(results.sentiments));
  }

  // Intents
  if (features.intents && results.intents) {
    container.appendChild(createIntentsSection(results.intents));
  }

  mainContent.innerHTML = '';
  mainContent.appendChild(container);
}

/**
 * Create summary section
 */
function createSummarySection(summary) {
  const section = document.createElement('div');
  section.className = 'result-section';

  const heading = document.createElement('h3');
  heading.innerHTML = '<i class="fa-solid fa-file-lines"></i> Summary';
  section.appendChild(heading);

  if (summary.text) {
    const text = document.createElement('div');
    text.className = 'result-text';
    text.textContent = summary.text;
    section.appendChild(text);
  } else {
    const empty = document.createElement('p');
    empty.style.color = 'var(--dg-muted, #949498)';
    empty.textContent = 'No summary available';
    section.appendChild(empty);
  }

  return section;
}

/**
 * Create topics section
 */
function createTopicsSection(topicsData) {
  const section = document.createElement('div');
  section.className = 'result-section';

  const heading = document.createElement('h3');
  heading.innerHTML = '<i class="fa-solid fa-tags"></i> Topics';
  section.appendChild(heading);

  // Extract all topics from segments
  const allTopics = [];
  if (topicsData && topicsData.segments && Array.isArray(topicsData.segments)) {
    topicsData.segments.forEach(segment => {
      if (segment.topics && Array.isArray(segment.topics)) {
        segment.topics.forEach(topic => {
          allTopics.push(topic);
        });
      }
    });
  }

  if (allTopics.length > 0) {
    const list = document.createElement('div');
    list.className = 'topics-list';

    allTopics.forEach(item => {
      const badge = document.createElement('div');
      badge.className = 'topic-badge';

      const topicText = document.createElement('span');
      topicText.textContent = item.topic;

      badge.appendChild(topicText);

      if (item.confidence_score !== undefined) {
        const confidence = document.createElement('span');
        confidence.className = 'confidence-score';
        confidence.textContent = item.confidence_score.toFixed(2);
        badge.appendChild(confidence);
      }

      list.appendChild(badge);
    });

    section.appendChild(list);
  } else {
    const empty = document.createElement('p');
    empty.style.color = 'var(--dg-muted, #949498)';
    empty.textContent = 'No topics detected';
    section.appendChild(empty);
  }

  return section;
}

/**
 * Create sentiment section
 */
function createSentimentSection(sentimentsData) {
  const section = document.createElement('div');
  section.className = 'result-section';

  const heading = document.createElement('h3');
  heading.innerHTML = '<i class="fa-solid fa-heart-pulse"></i> Sentiment';
  section.appendChild(heading);

  if (sentimentsData && sentimentsData.average) {
    const display = document.createElement('div');
    display.className = 'sentiment-display';

    const icon = document.createElement('i');
    icon.className = `fa-solid sentiment-icon sentiment-${sentimentsData.average.sentiment}`;

    if (sentimentsData.average.sentiment === 'positive') {
      icon.classList.add('fa-face-smile');
    } else if (sentimentsData.average.sentiment === 'negative') {
      icon.classList.add('fa-face-frown');
    } else {
      icon.classList.add('fa-face-meh');
    }

    display.appendChild(icon);

    const textWrapper = document.createElement('div');

    const sentimentText = document.createElement('div');
    sentimentText.className = `sentiment-text sentiment-${sentimentsData.average.sentiment}`;
    sentimentText.textContent = sentimentsData.average.sentiment;
    textWrapper.appendChild(sentimentText);

    if (sentimentsData.average.sentiment_score !== undefined) {
      const confidence = document.createElement('div');
      confidence.className = 'confidence-score';
      confidence.textContent = `Score: ${sentimentsData.average.sentiment_score.toFixed(2)}`;
      textWrapper.appendChild(confidence);
    }

    display.appendChild(textWrapper);
    section.appendChild(display);

    // Optionally show segment breakdown
    if (sentimentsData.segments && sentimentsData.segments.length > 0) {
      const segmentsInfo = document.createElement('div');
      segmentsInfo.className = 'sentiment-segments-info';
      segmentsInfo.style.marginTop = '0.5rem';
      segmentsInfo.style.fontSize = '0.875rem';
      segmentsInfo.style.color = 'var(--dg-muted, #949498)';
      segmentsInfo.textContent = `${sentimentsData.segments.length} segment${sentimentsData.segments.length > 1 ? 's' : ''} analyzed`;
      section.appendChild(segmentsInfo);
    }
  } else {
    const empty = document.createElement('p');
    empty.style.color = 'var(--dg-muted, #949498)';
    empty.textContent = 'No sentiment analysis available';
    section.appendChild(empty);
  }

  return section;
}

/**
 * Create intents section
 */
function createIntentsSection(intentsData) {
  const section = document.createElement('div');
  section.className = 'result-section';

  const heading = document.createElement('h3');
  heading.innerHTML = '<i class="fa-solid fa-bullseye"></i> Intents';
  section.appendChild(heading);

  // Extract all intents from segments
  const allIntents = [];
  if (intentsData && intentsData.segments && Array.isArray(intentsData.segments)) {
    intentsData.segments.forEach(segment => {
      if (segment.intents && Array.isArray(segment.intents)) {
        segment.intents.forEach(intent => {
          allIntents.push(intent);
        });
      }
    });
  }

  if (allIntents.length > 0) {
    const list = document.createElement('div');
    list.className = 'intents-list';

    allIntents.forEach(item => {
      const badge = document.createElement('div');
      badge.className = 'intent-badge';

      const intentText = document.createElement('span');
      intentText.textContent = item.intent;

      badge.appendChild(intentText);

      if (item.confidence_score !== undefined) {
        const confidence = document.createElement('span');
        confidence.className = 'confidence-score';
        confidence.textContent = item.confidence_score.toFixed(2);
        badge.appendChild(confidence);
      }

      list.appendChild(badge);
    });

    section.appendChild(list);
  } else {
    const empty = document.createElement('p');
    empty.style.color = 'var(--dg-muted, #949498)';
    empty.textContent = 'No intents detected';
    section.appendChild(empty);
  }

  return section;
}

/**
 * Display metadata
 */
function displayMetadata(requestId, inputMode, input) {
  metadataGrid.innerHTML = '';

  const items = [
    { label: 'Request ID', value: requestId },
    { label: 'Input Mode', value: inputMode === 'text' ? 'Text' : 'URL' },
    { label: 'Input Preview', value: input.substring(0, 50) + (input.length > 50 ? '...' : '') },
    { label: 'Timestamp', value: new Date().toLocaleString() },
  ];

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'metadata-item';

    const label = document.createElement('div');
    label.className = 'metadata-label';
    label.textContent = item.label;

    const value = document.createElement('div');
    value.className = 'metadata-value';
    value.textContent = item.value;

    div.appendChild(label);
    div.appendChild(value);
    metadataGrid.appendChild(div);
  });

  metadataContainer.style.display = 'block';
}

// ============================================================================
// HISTORY MANAGEMENT
// ============================================================================

/**
 * Get history from localStorage
 */
function getHistory() {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
}

/**
 * Save entry to history
 */
function saveToHistory(entry) {
  try {
    const history = getHistory();
    history.unshift(entry);
    const trimmed = history.slice(0, MAX_HISTORY_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    renderHistory();
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

/**
 * Render history list
 */
function renderHistory() {
  const history = getHistory();

  historyTitle.textContent = `History (${history.length})`;

  if (history.length === 0) {
    historySidebarContent.innerHTML = '<div class="history-empty">No analyses yet</div>';
    clearHistoryBtn.style.display = 'none';
    return;
  }

  clearHistoryBtn.style.display = 'block';

  const list = document.createElement('div');
  list.className = 'history-list';

  history.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item';
    if (entry.id === activeAnalysisId) {
      item.classList.add('history-item--active');
    }

    const id = document.createElement('div');
    id.className = 'history-item__id';
    id.textContent = entry.id;

    const time = document.createElement('div');
    time.className = 'history-item__time';
    time.textContent = new Date(entry.timestamp).toLocaleString();

    const features = document.createElement('div');
    features.className = 'history-item__features';
    const featuresList = Object.entries(entry.features)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name)
      .join(', ');
    features.textContent = featuresList || 'No features';

    item.appendChild(id);
    item.appendChild(time);
    item.appendChild(features);

    item.addEventListener('click', () => {
      activeAnalysisId = entry.id;
      displayResults(entry.results, entry.features);
      displayMetadata(entry.id, entry.inputMode, entry.input);
      renderHistory();
    });

    list.appendChild(item);
  });

  historySidebarContent.innerHTML = '';
  historySidebarContent.appendChild(list);
}

/**
 * Clear all history
 */
function handleClearHistory() {
  if (confirm('Are you sure you want to clear all history?')) {
    localStorage.removeItem(HISTORY_KEY);
    activeAnalysisId = null;
    renderHistory();
    mainContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon dg-text-primary"><i class="fa-solid fa-brain"></i></div>
        <h2 class="dg-section-heading">Analyze Text with AI Intelligence</h2>
        <p class="dg-prose">
          Enter text or provide a URL, select the intelligence features you want, and click analyze to get insights.
        </p>
      </div>
    `;
    metadataContainer.style.display = 'none';
  }
}

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

/**
 * Show working/loading state
 */
function showWorking(message) {
  statusMessage.className = 'dg-status dg-status--with-icon dg-status--info';
  statusMessage.innerHTML = `
    <i class="fa-solid fa-circle-notch fa-spin dg-status__icon"></i>
    <span>${message}</span>
  `;
  statusContainer.style.display = 'block';
}

/**
 * Show error state
 */
function showError(message) {
  statusMessage.className = 'dg-status dg-status--with-icon dg-status--danger';
  statusMessage.innerHTML = `
    <i class="fa-solid fa-circle-exclamation dg-status__icon"></i>
    <span>${message}</span>
  `;
  statusContainer.style.display = 'block';
}

/**
 * Hide status message
 */
function hideStatus() {
  statusContainer.style.display = 'none';
}

/**
 * Enable/disable form inputs
 */
function setFormDisabled(disabled) {
  textInput.disabled = disabled;
  urlInput.disabled = disabled;
  featureSummarize.disabled = disabled;
  featureTopics.disabled = disabled;
  featureSentiment.disabled = disabled;
  featureIntents.disabled = disabled;
  languageSelect.disabled = disabled;
  analyzeBtn.disabled = disabled;
  textModeBtn.disabled = disabled;
  urlModeBtn.disabled = disabled;
}

