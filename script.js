// ===== THEME TOGGLE =====
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
}

// ===== DOM REFERENCES =====
const sections = Array.from(document.querySelectorAll('.section-panel'));
const navTriggers = Array.from(document.querySelectorAll('[data-section-target]'));
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const slider = document.getElementById('questionCount');

// ===== INITIALISE UI =====
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);

    document.querySelectorAll('[data-theme-toggle], #themeToggle').forEach(button => {
        button?.addEventListener('click', toggleTheme);
    });

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            const target = trigger.getAttribute('data-section-target');
            showSection(target);
        });
    });

    hamburger?.addEventListener('click', () => {
        const expanded = hamburger.classList.toggle('open');
        toggleMobileMenu(expanded);
    });

    mobileMenuClose?.addEventListener('click', () => toggleMobileMenu(false));

    if (dropZone) {
        const browseButton = dropZone.querySelector('.btn-secondary');
        browseButton?.addEventListener('click', (event) => {
            event.preventDefault();
            fileInput?.click();
        });
    }

    dropZone?.addEventListener('click', () => fileInput?.click());

    if (slider) {
        updateSliderValue(slider.value);
    }

    showSection('home');
});

function toggleMobileMenu(forceState) {
    if (!mobileMenu || !hamburger) return;
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', shouldOpen);
    mobileMenu.setAttribute('aria-hidden', String(!shouldOpen));
    hamburger.classList.toggle('open', shouldOpen);
    hamburger.setAttribute('aria-expanded', String(shouldOpen));
    document.body.classList.toggle('menu-open', shouldOpen);
}

// ===== SECTION NAVIGATION =====
function showSection(sectionId) {
    sections.forEach(section => {
        const isTarget = section.id === sectionId;
        if (isTarget) {
            section.classList.remove('hidden');
            requestAnimationFrame(() => section.classList.add('active'));
        } else {
            section.classList.remove('active');
            section.classList.add('hidden');
        }
    });

    navTriggers.forEach(link => {
        const linkTarget = link.getAttribute('data-section-target');
        link.classList.toggle('active', linkTarget === sectionId);
    });

    toggleMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== FILE UPLOAD HANDLING =====
function handleDragOver(event) {
    event.preventDefault();
    dropZone?.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    dropZone?.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    dropZone?.classList.remove('drag-over');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        const textArea = document.getElementById('textInput');
        if (textArea) {
            textArea.placeholder = `File "${file.name}" ready. Paste or type your content...`;
        }
        showToast('File uploaded successfully! You can now paste text or generate questions.', 'success');
    };

    if (file.type === 'text/plain') {
        reader.readAsText(file);
    } else {
        showToast('File uploaded! (Note: PDF/DOC parsing requires backend integration)', 'success');
    }
}

// ===== DUMMY QUESTION DATA =====
const dummyQuestions = {
    MCQ: [
        {
            text: "What is the primary purpose of machine learning?",
            options: [
                "To enable computers to learn from data without explicit programming",
                "To replace human intelligence completely",
                "To only process numerical data",
                "To work exclusively with images"
            ],
            difficulty: "Easy"
        },
        {
            text: "Which algorithm is best suited for classification problems with non-linear boundaries?",
            options: [
                "Linear Regression",
                "Support Vector Machine with RBF kernel",
                "Simple Linear Classifier",
                "Basic Decision Tree"
            ],
            difficulty: "Medium"
        },
        {
            text: "What is the time complexity of the QuickSort algorithm in the average case?",
            options: [
                "O(n²)",
                "O(n log n)",
                "O(n)",
                "O(log n)"
            ],
            difficulty: "Hard"
        },
        {
            text: "In neural networks, what does the term 'backpropagation' refer to?",
            options: [
                "Forward data flow through layers",
                "The process of updating weights by propagating errors backward",
                "A type of activation function",
                "The input layer structure"
            ],
            difficulty: "Medium"
        },
        {
            text: "What is the main advantage of using gradient descent in optimization?",
            options: [
                "It always finds the global minimum",
                "It requires no computation",
                "It efficiently finds local minima/maxima by following gradients",
                "It works only for linear functions"
            ],
            difficulty: "Easy"
        }
    ],
    "Short Answer": [
        {
            text: "Explain the difference between supervised and unsupervised learning in one sentence.",
            difficulty: "Easy"
        },
        {
            text: "What is overfitting in machine learning and how can it be prevented?",
            difficulty: "Medium"
        },
        {
            text: "Describe the concept of regularization in neural networks.",
            difficulty: "Medium"
        },
        {
            text: "What role does the learning rate play in gradient descent optimization?",
            difficulty: "Hard"
        },
        {
            text: "Explain the bias-variance tradeoff in machine learning models.",
            difficulty: "Hard"
        }
    ],
    "Long Answer": [
        {
            text: "Discuss the evolution of artificial intelligence from its inception to modern deep learning. Include key milestones and their impact on the field.",
            difficulty: "Medium"
        },
        {
            text: "Compare and contrast different types of neural network architectures (CNN, RNN, Transformer). Explain their use cases and limitations.",
            difficulty: "Hard"
        },
        {
            text: "Explain the complete workflow of a machine learning project from data collection to model deployment. Include best practices at each stage.",
            difficulty: "Hard"
        },
        {
            text: "Describe how natural language processing has evolved with transformer models. What problems did they solve that previous architectures couldn't?",
            difficulty: "Hard"
        },
        {
            text: "Analyze the ethical implications of AI in modern society. Discuss both benefits and potential risks.",
            difficulty: "Medium"
        }
    ]
};

