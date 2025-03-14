// script.js
document.addEventListener('DOMContentLoaded', () => {
  const solveBtn = document.getElementById('solve-btn');
  const numbersInput = document.getElementById('numbers');
  const targetInput = document.getElementById('target');
  const resultsDiv = document.getElementById('results');
  const numberDisplayDiv = document.getElementById('number-display');
  const targetDisplayDiv = document.getElementById('target-display');

  // Set focus to the numbers input on page load
  numbersInput.focus();

  // Add event listeners for Enter key
  numbersInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      targetInput.focus();
    }
  });

  targetInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      solveCountdownProblem();
    }
  });

  // Main solve button click handler
  solveBtn.addEventListener('click', solveCountdownProblem);

  function solveCountdownProblem() {
    const numbersValue = numbersInput.value;
    const target = parseInt(targetInput.value, 10);
    
    // Clear previous results
    resultsDiv.innerHTML = '';
    numberDisplayDiv.innerHTML = '';
    targetDisplayDiv.innerHTML = '';

    if (!numbersValue || isNaN(target)) {
      resultsDiv.innerHTML = '<p>Please enter valid numbers and target.</p>';
      return;
    }

    // Parse and validate numbers
    const numbers = numbersValue.split(',')
      .map(num => parseInt(num.trim(), 10))
      .filter(num => !isNaN(num));
    
    if (numbers.length !== 6) {
      resultsDiv.innerHTML = '<p>Please enter exactly 6 valid numbers.</p>';
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
    displayResults(solutions, timeTaken);
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

  function displayResults(solutions, timeTaken) {
    if (solutions.length > 0) {
      // Sort solutions by complexity (length of expression)
      solutions.sort((a, b) => a.length - b.length);
      
      // Take only the first 10 solutions to avoid overwhelming the user
      const displaySolutions = solutions.slice(0, 10);
      
      resultsDiv.innerHTML = `
        <h2>Solutions Found (${solutions.length} total):</h2>
        <p>Computed in ${timeTaken} seconds</p>
        <div class="solutions-list">
          ${displaySolutions.map(sol => `<div class="solution">${formatSolution(sol)}</div>`).join('')}
        </div>
        ${solutions.length > 10 ? `<p>Showing 10 of ${solutions.length} solutions...</p>` : ''}
      `;
    } else {
      resultsDiv.innerHTML = `
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

  // Add example numbers if input is empty
  if (numbersInput.value === '') {
    const exampleSets = [
      '25, 50, 75, 100, 3, 6',
      '10, 25, 50, 75, 3, 7',
      '100, 25, 10, 2, 9, 4'
    ];
    numbersInput.placeholder = exampleSets[Math.floor(Math.random() * exampleSets.length)];
  }
});
