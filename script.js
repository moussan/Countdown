// script.js
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Game Selection
  const gameSelectionDiv = document.getElementById('game-selection');
  const numbersGameBtn = document.getElementById('numbers-game-btn');
  const lettersGameBtn = document.getElementById('letters-game-btn');
  
  // DOM Elements - Numbers Game
  const numbersGameDiv = document.getElementById('numbers-game');
  const solveNumbersBtn = document.getElementById('solve-numbers-btn');
  const randomTargetBtn = document.getElementById('random-target-btn');
  const numberInputs = document.querySelectorAll('.number-input');
  const targetInput = document.getElementById('target');
  const numbersResultsDiv = document.getElementById('numbers-results');
  const numberDisplayDiv = document.getElementById('number-display');
  const targetDisplayDiv = document.getElementById('target-display');
  
  // DOM Elements - Letters Game
  const lettersGameDiv = document.getElementById('letters-game');
  const vowelBtn = document.getElementById('vowel-btn');
  const consonantBtn = document.getElementById('consonant-btn');
  const letterCountSpan = document.getElementById('letter-count');
  const lettersDisplayDiv = document.getElementById('letters-display');
  const wordInput = document.getElementById('word-input');
  const solveLettersBtn = document.getElementById('solve-letters-btn');
  const lettersResultsDiv = document.getElementById('letters-results');
  
  // Back buttons
  const backButtons = document.querySelectorAll('.back-btn');
  
  // Game state
  let currentLetters = [];
  const MAX_LETTERS = 9;
  
  // Letter pools based on Countdown rules
  const VOWELS = ['A', 'E', 'I', 'O', 'U'];
  const VOWEL_DISTRIBUTION = [
    'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A',
    'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E',
    'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I',
    'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O',
    'U', 'U', 'U', 'U', 'U'
  ];
  
  const CONSONANT_DISTRIBUTION = [
    'B', 'B',
    'C', 'C', 'C',
    'D', 'D', 'D', 'D', 'D', 'D',
    'F', 'F', 'F',
    'G', 'G', 'G',
    'H', 'H',
    'J',
    'K',
    'L', 'L', 'L', 'L', 'L',
    'M', 'M', 'M', 'M',
    'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N',
    'P', 'P', 'P', 'P',
    'Q',
    'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R',
    'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S',
    'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ];
  
  // English dictionary for the letters game
  // This is a simplified version - in a real app, you'd use a more complete dictionary
  const DICTIONARY_URL = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
  let dictionary = [];
  
  // Initialize the app
  initApp();
  
  function initApp() {
    // Set up event listeners for game selection
    numbersGameBtn.addEventListener('click', () => showGame('numbers'));
    lettersGameBtn.addEventListener('click', () => showGame('letters'));
    
    // Set up back buttons
    backButtons.forEach(btn => {
      btn.addEventListener('click', showGameSelection);
    });
    
    // Set up Numbers Game
    initNumbersGame();
    
    // Set up Letters Game
    initLettersGame();
    
    // Load dictionary for letters game
    loadDictionary();
  }
  
  function showGame(gameType) {
    gameSelectionDiv.classList.add('hidden');
    
    if (gameType === 'numbers') {
      numbersGameDiv.classList.remove('hidden');
      // Focus on first number input
      numberInputs[0].focus();
    } else if (gameType === 'letters') {
      lettersGameDiv.classList.remove('hidden');
      // Reset letters game
      resetLettersGame();
    }
  }
  
  function showGameSelection() {
    // Hide all game containers
    numbersGameDiv.classList.add('hidden');
    lettersGameDiv.classList.add('hidden');
    
    // Show game selection
    gameSelectionDiv.classList.remove('hidden');
  }
  
  // ===== NUMBERS GAME FUNCTIONS =====
  
  function initNumbersGame() {
    // Set focus to the first number input on page load
    numberInputs[0].focus();
  
    // Add tab navigation and validation for number inputs
    numberInputs.forEach((input, index) => {
      input.addEventListener('keydown', (e) => {
        // Allow tab navigation
        if (e.key === 'Tab') {
          return;
        }
        
        // Enter key moves to next input or solves if on last input
        if (e.key === 'Enter') {
          e.preventDefault();
          if (index < numberInputs.length - 1) {
            numberInputs[index + 1].focus();
          } else {
            targetInput.focus();
          }
        }
      });
  
      // Validate input to ensure it's a positive integer
      input.addEventListener('input', () => {
        const value = input.value.trim();
        if (value && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
          input.value = '';
        }
      });
    });
  
    // Target input event listener
    targetInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        solveCountdownProblem();
      }
    });
  
    // Random target button click handler
    randomTargetBtn.addEventListener('click', () => {
      // Generate random number between 100 and 999
      const randomTarget = Math.floor(Math.random() * 900) + 100;
      targetInput.value = randomTarget;
      
      // Highlight the target input briefly to show it changed
      targetInput.classList.add('highlight');
      setTimeout(() => {
        targetInput.classList.remove('highlight');
      }, 500);
    });
  
    // Main solve button click handler
    solveNumbersBtn.addEventListener('click', solveCountdownProblem);
  }
  
  function solveCountdownProblem() {
    // Get values from the six number inputs
    const numbers = Array.from(numberInputs)
      .map(input => parseInt(input.value.trim(), 10))
      .filter(num => !isNaN(num));
    
    const target = parseInt(targetInput.value, 10);
    
    // Clear previous results
    numbersResultsDiv.innerHTML = '';
    numberDisplayDiv.innerHTML = '';
    targetDisplayDiv.innerHTML = '';
  
    // Validate inputs
    if (numbers.length !== 6 || numbers.some(isNaN)) {
      numbersResultsDiv.innerHTML = '<p>Please enter all six numbers.</p>';
      return;
    }
  
    if (isNaN(target)) {
      numbersResultsDiv.innerHTML = '<p>Please enter a valid target number.</p>';
      return;
    }
  
    // Display the numbers in tiles
    displayNumbers(numbers, target);
  
    // Solve the problem
    const startTime = performance.now();
    const solutions = solveCountdown(numbers, target);
    const endTime = performance.now();
    const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
  
    // Display results
    displayNumbersResults(solutions, timeTaken);
  }
  
  function displayNumbers(numbers, target) {
    // Display the 6 input numbers
    numbers.forEach(num => {
      const tile = document.createElement('div');
      tile.className = 'number-tile';
      tile.textContent = num;
      numberDisplayDiv.appendChild(tile);
    });
  
    // Display the target number
    targetDisplayDiv.innerHTML = `
      <div class="target-number">${target}</div>
    `;
  }
  
  function displayNumbersResults(solutions, timeTaken) {
    if (solutions.length > 0) {
      // Sort solutions by complexity (length of expression)
      solutions.sort((a, b) => a.length - b.length);
      
      // Take only the first 10 solutions to avoid overwhelming the user
      const displaySolutions = solutions.slice(0, 10);
      
      numbersResultsDiv.innerHTML = `
        <h2>Solutions Found (${solutions.length} total):</h2>
        <p>Computed in ${timeTaken} seconds</p>
        <div class="solutions-list">
          ${displaySolutions.map(sol => `<div class="solution">${formatSolution(sol)}</div>`).join('')}
        </div>
        ${solutions.length > 10 ? `<p>Showing 10 of ${solutions.length} solutions...</p>` : ''}
      `;
    } else {
      numbersResultsDiv.innerHTML = `
        <h2>No Solutions Found</h2>
        <p>Computed in ${timeTaken} seconds</p>
        <p>Try different numbers or a different target.</p>
      `;
    }
  }
  
  function formatSolution(expression) {
    // Replace operators with more readable versions
    return expression
      .replace(/\*/g, ' × ')
      .replace(/\//g, ' ÷ ')
      .replace(/\+/g, ' + ')
      .replace(/\-/g, ' - ');
  }
  
  // Function to solve the Countdown problem
  function solveCountdown(nums, target) {
    const operators = ['+', '-', '*', '/'];
    const results = [];
    const seen = new Set(); // To avoid duplicate solutions
  
    function isValidOperation(a, b, op) {
      if (op === '+' || op === '*') return true;
      if (op === '-' && a >= b) return true;
      if (op === '/' && b !== 0 && a % b === 0) return true;
      return false;
    }
  
    function evaluate(expr) {
      try {
        const result = eval(expr);
        return Number.isInteger(result) && result > 0 ? result : null;
      } catch (err) {
        return null;
      }
    }
  
    function generateExpressions(numbers, expressions = []) {
      if (numbers.length === 0) {
        // Base case: all numbers have been used
        if (expressions.length === 1) {
          const expr = expressions[0];
          const value = evaluate(expr);
          
          if (value === target && !seen.has(expr)) {
            results.push(expr);
            seen.add(expr);
          }
        }
        return;
      }
  
      // Try using the current number with each existing expression
      for (let i = 0; i < numbers.length; i++) {
        const num = numbers[i];
        const remainingNumbers = [...numbers.slice(0, i), ...numbers.slice(i + 1)];
        
        if (expressions.length === 0) {
          // First number, no operations yet
          generateExpressions(remainingNumbers, [num.toString()]);
        } else {
          // Try combining with existing expressions
          for (let j = 0; j < expressions.length; j++) {
            const expr = expressions[j];
            const otherExprs = [...expressions.slice(0, j), ...expressions.slice(j + 1)];
            
            for (const op of operators) {
              // Check if operation is valid
              if (isValidOperation(evaluate(expr), num, op)) {
                const newExpr = `(${expr} ${op} ${num})`;
                generateExpressions(remainingNumbers, [...otherExprs, newExpr]);
              }
              
              // Try the reverse order for non-commutative operations
              if ((op === '-' || op === '/') && isValidOperation(num, evaluate(expr), op)) {
                const newExpr = `(${num} ${op} ${expr})`;
                generateExpressions(remainingNumbers, [...otherExprs, newExpr]);
              }
            }
          }
        }
      }
    }
  
    generateExpressions(nums);
    return results;
  }
  
  // ===== LETTERS GAME FUNCTIONS =====
  
  function initLettersGame() {
    // Add event listeners for letter selection buttons
    vowelBtn.addEventListener('click', () => addLetter('vowel'));
    consonantBtn.addEventListener('click', () => addLetter('consonant'));
    
    // Add event listener for solve button
    solveLettersBtn.addEventListener('click', solveLettersGame);
    
    // Add event listener for word input
    wordInput.addEventListener('input', () => {
      // Convert to uppercase
      wordInput.value = wordInput.value.toUpperCase();
      
      // Validate that only letters in the current selection are used
      validateWordInput();
    });
  }
  
  function resetLettersGame() {
    // Clear current letters
    currentLetters = [];
    updateLetterCount();
    
    // Clear display
    lettersDisplayDiv.innerHTML = '';
    lettersResultsDiv.innerHTML = '';
    wordInput.value = '';
    
    // Enable letter buttons
    vowelBtn.disabled = false;
    consonantBtn.disabled = false;
  }
  
  function addLetter(type) {
    if (currentLetters.length >= MAX_LETTERS) {
      return;
    }
    
    let letter;
    if (type === 'vowel') {
      // Get random vowel based on distribution
      letter = VOWEL_DISTRIBUTION[Math.floor(Math.random() * VOWEL_DISTRIBUTION.length)];
    } else {
      // Get random consonant based on distribution
      letter = CONSONANT_DISTRIBUTION[Math.floor(Math.random() * CONSONANT_DISTRIBUTION.length)];
    }
    
    // Add letter to current selection
    currentLetters.push(letter);
    
    // Create and add letter tile
    const letterTile = document.createElement('div');
    letterTile.className = 'letter-tile';
    letterTile.textContent = letter;
    lettersDisplayDiv.appendChild(letterTile);
    
    // Update letter count
    updateLetterCount();
    
    // Check if we've reached the maximum
    if (currentLetters.length >= MAX_LETTERS) {
      vowelBtn.disabled = true;
      consonantBtn.disabled = true;
    }
  }
  
  function updateLetterCount() {
    letterCountSpan.textContent = currentLetters.length;
  }
  
  function validateWordInput() {
    if (!currentLetters.length) return;
    
    const word = wordInput.value.toUpperCase();
    const letterCounts = {};
    
    // Count letters in the current selection
    currentLetters.forEach(letter => {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });
    
    // Check if the word uses only available letters
    let isValid = true;
    const wordLetterCounts = {};
    
    for (const letter of word) {
      if (!/[A-Z]/.test(letter)) continue;
      
      wordLetterCounts[letter] = (wordLetterCounts[letter] || 0) + 1;
      
      if (!letterCounts[letter] || wordLetterCounts[letter] > letterCounts[letter]) {
        isValid = false;
        break;
      }
    }
    
    // Visual feedback
    if (isValid) {
      wordInput.classList.remove('invalid');
    } else {
      wordInput.classList.add('invalid');
    }
  }
  
  function solveLettersGame() {
    // Clear previous results
    lettersResultsDiv.innerHTML = '';
    
    // Check if we have letters
    if (currentLetters.length === 0) {
      lettersResultsDiv.innerHTML = '<p>Please select some letters first.</p>';
      return;
    }
    
    // If we don't have 9 letters yet, ask for confirmation
    if (currentLetters.length < MAX_LETTERS) {
      if (!confirm(`You've only selected ${currentLetters.length} letters. Do you want to continue?`)) {
        return;
      }
    }
    
    // Check user's word
    const userWord = wordInput.value.toUpperCase();
    let userWordValid = false;
    
    if (userWord) {
      userWordValid = isValidWord(userWord);
    }
    
    // Find all valid words
    const startTime = performance.now();
    const validWords = findValidWords(currentLetters);
    const endTime = performance.now();
    const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
    
    // Display results
    displayLettersResults(validWords, userWord, userWordValid, timeTaken);
  }
  
  function isValidWord(word) {
    // Check if the word is in the dictionary
    if (dictionary.includes(word.toLowerCase())) {
      // Check if the word can be formed with the available letters
      const letterCounts = {};
      
      // Count letters in the current selection
      currentLetters.forEach(letter => {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      });
      
      // Check if the word uses only available letters
      const wordLetterCounts = {};
      
      for (const letter of word) {
        if (!/[A-Z]/.test(letter)) continue;
        
        wordLetterCounts[letter] = (wordLetterCounts[letter] || 0) + 1;
        
        if (!letterCounts[letter] || wordLetterCounts[letter] > letterCounts[letter]) {
          return false;
        }
      }
      
      return true;
    }
    
    return false;
  }
  
  function findValidWords(letters) {
    // This is a simplified version - in a real app, you'd use a more efficient algorithm
    const validWords = [];
    
    // Create a letter frequency map
    const letterCounts = {};
    letters.forEach(letter => {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });
    
    // Check each word in the dictionary
    for (const word of dictionary) {
      if (word.length < 3 || word.length > letters.length) continue;
      
      // Create a copy of the letter counts
      const remainingLetters = { ...letterCounts };
      let isValid = true;
      
      // Check if the word can be formed with the available letters
      for (const letter of word.toUpperCase()) {
        if (!remainingLetters[letter] || remainingLetters[letter] === 0) {
          isValid = false;
          break;
        }
        
        remainingLetters[letter]--;
      }
      
      if (isValid) {
        validWords.push(word.toUpperCase());
      }
    }
    
    return validWords;
  }
  
  function displayLettersResults(validWords, userWord, userWordValid, timeTaken) {
    // Sort words by length (longest first)
    validWords.sort((a, b) => b.length - a.length);
    
    // Group words by length
    const wordsByLength = {};
    validWords.forEach(word => {
      const length = word.length;
      if (!wordsByLength[length]) {
        wordsByLength[length] = [];
      }
      wordsByLength[length].push(word);
    });
    
    // Build results HTML
    let resultsHTML = `
      <h2>Words Found (${validWords.length} total):</h2>
      <p>Computed in ${timeTaken} seconds</p>
    `;
    
    // Add user's word result if provided
    if (userWord) {
      if (userWordValid) {
        resultsHTML += `
          <div class="user-word">
            <h3>Your Word:</h3>
            <div class="word-result" style="background-color: #2e7d32;">
              ${userWord}
              <span class="word-length">${userWord.length}</span>
            </div>
          </div>
        `;
      } else {
        resultsHTML += `
          <div class="user-word">
            <h3>Your Word:</h3>
            <div class="word-result" style="background-color: #c62828;">
              ${userWord} (Not valid)
              <span class="word-length">${userWord.length}</span>
            </div>
          </div>
        `;
      }
    }
    
    // Add best possible words
    resultsHTML += `<h3>Best Possible Words:</h3>`;
    
    // Display words by length (from longest to shortest)
    const lengths = Object.keys(wordsByLength).sort((a, b) => b - a);
    
    for (const length of lengths) {
      if (length < 3) continue; // Skip very short words
      
      const words = wordsByLength[length];
      
      // Limit the number of words shown for each length
      const displayWords = words.slice(0, 5);
      const hasMore = words.length > 5;
      
      resultsHTML += `
        <div class="word-group">
          <h4>${length}-Letter Words:</h4>
          <div class="words-list">
            ${displayWords.map(word => `
              <div class="word-result">
                ${word}
                <span class="word-length">${word.length}</span>
              </div>
            `).join('')}
          </div>
          ${hasMore ? `<p>...and ${words.length - 5} more ${length}-letter words</p>` : ''}
        </div>
      `;
      
      // Only show the top 3 lengths to avoid overwhelming the user
      if (lengths.indexOf(length) >= 3) {
        resultsHTML += `<p>...and words with ${length - 1} or fewer letters</p>`;
        break;
      }
    }
    
    lettersResultsDiv.innerHTML = resultsHTML;
  }
  
  // Load the dictionary for the letters game
  function loadDictionary() {
    fetch(DICTIONARY_URL)
      .then(response => response.text())
      .then(text => {
        dictionary = text.split('\n').filter(word => word.length >= 3 && word.length <= 9);
        console.log(`Dictionary loaded with ${dictionary.length} words`);
      })
      .catch(error => {
        console.error('Error loading dictionary:', error);
        // Fallback to a small dictionary if loading fails
        dictionary = ['CAT', 'DOG', 'HOUSE', 'COMPUTER', 'GAME', 'PLAY', 'WORD', 'LETTER', 'NUMBER', 'COUNTDOWN'];
      });
  }
});
