// DOM Elements
const sourceCodeTextarea = document.getElementById('sourceCode');
const compileBtn = document.getElementById('compileBtn');
const examplesBtn = document.getElementById('examplesBtn');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const errorMessage = document.getElementById('errorMessage');
const outputContent = document.getElementById('outputContent');
const tokensContent = document.getElementById('tokensContent');
const generatedContent = document.getElementById('generatedContent');
const tabs = document.querySelectorAll('.tab');
const examplesModal = document.getElementById('examplesModal');
const closeModal = document.getElementById('closeModal');
const compileText = document.getElementById('compileText');

// State
let currentTab = 'output';
let examplesData = null;

// Example data
const exampleCategories = {
    basics: {
        name: '📚 Basic Syntax',
        examples: [
            {
                name: 'Hello World',
                code: `print "Hello, EBPL World!"`,
                description: 'The simplest EBPL program - printing a message.'
            },
            {
                name: 'Variables',
                code: `create variable name with value "Alice"
create variable age with value 25
print name
print age`,
                description: 'Creating and using variables with different data types.'
            },
            {
                name: 'Basic Math',
                code: `create variable a with value 10
create variable b with value 5
print a + b
print a - b
print a * b
print a / b`,
                description: 'Basic arithmetic operations with variables.'
            }
        ]
    },
    math: {
        name: '🧮 Math Operations',
        examples: [
            {
                name: 'Calculator',
                code: `create variable num1 with value 15
create variable num2 with value 3

create variable addition with value num1 + num2
create variable subtraction with value num1 - num2
create variable multiplication with value num1 * num2
create variable division with value num1 / num2

print "Calculator Results:"
print addition
print subtraction
print multiplication
print division`,
                description: 'Complete calculator with all basic operations.'
            }
        ]
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load default example
    sourceCodeTextarea.value = exampleCategories.basics.examples[0].code;
    
    // Add event listeners
    compileBtn.addEventListener('click', compileCode);
    examplesBtn.addEventListener('click', openExamplesModal);
    saveBtn.addEventListener('click', saveSnippet);
    clearBtn.addEventListener('click', clearAll);
    closeModal.addEventListener('click', closeExamplesModal);
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Close modal when clicking outside
    examplesModal.addEventListener('click', (e) => {
        if (e.target === examplesModal) {
            closeExamplesModal();
        }
    });
});

// Compile EBPL code
async function compileCode() {
    const sourceCode = sourceCodeTextarea.value.trim();
    
    if (!sourceCode) {
        showError('Please enter some EBPL code!');
        return;
    }
    
    setLoading(true);
    clearError();
    clearResults();
    
    try {
        // Use the EBPL compiler (included in compiler-core.js)
        const compiler = new EBPLCompiler();
        const result = compiler.compile(sourceCode);
        
        if (result.success) {
            // Display tokens
            if (result.tokens && result.tokens.length > 0) {
                tokensContent.textContent = result.tokens.join('\n');
            }
            
            // Display generated code
            if (result.generatedCode) {
                generatedContent.textContent = result.generatedCode;
            }
            
            // Display execution output
            if (result.executionOutput && result.executionOutput.trim()) {
                outputContent.textContent = result.executionOutput;
            } else if (result.executionError && result.executionError.trim()) {
                outputContent.textContent = `Execution Error:\n${result.executionError}`;
            } else {
                outputContent.textContent = '✅ Compilation successful! No output generated.';
            }
        } else {
            showError(result.error || 'Compilation failed');
            outputContent.textContent = `❌ Compilation Error: ${result.error}`;
        }
    } catch (error) {
        showError('Compilation failed: ' + error.message);
        outputContent.textContent = `❌ Error: ${error.message}`;
    } finally {
        setLoading(false);
    }
}

// Save snippet (local storage)
function saveSnippet() {
    const sourceCode = sourceCodeTextarea.value.trim();
    
    if (!sourceCode) {
        showError('Please enter some code to save!');
        return;
    }
    
    try {
        const snippets = JSON.parse(localStorage.getItem('ebplSnippets') || '[]');
        const newSnippet = {
            id: Date.now(),
            title: 'EBPL Snippet',
            description: 'Saved from compiler',
            sourceCode: sourceCode,
            createdAt: new Date().toISOString()
        };
        
        snippets.push(newSnippet);
        localStorage.setItem('ebplSnippets', JSON.stringify(snippets));
        
        alert('✅ Snippet saved successfully!');
    } catch (error) {
        showError('Failed to save snippet: ' + error.message);
    }
}

// Clear all
function clearAll() {
    sourceCodeTextarea.value = '';
    clearError();
    clearResults();
}

