// Audio Player State
let state = {
    audioElement: null,
    fileInput: null,
    selectedFile: null,
    audioUrl: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoaded: false,
    animationFrameId: null,
    playbackRate: 1.0,
    isEditingPosition: false,

    // Loop controls
    loopEnabled: false,
    loopStartMinutes: '00',
    loopStartSeconds: '00',
    loopStartMilliseconds: '000',
    loopEndMinutes: '00',
    loopEndSeconds: '00',
    loopEndMilliseconds: '000',

    // Position display
    positionMinutes: '00',
    positionSeconds: '00',
    positionMilliseconds: '000'
};

// DOM Elements
let elements = {};

// Utility Functions
function formatTime(seconds) {
    if (isNaN(seconds) || seconds === 0) {
        return '00:00:000';
    }

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
}

function updatePositionFields() {
    if (state.isEditingPosition) return;

    const minutes = Math.floor(state.currentTime / 60);
    const secs = Math.floor(state.currentTime % 60);
    const ms = Math.floor((state.currentTime % 1) * 1000);

    state.positionMinutes = minutes.toString();
    state.positionSeconds = secs.toString();
    state.positionMilliseconds = ms.toString();

    elements.positionMinutes.value = state.positionMinutes;
    elements.positionSeconds.value = state.positionSeconds;
    elements.positionMilliseconds.value = state.positionMilliseconds;
}

function handlePositionChange() {
    if (!state.audioElement || !state.isLoaded) return;

    const minutes = parseInt(state.positionMinutes) || 0;
    const seconds = parseInt(state.positionSeconds) || 0;
    const ms = parseInt(state.positionMilliseconds) || 0;

    // Validate inputs
    if (seconds >= 60 || ms >= 1000) return;

    const totalSeconds = minutes * 60 + seconds + ms / 1000;

    // Don't allow seeking beyond duration
    if (totalSeconds > state.duration) return;

    state.audioElement.currentTime = totalSeconds;
}

function handlePositionInput(event, field) {
    const value = event.target.value;

    // Update the specific field
    state[`position${field.charAt(0).toUpperCase() + field.slice(1)}`] = value;

    handlePositionChange();
}

function handlePositionFocus() {
    state.isEditingPosition = true;
}

function handlePositionBlur() {
    state.isEditingPosition = false;
    updatePositionFields();
}

function handleLoopInput(event, field, type) {
    const value = event.target.value;
    const fieldKey = `loop${type.charAt(0).toUpperCase() + type.slice(1)}${field.charAt(0).toUpperCase() + field.slice(1)}`;
    state[fieldKey] = value;
}