// ===== QUESTION GENERATION =====
function generateQuestions() {
    const questionType = document.getElementById('questionType').value;
    const difficulty = document.getElementById('difficulty').value;
    const questionCount = parseInt(document.getElementById('questionCount').value, 10);
    const textInput = document.getElementById('textInput').value;
    const loader = document.getElementById('loader');

    if (!textInput.trim() && !(fileInput && fileInput.files && fileInput.files.length)) {
        showToast('Please upload a file or enter some text!', 'error');
        return;
    }

    loader?.classList.add('active');

    setTimeout(() => {
        loader?.classList.remove('active');

        let questions = [...dummyQuestions[questionType]];

        if (difficulty !== 'All') {
            questions = questions.filter(q => q.difficulty === difficulty);
        }

        questions = questions.slice(0, questionCount);

        while (questions.length < questionCount) {
            questions.push(...questions.slice(0, questionCount - questions.length));
        }

        displayQuestions(questions, questionType);
        showSection('results');
        showToast('Questions generated successfully!', 'success');
    }, 2000);
}

// ===== DISPLAY QUESTIONS =====
function displayQuestions(questions, questionType) {
    const questionsGrid = document.getElementById('questionsGrid');
    if (!questionsGrid) return;

    questionsGrid.innerHTML = '';

    questions.forEach((question, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';

        const difficultyClass = question.difficulty.toLowerCase();
        let cardMarkup = `
            <div class="question-header">
                <span class="question-number">Question ${index + 1}</span>
                <div class="question-badges">
                    <span class="badge badge-type">${questionType}</span>
                    <span class="badge badge-difficulty badge-${difficultyClass}">${question.difficulty}</span>
                </div>
            </div>
            <div class="question-text">${question.text}</div>
        `;

        if (questionType === 'MCQ' && question.options) {
            cardMarkup += '<ul class="question-options">';
            question.options.forEach((option, optionIndex) => {
                cardMarkup += `<li>${String.fromCharCode(65 + optionIndex)}. ${option}</li>`;
            });
            cardMarkup += '</ul>';
        }

        card.innerHTML = cardMarkup;
        questionsGrid.appendChild(card);
    });
}

// ===== SLIDER VALUE UPDATE =====
function updateSliderValue(value) {
    const sliderValue = document.getElementById('sliderValue');
    if (sliderValue) {
        sliderValue.textContent = value;
    }
}

// ===== EXPORT TO PDF =====
function exportToPDF() {
    showToast('Preparing PDF export...', 'success');
    setTimeout(() => {
        window.print();
    }, 500);
}

// ===== GENERATE AGAIN =====
function generateAgain() {
    showSection('upload');
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
    document.querySelectorAll('.toast').forEach(existing => existing.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 350);
    }, 3200);
}

// ===== PRINT STYLING =====
const printCleanup = [];

window.addEventListener('beforeprint', () => {
    sections.forEach(section => {
        const wasHidden = section.classList.contains('hidden');
        printCleanup.push({ section, wasHidden });
        if (section.id !== 'results') {
            section.classList.add('hidden');
            section.classList.remove('active');
        } else {
            section.classList.remove('hidden');
            section.classList.add('active');
        }
    });

    document.querySelector('.app-topbar')?.classList.add('print-hide');
    document.querySelector('.app-sidebar')?.classList.add('print-hide');
    document.querySelector('.app-footer')?.classList.add('print-hide');
});

window.addEventListener('afterprint', () => {
    printCleanup.forEach(({ section, wasHidden }) => {
        section.classList.toggle('hidden', wasHidden);
        if (!wasHidden) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    printCleanup.length = 0;

    document.querySelector('.app-topbar')?.classList.remove('print-hide');
    document.querySelector('.app-sidebar')?.classList.remove('print-hide');
    document.querySelector('.app-footer')?.classList.remove('print-hide');
});

// ===== EXPOSE GLOBALS FOR INLINE HANDLERS =====
window.showSection = showSection;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.handleFileSelect = handleFileSelect;
window.generateQuestions = generateQuestions;
window.displayQuestions = displayQuestions;
window.updateSliderValue = updateSliderValue;
window.exportToPDF = exportToPDF;
window.generateAgain = generateAgain;
window.showToast = showToast;
