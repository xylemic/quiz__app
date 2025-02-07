// quiz module
const quizModule = (() => {
  // questions data
  const questions = [
    {
      question: 'What does DOM stand for?',
      options: [
        'Document Object Model',
        'Document Oriented Model',
        'Data Object Model',
        'Digital Object Model'
      ],
      correct: 0
    },
    {
      question: 'Which array method creates a new array with the results of calling a function for every array element?',
      options: [
        'forEach()',
        'filter()',
        'map()',
        'reduce()'
      ],
      correct: 2
    },
    {
      question: 'What is the purpose of async/await in JavaScript',
      options: [
        'To make the code more readable',
        'To make the code more efficient',
        'To handle asynchronous operations',
        'To make the code more concise'
      ],
      correct: 2
    },
    {
      question: 'Which JavaScript feature allows you to create reusable functions?',
      options: [
        'Functions',
        'Modules',
        'Classes',
        'Objects'
      ],
      correct: 0
    },
    {
      question: 'Which CSS property controls the background color of an element?',
      options: [
        'background',
        'color',
        'border-color',
        'background-color'
      ],
      correct: 3
    },
    {
      question: 'What is the difference between let and var in JavaScript?',
      options: [
        'let is block-scoped, var is function-scoped',
        'let cannot be redeclared, var can be redeclared',
        'let is hoisted, var is not hoisted',
        'let is newer, but they are functionally the same'
      ],
      correct: 0
    },
    {
      question: 'Which method is used to add an element at the end of an array?',
      options: [
        'push()',
        'append()',
        'add()',
        'insert()'
      ],
      correct: 0
    },
    {
      question: 'What is the purpose of the preventDefault() method?',
      options: [
        'To stop event bubbling',
        'To prevent the default browser behavior',
        'To prevent JavaScript errors',
        'To prevent event capturing'
      ],
      correct: 1
    },
    {
      question: 'What is closure in JavaScript?',
      options: [
        'A way to close browser windows',
        'A function that has access to variables in its outer scope',
        'A method to close database connections',
        'A way to end JavaScript execution'
      ],
      correct: 1
    },
    {
      question: 'What is the purpose of the this keyword in JavaScript?',
      options: [
        'To reference the current function',
        'To reference the current file',
        'To reference the current object',
        'To reference the parent element'
      ],
      correct: 2
    },
    {
      question: 'What is the purpose of JSON.stringify()?',
      options: [
        'To validate JSON data',
        'To parse JSON data',
        'To convert JavaScript objects to JSON strings',
        'To format JSON data'
      ],
      correct: 2
    },
    {
      question: 'Which operator is used for strict equality comparison?',
      options: [
        '==',
        '===',
        '=',
        '!='
      ],
      correct: 1
    }
  ];

  let currentQuestion = 0;
  let score = 0;
  let selectedOption = null;
  let startTime;
  let timerInterval;

  // DOM elements
  const quizElement = document.getElementById('quiz');
  const resultElement = document.querySelector('.result');
  const progressText = document.querySelector('.progress__text');
  const progressBar = document.querySelector('.progress__bar');
  const questionElement = document.querySelector('.question');
  const optionsElement = document.querySelector('.options');
  const nextButton = document.querySelector('.next__btn');
  const scoreElement = document.querySelector('.score');
  const timeElement = document.querySelector('.timer');
  const timeTakenElement = document.querySelector('.time__taken');
  const themeToggle = document.querySelector('.theme__toggle');
  const scoreList = document.querySelector('.score__list');

  // initialize quiz
  const init = () => {
    startTime = Date.now();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
    showQuestion();
    nextButton.addEventListener('click', handleNext);
    setupThemeToggle();
  };

  // update timer
  const updateTimer = () => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timeElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // display current question
  const showQuestion = () => {
    const question = questions[currentQuestion];
    progressText.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    progressBar.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
    questionElement.textContent = question.question;

    optionsElement.innerHTML = '';

    question.options.forEach((option, index) => {
      const optionElement = document.createElement('div');
      optionElement.className = 'option';
      optionElement.textContent = option;
      optionElement.addEventListener('click', () => selectOption(index));
      optionsElement.appendChild(optionElement);
    });

    nextButton.disabled = true;
    selectedOption = null;
  };

  // handle option selection
  const selectOption = (index) => {
    if (selectedOption !== null) return;
    selectedOption = index;

    const options = optionsElement.querySelectorAll('.option');
    const correctAnswer = questions[currentQuestion].correct;

    options.forEach((option, i) => {
      if (i === correctAnswer) {
        option.classList.add('correct');
      } else if (i === index && index !== correctAnswer) {
        option.classList.add('incorrect');
      }
    });

    nextButton.disabled = false;
  };

  // handle next button click
  const handleNext = async () => {
    if (selectedOption === questions[currentQuestion].correct) {
      score++;
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    currentQuestion++;

    if (currentQuestion < questions.length) {
      showQuestion();
    } else {
      showResult();
    }
  };

  // show final result
  const showResult = () => {
    clearInterval(timerInterval);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    quizElement.style.display = 'none';
    resultElement.style.display = 'block';
    scoreElement.textContent = `${score} out of ${questions.length}`;
    timeTakenElement.textContent = `Time taken: ${minutes}m ${seconds}s`;

    const currentScore = {
      score: score,
      time: timeTaken
    };
    updateHighScores(currentScore);
    displayHighScores();
  };

  // update high scores
  const updateHighScores = (currentScore) => {
    try {
      const highScores = JSON.parse(localStorage.getItem('quizHighScores') || '[]');
      highScores.push(currentScore);
      highScores.sort((a, b) => b.score - a.score || a.time - b.time);
      highScores.splice(5); // Keep only top 5 scores
      localStorage.setItem('quizHighScores', JSON.stringify(highScores));
    } catch (error) {
      console.error('Error updating high scores:', error);
    }
  };

  // display high scores
  const displayHighScores = () => {
    try {
      const highScores = JSON.parse(localStorage.getItem('quizHighScores') || '[]');
      scoreList.innerHTML = highScores
        .map((entry, index) => `
          <li class="score__item">
            <span>#${index + 1} Score: ${entry.score}/${questions.length}</span>
            <span>Time: ${Math.floor(entry.time / 60)}m ${entry.time % 60}s</span>
          </li>
        `)
        .join('');
    } catch (error) {
      console.error('Error displaying high scores:', error);
      scoreList.innerHTML = '<li class="score__item">Error loading high scores</li>';
    }
  };

  // theme toggle functionality
  const setupThemeToggle = () => {
    const theme = localStorage.getItem('quizTheme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.innerHTML = theme === 'light'
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('quizTheme', newTheme);
      themeToggle.innerHTML = newTheme === 'light'
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
    });
  };

  return {
    init
  };
})();

// start the quiz
document.addEventListener('DOMContentLoaded', quizModule.init);


