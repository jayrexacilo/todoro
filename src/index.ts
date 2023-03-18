import readlineModule from 'readline';
import chalk from 'chalk';
import cliCursor from 'cli-cursor';
import addTodo from './addTodo.js';
import showTodos from './showTodos.js';
import editTodo from './editTodo.js';
import deleteTodo from './deleteTodo.js';

cliCursor.hide();

const log = console.log;
const clear = console.clear;

readlineModule.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
const validUserInput: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
const validSpecialChar: string = `~!@#$^&()_+={}[]|\/:;"'<,.`;
const mainMenu: string[] = [
  "Start todo",
  "Add todo",
  "Edit todo",
  "Delete todo",
  "Show todos"
];

let currState = 'MAIN_MENU';
let currMenuSelection = 0;
let todos: string[] = [];
let selectedTodo: null | number = null;

printMenu(mainMenu, currMenuSelection, 'Menu');

process.stdin.on('keypress', (char, key) => {
  if (key.ctrl && key.name === 'c') process.exit();

  if(currState === 'MAIN_MENU' ||
    currState === 'EDIT_TODO' ||
    currState === 'DELETE_TODO'
  ) {
    if(key && key.name == 'j') {
      if((currMenuSelection === (mainMenu.length - 1) && currState === 'MAIN_MENU') ||
        (currMenuSelection === (todos.length - 1) && ['EDIT_TODO', 'DELETE_TODO'].includes(currState))) {
        currMenuSelection = 0;
      } else {
        currMenuSelection += 1;
      }
    }
    if(key && key.name == 'k') {
      if(currMenuSelection === 0) {
        switch(currState) {
          case 'MAIN_MENU':
            currMenuSelection = (mainMenu.length - 1);
            break;
          case 'EDIT_TODO':
          case 'DELETE_TODO':
            currMenuSelection = (todos.length - 1);
            break;
        }
      } else {
        currMenuSelection -= 1;
      }
    }
  }

  if(currState === 'ADD_TODO') {
    const res = addTodo(key.sequence, key.name, todos);
    todos = res.todos;
    if(res.isExit) {
      currMenuSelection = 0;
      if(res.todos?.length) {
        clear();
        currState = 'SHOW_TODOS';
        showTodos(todos);
        return;
      }
      currState = 'MAIN_MENU';
      printMenu(mainMenu, currMenuSelection, 'Menu');
    }
    return;
  }

  if(currState === 'SHOW_TODOS') {
    printMenu(mainMenu, 0, 'Menu');
    currState = 'MAIN_MENU';
    currMenuSelection = 0;
    return;
  }

  if(currState === 'EDIT_TODO') {
    if(key && key.name === 'escape') {
      currState = 'MAIN_MENU';
      currMenuSelection = 0;
      selectedTodo = null;
      printMenu(mainMenu, currMenuSelection, 'Menu');
      return;
    }
    if(key && key.name === 'return' && selectedTodo === null) {
      selectedTodo = currMenuSelection;
    }

    const res = editTodo(todos, currMenuSelection, selectedTodo, key.sequence, key.name);
    todos = res.todos;

    if(res.isExit) {
      currMenuSelection = 0;
      currState = 'SHOW_TODOS';
      selectedTodo = null;
      showTodos(todos);
    }
    return;
  }

  if(currState === 'DELETE_TODO') {
    if(key && key.name === 'escape') {
      currState = 'MAIN_MENU';
      currMenuSelection = 0;
      selectedTodo = null;
      printMenu(mainMenu, currMenuSelection, 'Menu');
      return;
    }
    if(key && key.name === 'return' && selectedTodo === null) {
      selectedTodo = currMenuSelection;
    }

    const res = deleteTodo(todos, currMenuSelection, selectedTodo, key.sequence);
    todos = res.todos;

    if(res.isExit) {
      clear();
      currMenuSelection = 0;
      currState = 'SHOW_TODOS';
      selectedTodo = null;
      showTodos(todos);
    }
    return;
  }

  if(currState === 'MAIN_MENU') {
    if(key.name === 'return') {
      clear();
      if(currState === 'MAIN_MENU') {
        const selectedMenu = mainMenu[currMenuSelection];
        switch(selectedMenu) {
          case 'Add todo':
            currState = 'ADD_TODO';
            const res = addTodo('', '', todos);
            todos = res.todos;
            break;
          case 'Edit todo':
            currState = 'EDIT_TODO';
            currMenuSelection = 0;
            editTodo(todos, currMenuSelection, null, key.sequence, key.name);
            break;
          case 'Delete todo':
            currState = 'DELETE_TODO';
            currMenuSelection = 0;
            selectedTodo = null
            deleteTodo(todos, currMenuSelection, selectedTodo, key.sequence);
            break;
          case 'Show todos':
            currState = 'SHOW_TODOS';
            showTodos(todos);
            break;
          default:
            currState = 'START_TODO';
            break;
        }
      }
      return;
    }

    printMenu(mainMenu, currMenuSelection, 'Menu');

    return;
  }
})

function printMenu(menus: string[], currSelection: number, title: string) {
  clear();
  log(chalk.red('Menus'));
  mainMenu.map((menu, i) => {
    if(i === currMenuSelection) {
      log(chalk.green(menu));
      return;
    }
    log(menu)
  });
}
