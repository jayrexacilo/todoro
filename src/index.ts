import readlineModule from 'readline';
import cliCursor from 'cli-cursor';
import addTodo from './addTodo.js';
import editTodo from './editTodo.js';
import deleteTodo from './deleteTodo.js';
import mainScreen from './mainScreen.js';
import { Todos } from './types.js';

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
const withMenuBindings = ['MAIN_MENU', 'EDIT_TODO', 'DELETE_TODO', 'MAIN_SCREEN'];

mainScreen(todos, currMenuSelection);

process.stdin.on('keypress', (char, key) => {
  if (key.ctrl && key.name === 'c') process.exit();

  if(key.ctrl && currState === 'MAIN_SCREEN') {
    const kName = key.name;

    if(kName === 'x') process.exit();
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