// Clear results
function clearResults() {
    outputContent.textContent = 'Output will appear here after compilation...';
    tokensContent.textContent = 'No tokens generated yet...';
    generatedContent.textContent = 'No generated code yet...';
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

// Clear error
function clearError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
}

// Set loading state
function setLoading(loading) {
    if (loading) {
        compileBtn.disabled = true;
        compileText.innerHTML = '<i class="fas fa-spinner spinner"></i> Compiling...';
    } else {
        compileBtn.disabled = false;
        compileText.textContent = 'Compile & Run';
    }
}

// Switch tabs
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update active tab
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Show corresponding content
    outputContent.classList.add('hidden');
    tokensContent.classList.add('hidden');
    generatedContent.classList.add('hidden');
    
    if (tabName === 'output') {
        outputContent.classList.remove('hidden');
    } else if (tabName === 'tokens') {
        tokensContent.classList.remove('hidden');
    } else if (tabName === 'generated') {
        generatedContent.classList.remove('hidden');
    }
}

// Examples Modal
function openExamplesModal() {
    examplesModal.classList.remove('hidden');
    initializeExamplesModal();
}

function closeExamplesModal() {
    examplesModal.classList.add('hidden');
}

function initializeExamplesModal() {
    const sidebar = document.querySelector('.examples-sidebar');
    const content = document.querySelector('.example-content');
    
    // Clear previous content
    sidebar.innerHTML = '';
    content.innerHTML = '';
    
    // Create category buttons
    Object.entries(exampleCategories).forEach(([categoryKey, category]) => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'example-category';
        categoryElement.textContent = category.name;
        categoryElement.addEventListener('click', () => {
            // Set this category as active
            document.querySelectorAll('.example-category').forEach(cat => {
                cat.classList.remove('active');
            });
            categoryElement.classList.add('active');
            displayExamplesForCategory(categoryKey);
        });
        
        sidebar.appendChild(categoryElement);
    });
    
    // Activate first category
    const firstCategory = sidebar.querySelector('.example-category');
    if (firstCategory) {
        firstCategory.classList.add('active');
        displayExamplesForCategory(Object.keys(exampleCategories)[0]);
    }
}

function displayExamplesForCategory(categoryKey) {
    const category = exampleCategories[categoryKey];
    const content = document.querySelector('.example-content');
    
    content.innerHTML = '';
    
    if (!category) return;
    
    // Create example list
    const exampleList = document.createElement('div');
    exampleList.className = 'example-list';
    
    category.examples.forEach((example, index) => {
        const exampleElement = document.createElement('div');
        exampleElement.className = 'example-item';
        if (index === 0) exampleElement.classList.add('active');
        exampleElement.textContent = example.name;
        exampleElement.addEventListener('click', () => {
            // Set this example as active
            document.querySelectorAll('.example-item').forEach(item => {
                item.classList.remove('active');
            });
            exampleElement.classList.add('active');
            displayExampleCode(example);
        });
        
        exampleList.appendChild(exampleElement);
    });
    
    content.appendChild(exampleList);
    
    // Display first example
    if (category.examples.length > 0) {
        displayExampleCode(category.examples[0]);
    }
}

function displayExampleCode(example) {
    const content = document.querySelector('.example-content');
    
    // Remove existing code display
    const existingDisplay = content.querySelector('.example-code-display');
    if (existingDisplay) {
        existingDisplay.remove();
    }
    
    const codeDisplay = document.createElement('div');
    codeDisplay.className = 'example-code-display';
    
    // Description
    const description = document.createElement('div');
    description.className = 'example-description';
    description.innerHTML = `
        <h4>${example.name}</h4>
        <p>${example.description}</p>
    `;
    codeDisplay.appendChild(description);
    
    // Code
    const codeElement = document.createElement('pre');
    codeElement.className = 'example-code';
    codeElement.textContent = example.code;
    codeDisplay.appendChild(codeElement);
    
    // Buttons
    const buttons = document.createElement('div');
    buttons.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap;';
    
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn';
    copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy Code';
    copyButton.addEventListener('click', () => copyToClipboard(example.code));
    
    const loadButton = document.createElement('button');
    loadButton.className = 'btn btn-primary';
    loadButton.innerHTML = '<i class="fas fa-rocket"></i> Load in Editor';
    loadButton.addEventListener('click', () => {
        sourceCodeTextarea.value = example.code;
        closeExamplesModal();
    });
    
    buttons.appendChild(copyButton);
    buttons.appendChild(loadButton);
    codeDisplay.appendChild(buttons);
    
    content.appendChild(codeDisplay);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Code copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}