function getLoopTime(type) {
    const prefix = `loop${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const minutes = parseInt(state[`${prefix}Minutes`]) || 0;
    const seconds = parseInt(state[`${prefix}Seconds`]) || 0;
    const ms = parseInt(state[`${prefix}Milliseconds`]) || 0;
    return minutes * 60 + seconds + ms / 1000;
}

function setLoopStart() {
    if (!state.audioElement || !state.isLoaded) return;

    const current = state.audioElement.currentTime;
    const minutes = Math.floor(current / 60);
    const secs = Math.floor(current % 60);
    const ms = Math.floor((current % 1) * 1000);

    state.loopStartMinutes = minutes.toString();
    state.loopStartSeconds = secs.toString();
    state.loopStartMilliseconds = ms.toString();

    elements.loopStartMinutes.value = state.loopStartMinutes;
    elements.loopStartSeconds.value = state.loopStartSeconds;
    elements.loopStartMilliseconds.value = state.loopStartMilliseconds;
}

function setLoopEnd() {
    if (!state.audioElement || !state.isLoaded) return;

    const current = state.audioElement.currentTime;
    const minutes = Math.floor(current / 60);
    const secs = Math.floor(current % 60);
    const ms = Math.floor((current % 1) * 1000);

    state.loopEndMinutes = minutes.toString();
    state.loopEndSeconds = secs.toString();
    state.loopEndMilliseconds = ms.toString();

    elements.loopEndMinutes.value = state.loopEndMinutes;
    elements.loopEndSeconds.value = state.loopEndSeconds;
    elements.loopEndMilliseconds.value = state.loopEndMilliseconds;
}

function updateTimestamps() {
    if (state.audioElement && elements.endTime) {
        const current = state.audioElement.currentTime;
        const total = state.audioElement.duration || 0;

        elements.endTime.textContent = `length: ${formatTime(total)}`;

        // Update progress bar and position fields
        state.currentTime = current;
        updatePositionFields();

        // Update progress bar
        const progressPercent = state.duration > 0 ? (current / state.duration) * 100 : 0;
        elements.progressBar.style.width = `${progressPercent}%`;

        // Handle looping
        if (state.loopEnabled && state.audioElement && state.isLoaded) {
            const loopEnd = getLoopTime('end');
            const loopStart = getLoopTime('start');

            if (loopEnd > 0 && current >= loopEnd) {
                state.audioElement.currentTime = loopStart;
            }
        }
    }

    if (state.isPlaying && state.audioElement && !state.audioElement.ended) {
        state.animationFrameId = requestAnimationFrame(updateTimestamps);
    }
}

// Event Handlers
function handleFileSelect(event) {
    const file = event.target.files?.[0];

    if (file && file.type.startsWith('audio/')) {
        state.selectedFile = file;
        elements.selectedFileName.textContent = file.name;

        // Clean up previous URL
        if (state.audioUrl) {
            URL.revokeObjectURL(state.audioUrl);
        }

        // Create new object URL
        state.audioUrl = URL.createObjectURL(file);
        state.isLoaded = false;
        state.isPlaying = false;
        state.currentTime = 0;
        state.duration = 0;

        // Set the audio source
        state.audioElement.src = state.audioUrl;
    } else {
        alert('Please select a valid audio file.');
    }
}

function togglePlayPause() {
    if (!state.audioElement || !state.isLoaded) return;

    if (state.isPlaying) {
        state.audioElement.pause();
    } else {
        state.audioElement.play();
    }
}

function handleLoadedMetadata() {
    state.duration = state.audioElement.duration;
    state.isLoaded = true;
    state.audioElement.preservesPitch = true;
    state.audioElement.playbackRate = state.playbackRate;

    // Enable controls
    elements.playPauseBtn.disabled = false;
    elements.playbackRate.disabled = false;
    elements.positionMinutes.disabled = false;
    elements.positionSeconds.disabled = false;
    elements.positionMilliseconds.disabled = false;
    elements.loopStartMinutes.disabled = false;
    elements.loopStartSeconds.disabled = false;
    elements.loopStartMilliseconds.disabled = false;
    elements.loopEndMinutes.disabled = false;
    elements.loopEndSeconds.disabled = false;
    elements.loopEndMilliseconds.disabled = false;
    elements.setLoopStartBtn.disabled = false;
    elements.setLoopEndBtn.disabled = false;
    elements.loopEnabled.disabled = false;

    // Update end time display
    elements.endTime.textContent = `length: ${formatTime(state.duration)}`;
}

function handleTimeUpdate() {
    state.currentTime = state.audioElement.currentTime;
    updatePositionFields();

    // Update progress bar
    const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
    elements.progressBar.style.width = `${progressPercent}%`;

    // Handle looping
    if (state.loopEnabled && state.audioElement && state.isLoaded) {
        const loopEnd = getLoopTime('end');
        const loopStart = getLoopTime('start');

        if (loopEnd > 0 && state.currentTime >= loopEnd) {
            state.audioElement.currentTime = loopStart;
        }
    }
}

function handlePlay() {
    state.isPlaying = true;
    elements.playPauseBtn.textContent = 'pause';
    updateTimestamps();
}

function handlePause() {
    state.isPlaying = false;
    elements.playPauseBtn.textContent = 'play';
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        state.animationFrameId = null;
    }
}

function handleEnded() {
    state.isPlaying = false;
    state.currentTime = 0;
    elements.playPauseBtn.textContent = 'play';
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        state.animationFrameId = null;
    }
}

function selectFile() {
    elements.fileInput.click();
}

function handlePlaybackRateChange() {
    state.playbackRate = parseFloat(elements.playbackRate.value);
    elements.playbackRateDisplay.textContent = `${state.playbackRate.toFixed(2)}x`;

    if (state.audioElement && state.isLoaded) {
        state.audioElement.playbackRate = state.playbackRate;
    }
}

function handleLoopEnabledChange() {
    state.loopEnabled = elements.loopEnabled.checked;
}

// Initialize the application
function init() {
    // Get DOM elements
    elements = {
        fileInput: document.getElementById('file-input'),
        selectFileBtn: document.getElementById('select-file-btn'),
        selectedFileName: document.getElementById('selected-file-name'),
        audioElement: document.getElementById('audio-element'),
        endTime: document.getElementById('end-time'),
        playPauseBtn: document.getElementById('play-pause-btn'),
        playbackRate: document.getElementById('playback-rate'),
        playbackRateDisplay: document.getElementById('playback-rate-display'),
        progressBar: document.getElementById('progress-bar'),
        positionMinutes: document.getElementById('position-minutes'),
        positionSeconds: document.getElementById('position-seconds'),
        positionMilliseconds: document.getElementById('position-milliseconds'),
        loopStartMinutes: document.getElementById('loop-start-minutes'),
        loopStartSeconds: document.getElementById('loop-start-seconds'),
        loopStartMilliseconds: document.getElementById('loop-start-milliseconds'),
        loopEndMinutes: document.getElementById('loop-end-minutes'),
        loopEndSeconds: document.getElementById('loop-end-seconds'),
        loopEndMilliseconds: document.getElementById('loop-end-milliseconds'),
        setLoopStartBtn: document.getElementById('set-loop-start-btn'),
        setLoopEndBtn: document.getElementById('set-loop-end-btn'),
        loopEnabled: document.getElementById('loop-enabled')
    };

    // Store audio element reference in state
    state.audioElement = elements.audioElement;
    state.fileInput = elements.fileInput;

    // Add event listeners
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.selectFileBtn.addEventListener('click', selectFile);
    elements.playPauseBtn.addEventListener('click', togglePlayPause);
    elements.playbackRate.addEventListener('input', handlePlaybackRateChange);

    // Position input event listeners
    elements.positionMinutes.addEventListener('input', (e) => handlePositionInput(e, 'minutes'));
    elements.positionMinutes.addEventListener('focus', handlePositionFocus);
    elements.positionMinutes.addEventListener('blur', handlePositionBlur);

    elements.positionSeconds.addEventListener('input', (e) => handlePositionInput(e, 'seconds'));
    elements.positionSeconds.addEventListener('focus', handlePositionFocus);
    elements.positionSeconds.addEventListener('blur', handlePositionBlur);

    elements.positionMilliseconds.addEventListener('input', (e) => handlePositionInput(e, 'milliseconds'));
    elements.positionMilliseconds.addEventListener('focus', handlePositionFocus);
    elements.positionMilliseconds.addEventListener('blur', handlePositionBlur);

    // Loop input event listeners
    elements.loopStartMinutes.addEventListener('input', (e) => handleLoopInput(e, 'minutes', 'start'));
    elements.loopStartSeconds.addEventListener('input', (e) => handleLoopInput(e, 'seconds', 'start'));
    elements.loopStartMilliseconds.addEventListener('input', (e) => handleLoopInput(e, 'milliseconds', 'start'));

    elements.loopEndMinutes.addEventListener('input', (e) => handleLoopInput(e, 'minutes', 'end'));
    elements.loopEndSeconds.addEventListener('input', (e) => handleLoopInput(e, 'seconds', 'end'));
    elements.loopEndMilliseconds.addEventListener('input', (e) => handleLoopInput(e, 'milliseconds', 'end'));

    // Loop control event listeners
    elements.setLoopStartBtn.addEventListener('click', setLoopStart);
    elements.setLoopEndBtn.addEventListener('click', setLoopEnd);
    elements.loopEnabled.addEventListener('change', handleLoopEnabledChange);

    // Audio element event listeners
    elements.audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    elements.audioElement.addEventListener('timeupdate', handleTimeUpdate);
    elements.audioElement.addEventListener('play', handlePlay);
    elements.audioElement.addEventListener('pause', handlePause);
    elements.audioElement.addEventListener('ended', handleEnded);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (state.audioUrl) {
            URL.revokeObjectURL(state.audioUrl);
        }
        if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
        }
    });
}

// Start the application when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
