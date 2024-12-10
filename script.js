// script.js
document.getElementById('solve-btn').addEventListener('click', () => {
  const numbersInput = document.getElementById('numbers').value;
  const target = parseInt(document.getElementById('target').value, 10);
  const resultsDiv = document.getElementById('results');

  if (!numbersInput || isNaN(target)) {
    resultsDiv.innerHTML = '<p>Please enter valid numbers and target.</p>';
    return;
  }

  const numbers = numbersInput.split(',').map(num => parseInt(num.trim(), 10));
  if (numbers.length !== 6 || numbers.some(isNaN)) {
    resultsDiv.innerHTML = '<p>Enter exactly 6 valid numbers.</p>';
    return;
  }

  // Function to solve the Countdown problem
  const solveCountdown = (nums, target) => {
    const operators = ['+', '-', '*', '/'];
    const results = [];

    const helper = (expression, remaining) => {
      if (remaining.length === 0) {
        try {
          if (eval(expression) === target) {
            results.push(expression);
          }
        } catch (err) {
          // Ignore invalid expressions
        }
        return;
      }

      for (let i = 0; i < remaining.length; i++) {
        const newRemaining = [...remaining];
        newRemaining.splice(i, 1);

        for (const op of operators) {
          helper(`${expression} ${op} ${remaining[i]}`, newRemaining);
        }
      }
    };

    for (let i = 0; i < nums.length; i++) {
      const remaining = [...nums];
      remaining.splice(i, 1);
      helper(`${nums[i]}`, remaining);
    }

    return results;
  };

  const solutions = solveCountdown(numbers, target);

  if (solutions.length > 0) {
    resultsDiv.innerHTML = `<h2>Solutions:</h2><ul>${solutions
      .map(sol => `<li>${sol}</li>`)
      .join('')}</ul>`;
  } else {
    resultsDiv.innerHTML = '<p>No solutions found.</p>';
  }
});
