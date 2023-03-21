import readlineModule from 'readline';
import cliCursor from 'cli-cursor';
import addTodo from './addTodo.js';
import editTodo from './editTodo.js';
import deleteTodo from './deleteTodo.js';
import mainScreen from './mainScreen.js';
import { Todos } from './types.js';
//@ts-ignore
import cfonts from 'cfonts';
import chalk from 'chalk';
//@ts-ignore
import notifier from 'node-notifier';

cliCursor.hide();

const log = console.log;
const clear = console.clear;

readlineModule.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
const todosMenu: string[] = ['EDIT_TODO', 'DELETE_TODO', 'MAIN_SCREEN'];

let currState = 'MAIN_SCREEN';
let currMenuSelection = 0;
let todos: Todos[] = [];
let selectedTodo: null | number = null;
let isUserInputMode = false;
let isTimerStarted = false;
let isTimerStop = false;
let focusTimerCount = 5;//1500;
let breakTimerCount = 300;
let timerCount = 0;
const withMenuBindings = ['MAIN_MENU', 'EDIT_TODO', 'DELETE_TODO', 'MAIN_SCREEN'];

mainScreen(todos, currMenuSelection);

const timerDisplay = (time: number) => {
  const h = Math.floor(time / 3600).toString().padStart(2,'0'),
      m = Math.floor(time % 3600 / 60).toString().padStart(2,'0'),
      s = Math.floor(time % 60).toString().padStart(2,'0');
    
  const timeStr = h + ':' + m + ':' + s;

  cfonts.say(timeStr.toString(), {
    font: 'block',              // define the font face
    align: 'center',              // define text alignment
    colors: ['system'],         // define all colors
    background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
    letterSpacing: 1,           // define letter spacing
    lineHeight: 1,              // define the line height
    space: true,                // define if the output text should have empty lines on top and on the bottom
    maxLength: '0',             // define how many character can be on one line
    gradient: false,            // define your two gradient colors
    independentGradient: false, // define if you want to recalculate the gradient for each new line
    transitionGradient: false,  // define if this is a transition between colors directly
    env: 'node'                 // define the environment cfonts is being executed in
  });
};

const todoDisplay = (todo: string) => {
  const cols = process.stdout.columns;
  const spacerSize: number = (cols / 2) - todo.length;
  let spacer = '';
  for(let i=0; i<spacerSize; i++) {
    spacer += ' ';
  }
  log(spacer+chalk.green(todo));
};

const stopTimer =() => {
  isTimerStarted = false;
  isTimerStop = false;
  currState = 'MAIN_SCREEN';
  currMenuSelection = 0;
  timerCount = 0;
  clear();
  mainScreen(todos, currMenuSelection);
};

const timer = () => {
  if(!isTimerStop && isTimerStarted && timerCount >= 0) {
    setTimeout(() => {
      const timerTitle = currState === 'START_FOCUS' ? todos[currMenuSelection].label : 'BREAK';
      clear();
      timerDisplay(timerCount);
      todoDisplay(timerTitle);
      timerCount -= 1;
      if(timerCount <= 0 && isTimerStarted && !isTimerStop) {
        todos[currMenuSelection] = {...todos[currMenuSelection], isDone: true};
        notifier.notify({
          title: '1 Pomodoro down',
          message: 'Please take a break now'
        });
      }
      if(!isTimerStop) timer();
    }, 1000);
    return;
  }
  stopTimer();
};

const toggleTimer = (time: number) => {
  if(isTimerStarted && !isTimerStop) {
    stopTimer();
  } else {
    isTimerStarted = true;
    isTimerStop = false;
    timerCount = time;
    timer();
  }
};

