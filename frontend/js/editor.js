class VideoEditor {
    constructor() {
        this.video = document.getElementById('videoPreview');
        this.videoContainer = document.getElementById('videoContainer');
        this.dropZone = document.getElementById('dropZone');
        this.uploadVideoBtn = document.getElementById('uploadVideoBtn');
        this.videoUpload = document.getElementById('videoUpload');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.overlays = [];
        this.selectedOverlay = null;
        this.isPlaying = false;
        
        // Initialize the editor
        this.initEventListeners();
        this.setupDragAndDrop();
    }

    initEventListeners() {
        // Video upload
        this.uploadVideoBtn.addEventListener('click', () => this.videoUpload.click());
        this.videoUpload.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));
        
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // Video time update
        this.video.addEventListener('timeupdate', () => this.updateTimeDisplay());
        this.video.addEventListener('loadedmetadata', () => {
            this.durationEl.textContent = this.formatTime(this.video.duration);
        });
        
        // Overlay buttons
        document.getElementById('addTextBtn').addEventListener('click', () => this.showTextOverlayModal());
        document.getElementById('addImageBtn').addEventListener('click', () => this.imageUpload.click());
        document.getElementById('imageUpload').addEventListener('change', (e) => this.handleImageUpload(e.target.files[0]));
        
        // Submit button
        document.getElementById('submitBtn').addEventListener('click', () => this.submitProject());
    }

    setupDragAndDrop() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => this.highlightDropZone(true), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => this.highlightDropZone(false), false);
        });

        // Handle dropped files
        this.dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlightDropZone(highlight) {
        this.dropZone.classList.toggle('active', highlight);
    }

    async handleFileUpload(file) {
        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file');
            return;
        }

        const videoUrl = URL.createObjectURL(file);
        this.video.src = videoUrl;
        this.video.style.display = 'block';
        this.dropZone.style.display = 'none';
        
        // Store the file for later submission
        this.videoFile = file;
    }

    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.addOverlay('image', e.target.result);
        };
        reader.readAsDataURL(file);
    }

    showTextOverlayModal() {
        const modal = document.getElementById('textOverlayModal');
        modal.style.display = 'flex';
        
        const closeBtn = modal.querySelector('.close');
        const addBtn = document.getElementById('addTextOverlayBtn');
        
        const closeModal = () => {
            modal.style.display = 'none';
            closeBtn.removeEventListener('click', closeModal);
            addBtn.removeEventListener('click', addTextOverlay);
        };
        
        const addTextOverlay = () => {
            const text = document.getElementById('overlayText').value;
            const color = document.getElementById('textColor').value;
            const size = document.getElementById('fontSize').value;
            
            if (text.trim()) {
                const style = {
                    color,
                    fontSize: `${size}px`
                };
                this.addOverlay('text', text, style);
                closeModal();
            }
        };
        
        closeBtn.addEventListener('click', closeModal);
        addBtn.addEventListener('click', addTextOverlay);
    }

    addOverlay(type, content, style = {}) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay fade-in';
        
        if (type === 'text') {
            overlay.innerHTML = `<div class="overlay-text" style="color: ${style.color || 'white'}; font-size: ${style.fontSize || '24px'};">${content}</div>`;
        } else if (type === 'image') {
            overlay.innerHTML = `<img src="${content}" class="overlay-image" draggable="false">`;
        }
        
        // Position overlay in the center
        overlay.style.left = '50%';
        overlay.style.top = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        
        // Add overlay to the video container
        this.videoContainer.appendChild(overlay);
        
        // Make overlay draggable
        this.makeDraggable(overlay);
        
        // Add to overlays array
        const overlayData = {
            id: Date.now(),
            element: overlay,
            type,
            content,
            style,
            startTime: 0,
            endTime: this.video.duration || 10,
            position: { x: 50, y: 50 }
        };
        
        this.overlays.push(overlayData);
        this.selectOverlay(overlayData);
        
        return overlayData;
    }

    makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;
        
        element.addEventListener('mousedown', (e) => {
            // Don't start dragging if clicking on a form element
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
                return;
            }
            
            isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            element.style.cursor = 'grabbing';
            
            // Select this overlay
            const overlay = this.overlays.find(ov => ov.element === element);
            if (overlay) {
                this.selectOverlay(overlay);
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const containerRect = this.videoContainer.getBoundingClientRect();
            let x = ((e.clientX - containerRect.left - offsetX) / containerRect.width) * 100;
            let y = ((e.clientY - containerRect.top - offsetY) / containerRect.height) * 100;
            
            // Keep within bounds
            x = Math.max(0, Math.min(x, 100));
            y = Math.max(0, Math.min(y, 100));
            
            element.style.left = `${x}%`;
            element.style.top = `${y}%`;
            
            // Update overlay data
            const overlay = this.overlays.find(ov => ov.element === element);
            if (overlay) {
                overlay.position = { x, y };
                this.updatePropertiesPanel(overlay);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            element.style.cursor = 'grab';
        });
        
        element.style.cursor = 'grab';
    }

    selectOverlay(overlay) {
        // Remove selected class from all overlays
        this.overlays.forEach(ov => {
            ov.element.classList.remove('selected');
        });
        
        // Add selected class to clicked overlay
        overlay.element.classList.add('selected');
        this.selectedOverlay = overlay;
        
        // Update properties panel
        this.updatePropertiesPanel(overlay);
    }

    updatePropertiesPanel(overlay) {
        const panel = document.getElementById('overlayProperties');
        
        if (!overlay) {
            panel.innerHTML = '<p class="hint">Select an overlay to edit its properties</p>';
            return;
        }
        
        panel.innerHTML = `
            <div class="form-group">
                <label>Type: ${overlay.type}</label>
            </div>
            <div class="form-group">
                <label for="startTime">Start Time (s):</label>
                <input type="number" id="startTime" value="${overlay.startTime}" min="0" step="0.1">
            </div>
            <div class="form-group">
                <label for="endTime">End Time (s):</label>
                <input type="number" id="endTime" value="${overlay.endTime}" min="0.1" step="0.1">
            </div>
            <div class="form-group">
                <button id="removeOverlayBtn" class="btn btn-block">Remove Overlay</button>
            </div>
        `;
        
        // Add event listeners for property changes
        const startTimeInput = panel.querySelector('#startTime');
        const endTimeInput = panel.querySelector('#endTime');
        const removeBtn = panel.querySelector('#removeOverlayBtn');
        
        startTimeInput.addEventListener('change', (e) => {
            overlay.startTime = parseFloat(e.target.value);
            this.updateOverlayVisibility();
        });
        
        endTimeInput.addEventListener('change', (e) => {
            overlay.endTime = parseFloat(e.target.value);
            this.updateOverlayVisibility();
        });
        
        removeBtn.addEventListener('click', () => {
            this.removeOverlay(overlay);
        });
    }

    updateOverlayVisibility() {
        const currentTime = this.video.currentTime;
        
        this.overlays.forEach(overlay => {
            const isVisible = currentTime >= overlay.startTime && currentTime <= overlay.endTime;
            overlay.element.style.display = isVisible ? 'block' : 'none';
        });
    }

    removeOverlay(overlay) {
        const index = this.overlays.indexOf(overlay);
        if (index > -1) {
            this.overlays.splice(index, 1);
            overlay.element.remove();
            this.selectedOverlay = null;
            this.updatePropertiesPanel(null);
        }
    }

    togglePlayPause() {
        if (this.video.paused) {
            this.video.play();
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.isPlaying = true;
        } else {
            this.video.pause();
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.isPlaying = false;
        }
    }

    updateTimeDisplay() {
        this.currentTimeEl.textContent = this.formatTime(this.video.currentTime);
        this.updateOverlayVisibility();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    async submitProject() {
        if (!this.videoFile) {
            alert('Please upload a video first');
            return;
        }
        
        if (this.overlays.length === 0) {
            alert('Please add at least one overlay');
            return;
        }
        
        // Prepare form data
        const formData = new FormData();
        formData.append('video', this.videoFile);
        
        // Add overlays metadata
        const overlaysData = this.overlays.map(overlay => ({
            type: overlay.type,
            content: overlay.content,
            style: overlay.style,
            position: overlay.position,
            startTime: overlay.startTime,
            endTime: overlay.endTime
        }));
        
        formData.append('overlays', JSON.stringify(overlaysData));
        
        try {
            // Replace with your actual API endpoint
            const response = await fetch('YOUR_API_ENDPOINT', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Video submitted successfully!');
                console.log('Submission result:', result);
            } else {
                throw new Error('Failed to submit video');
            }
        } catch (error) {
            console.error('Error submitting video:', error);
            alert('Error submitting video. Please try again.');
        }
    }
}

// Initialize the video editor when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.videoEditor = new VideoEditor();
});
