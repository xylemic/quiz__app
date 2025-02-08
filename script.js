const quizModule = (() => {
  const togglePause = () => {
    isPaused = !isPaused;
    if (!isPaused) {
      startTime = Date.now() - (timeElapsed * 1000);
    }
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
  };


  let questions = [];
  let currentQuestion = 0;
  let score = 0;
  let selectedOption = null;
  let startTime;
  let timerInterval;
  let isPaused = false;
  let timeElapsed = 0;

  // Optional audio - with error handling
  let correctSound, wrongSound;
  try {
    correctSound = new Audio('correct.mp3');
    wrongSound = new Audio('wrong.mp3');
  } catch (error) {
    console.warn('Audio files not loaded, continuing without sound');
    correctSound = { play: () => { } };
    wrongSound = { play: () => { } };
  }

  // DOM elements - Updated selectors to match HTML
  const quizContainer = document.querySelector('.quiz__container');
  const quizElement = document.getElementById('quiz');
  const resultElement = document.querySelector('.result');
  const progressText = document.querySelector('.progress__text');
  const progressBar = document.querySelector('.progress__bar');
  const questionElement = document.querySelector('.question');
  const optionsElement = document.querySelector('.options');
  const nextButton = document.querySelector('.next__btn');
  const startButton = document.querySelector('.start__btn');
  const pauseButton = document.querySelector('.pause__btn');
  const scoreElement = document.querySelector('.score');
  const timeElement = document.querySelector('.timer');
  const timeTakenElement = document.querySelector('.time__taken');
  const themeToggle = document.querySelector('.theme__toggle');
  const scoreList = document.querySelector('.score__list');
  const startScreen = document.querySelector('.start__screen');

  // event listeners
  const setupEventListeners = () => {
    startButton?.addEventListener('click', init);
    pauseButton?.addEventListener('click', togglePause);
  };

  // initialize quiz
  async function init() {
    try {
      startButton.style.display = 'none';
      quizContainer.style.display = 'block';
      await loadQuestions();
      if (questions.length === 0) {
        throw new Error('No questions loaded');
      }
      shuffleArray(questions);
      startTime = Date.now() - (timeElapsed * 1000);
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
      showQuestion();
      nextButton.addEventListener('click', handleNext);
      startScreen.style.display = 'none';
    } catch (error) {
      console.error('Error initializing quiz:', error);
      alert('Failed to initialize quiz. Please try again.');
    }
  }

  // update timer
  const updateTimer = () => {
    if (isPaused) return;
    const currentTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    timeElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    timeElapsed = currentTime;
  };

  // load questions from JSON
  async function loadQuestions() {
    try {
      const response = await fetch('questionsData.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      questions = await response.json();
    } catch (error) {
      console.error('Error loading questions:', error);
      throw error;
    }
  }

  // display current question
  const showQuestion = () => {
    const question = questions[currentQuestion];
    if (!question) return;

    const optionsCopy = [...question.options];
    shuffleArray(optionsCopy);

    progressText.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    progressBar.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
    progressBar.setAttribute('aria-valuenow', ((currentQuestion + 1) / questions.length) * 100);
    questionElement.textContent = question.question;

    optionsElement.innerHTML = '';
    optionsCopy.forEach((option, index) => {
      const optionElement = document.createElement('div');
      optionElement.className = 'option';
      optionElement.setAttribute('role', 'button');
      optionElement.setAttribute('tabindex', '0');
      optionElement.textContent = option;
      optionElement.addEventListener('click', () => selectOption(index, optionsCopy));
      optionElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          selectOption(index, optionsCopy);
        }
      });
      optionsElement.appendChild(optionElement);
    });

    nextButton.disabled = true;
    selectedOption = null;
  };

  // handle option selection
  const selectOption = (index, shuffledOptions) => {
    if (selectedOption !== null) return;
    selectedOption = index;

    const options = optionsElement.querySelectorAll('.option');
    const currentQ = questions[currentQuestion];
    const correctAnswerIndex = shuffledOptions.indexOf(currentQ.options[currentQ.correct]);

    options.forEach((option, i) => {
      if (i === correctAnswerIndex) {
        option.classList.add('correct');
        if (i === index) correctSound.play();
      } else if (i === index) {
        option.classList.add('incorrect');
        wrongSound.play();
      }
    });

    nextButton.disabled = false;
  };

  // handle next button click
  const handleNext = async () => {
    const currentQ = questions[currentQuestion];
    const options = optionsElement.querySelectorAll('.option');
    const selectedOptionText = options[selectedOption]?.textContent;

    if (selectedOptionText === currentQ.options[currentQ.correct]) {
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
    const timeTaken = timeElapsed;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    quizElement.style.display = 'none';
    resultElement.style.display = 'block';
    scoreElement.textContent = `Your score: ${score} out of ${questions.length}`;
    timeTakenElement.textContent = `Time taken: ${minutes}m ${seconds}s`;

    const currentScore = {
      score,
      time: timeTaken,
      date: new Date().toISOString()
    };
    updateHighScores(currentScore);
    displayHighScores();
  };

  // shuffle array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  // update high scores
  const updateHighScores = (currentScore) => {
    try {
      const highScores = JSON.parse(localStorage.getItem('quizHighScores') || '[]');
      highScores.push(currentScore);
      highScores.sort((a, b) => b.score - a.score || a.time - b.time);
      highScores.splice(5);
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
          <li class="score__item" tabindex="0">
            <span>#${index + 1} Score: ${entry.score}/${questions.length}</span>
            <span>Time: ${Math.floor(entry.time / 60)}m ${entry.time % 60}s</span>
            <span>Date: ${new Date(entry.date).toLocaleDateString()}</span>
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

  // initialize event listeners
  setupEventListeners();

  // invoking theme toggle functionality
  setupThemeToggle();

  // public interface
  return {
    init
  };
})();