process.stdin.on('keypress', (char, key) => {
  if (key.ctrl && key.name === 'c') process.exit();

  if(key.ctrl && currState === 'MAIN_SCREEN') {
    const kName = key.name;

    if(kName === 'x') process.exit();
    if(kName === 's' && todos?.length && !todos[currMenuSelection].isDone) {
      currState = 'START_FOCUS';
      toggleTimer(focusTimerCount);
    }
    if(kName === 'z') {
      currState = 'START_BREAK';
      toggleTimer(breakTimerCount);
    }
    if(kName === '`' && key.ctrl && key.sequence === '\x00' && todos?.length) {
      todos = todos.map((item, i) => {
        return {
          ...item,
          isDone: i === currMenuSelection ? !item.isDone : item.isDone
        }
      });
      mainScreen(todos, currMenuSelection);
    }
    if(kName === 'a') {
      currState = 'ADD_TODO';
      const res = addTodo('', '', todos);
      todos = res.todos;
    }
    if(kName === 'e' && todos?.length && Array.isArray(todos)) {
      currState = 'EDIT_TODO';
      selectedTodo = currMenuSelection;
      isUserInputMode = true;
      editTodo(todos, currMenuSelection, selectedTodo, key.sequence, key.name);
    }
    if(kName === 'd' && todos?.length && Array.isArray(todos)) {
      currState = 'DELETE_TODO';
      selectedTodo = currMenuSelection;
      deleteTodo(todos, currMenuSelection, currMenuSelection, key.sequence);
    }
    return;
  }

  if(withMenuBindings.includes(currState) && !isUserInputMode) {
    if(key && key.name == 'j') {
      if(currMenuSelection === (todos.length - 1) && todosMenu.includes(currState)) {
        currMenuSelection = 0;
      } else {
        currMenuSelection += 1;
      }
    }
    if(key && key.name == 'k') {
      if(currMenuSelection === 0) {
        switch(currState) {
          case 'EDIT_TODO':
          case 'DELETE_TODO':
          case 'MAIN_SCREEN':
            currMenuSelection = (todos.length - 1);
            break;
        }
      } else {
        currMenuSelection -= 1;
      }
    }
  }

  if(['START_FOCUS', 'START_BREAK'].includes(currState)) {
    if(key.ctrl && ['s', 'z'].includes(key.name) && isTimerStarted) {
      while(isTimerStarted) {
        currState = 'MAIN_SCREEN'
        currMenuSelection = 0;
        stopTimer();
        mainScreen(todos, currMenuSelection);
      }
    }
    return;
  }
  if(currState === 'MAIN_SCREEN') {
    mainScreen(todos, currMenuSelection);
    return;
  }

  if(currState === 'ADD_TODO') {
    const res = addTodo(key.sequence, key.name, todos);
    todos = res.todos;
    if(res.isExit) {
      currMenuSelection = 0;
      if(res.todos?.length) {
        clear();
        currState = 'MAIN_SCREEN';
        mainScreen(todos, todos?.length - 1);
        return;
      }
    }
    return;
  }

  if(currState === 'EDIT_TODO') {
    if(key && key.name === 'escape') {
      currState = 'MAIN_SCREEN';
      currMenuSelection = 0;
      selectedTodo = null;
      mainScreen(todos, todos?.length - 1);
      return;
    }
    if(key && key.name === 'return' && selectedTodo === null) {
      selectedTodo = currMenuSelection;
    }

    const res = editTodo(todos, currMenuSelection, selectedTodo, key.sequence, key.name);
    todos = res.todos;

    if(res.isExit) {
      currMenuSelection = 0;
      currState = 'MAIN_SCREEN';
      selectedTodo = null;
      isUserInputMode = false;
      mainScreen(todos, currMenuSelection);
    }
    return;
  }

  if(currState === 'DELETE_TODO') {
    const res = deleteTodo(todos, currMenuSelection, selectedTodo, key.sequence);
    todos = res.todos;

    if(res.isExit) {
      clear();
      currMenuSelection = 0;
      currState = 'MAIN_SCREEN';
      selectedTodo = null;
      mainScreen(todos, currMenuSelection);
    }
    return;
  }
})
