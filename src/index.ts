import readlineModule from 'readline';
import cliCursor from 'cli-cursor';

import { Todo } from './Todo.js';
import Menu from './Menu.js';
import Screen from './Screen.js';
import Timer from './Timer.js';

cliCursor.hide();

const log = console.log;
const clear = console.clear;

readlineModule.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const todosMenu: string[] = ['EDIT_TODO', 'DELETE_TODO', 'MAIN_SCREEN', 'SUBTODO'];
const screen = new Screen('MAIN_SCREEN');
const todos = new Todo([]);
const menu = new Menu(0);
const timer = new Timer(1500, 300);

screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());

process.stdin.on('keypress', (char, key) => {
  if (key.ctrl && key.name === 'c') process.exit();
  if(key.shift && key.name === 'h' && screen.getCurrentScreen() === 'MAIN_SCREEN') screen.toggleShowBindings();
    
  if(key.ctrl && ['MAIN_SCREEN', 'SUBTODO'].includes(screen.getCurrentScreen()) || (key.name === 'tab' && !key.ctrl)) {
    const kName = key.name;

    if(kName === 'x') process.exit();
    if(kName === 'tab' && todos.getTodoLen() && todos.getTodoByIdx(menu.getCurrentMenu()).subTodo?.length) {
      menu.setCurrentSubMenu(0);
      if(screen.getCurrentScreen() === 'SUBTODO') {
        screen.setCurrentScreen('MAIN_SCREEN');
      } else {
        screen.setCurrentScreen('SUBTODO');
      }
    }
    if(kName === 's' && todos.getTodoLen() && !todos.getTodoByIdx(menu.getCurrentMenu()).isDone) {
      screen.setCurrentScreen('START_FOCUS');
      timer.startFocusTimer();
    }
    if(kName === 'z') {
      screen.setCurrentScreen('START_BREAK');
      timer.startBreakTimer();
    }
    if(kName === '`' && key.ctrl && key.sequence === '\x00' && todos.getTodoLen()) {
      if(screen.getCurrentScreen() === 'MAIN_SCREEN') todos.toggleTodoStatus(menu.getCurrentMenu());
      if(screen.getCurrentScreen() === 'SUBTODO') todos.toggleSubTodoStatus(menu.getCurrentMenu(), menu.getCurrentSubMenu());
      screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
    }
    if(kName === 'a') {
      screen.setCurrentScreen('ADD_TODO');
      screen.setIsUserInputMode(true);
    }
    if(kName === 'f') {
      screen.setCurrentScreen('ADD_SUBTODO');
      screen.setIsUserInputMode(true);
    }
    if(kName === 'e' && todos.getTodoLen()) {
      screen.setCurrentScreen('EDIT_TODO');
      screen.setIsUserInputMode(true);
    }
    if(kName === 'd' && todos.getTodoLen()) {
      screen.setCurrentScreen('DELETE_TODO');
      screen.onDeleteTodo(todos.getTodoByIdx(menu.getCurrentMenu()).todo);
    }
  }

  if(screen.getMenuWithBindings().includes(screen.getCurrentScreen()) && !screen.getIsUserInputMode() && todos.getTodoLen()) {
    const currentMenuSelection: number = menu.getCurrentMenu();
    const currScreen = screen.getCurrentScreen();
    if(key && key.name == 'j' && currScreen !== 'SUBTODO') {
      if(currentMenuSelection === (todos.getTodoLen() - 1) && todosMenu.includes(currScreen)) {
        menu.setCurrentMenu(0);
      } else {
        menu.setCurrentMenu(menu.getCurrentMenu() + 1);
      }
    }
    if(key && key.name == 'k' && currScreen !== 'SUBTODO') {
      menu.setCurrentSubMenu(0);
      if(currentMenuSelection === 0) {
        switch(currScreen) {
          case 'EDIT_TODO':
          case 'DELETE_TODO':
          case 'MAIN_SCREEN':
            menu.setCurrentMenu(todos.getTodoLen() - 1);
            break;
        }
      } else {
        menu.setCurrentMenu(menu.getCurrentMenu() - 1);
      }
    }
    if(currScreen === 'SUBTODO') {
      const currentSubMenuSelection: number = menu.getCurrentSubMenu();
      const currentTodo = todos.getTodoByIdx(menu.getCurrentMenu());
      const currentSubTodo = currentTodo.subTodo;
      if(key && key.name == 'j') {
        if(currentSubMenuSelection === (currentSubTodo.length - 1) && todosMenu.includes(currScreen)) {
          menu.setCurrentSubMenu(0);
        } else {
          menu.setCurrentSubMenu(menu.getCurrentSubMenu() + 1);
        }
      }
      if(key && key.name == 'k') {
        if(currentSubMenuSelection === 0) {
          menu.setCurrentSubMenu(currentSubTodo.length - 1);
        } else {
          menu.setCurrentSubMenu(menu.getCurrentSubMenu() - 1);
        }
      }
    }
  }

  if(screen.getCurrentScreen() === 'ADD_TODO') {
    if(screen.getIsUserInputMode()) {
      if(key.name === 'return') {
        todos.addTodo(screen.getTodoInputValue());
        screen.clearUserInputValue();
        screen.showMainScreen(todos.getTodos(), todos.getTodoLen() - 1, menu.getCurrentSubMenu());
        screen.setIsUserInputMode(false);
        return;
      }
      screen.onAddTodo(key.sequence, key.name);
    }
  }
  if(screen.getCurrentScreen() === 'ADD_SUBTODO') {
    if(screen.getIsUserInputMode()) {
      if(key.name === 'return') {
        todos.addSubTodo(screen.getTodoInputValue(), menu.getCurrentMenu());
        screen.clearUserInputValue();
        screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
        screen.setIsUserInputMode(false);
        return;
      }
      screen.onAddSubTodo(key.sequence, key.name, todos.getTodoByIdx(menu.getCurrentMenu()).todo);
    }
  }

  if(screen.getCurrentScreen() === 'EDIT_TODO') {
    if(key && key.name === 'escape') {
      screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
      return;
    }
    if(key && key.name === 'return') {
      todos.updateTodo(screen.getTodoInputValue(), menu.getCurrentMenu());
      screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
      screen.setIsUserInputMode(false);
      screen.clearUserInputValue();
      return;
    }

    screen.onEditTodo(key.sequence, key.name, todos.getTodoByIdx(menu.getCurrentMenu()).todo);
    return;
  }

  if(screen.getCurrentScreen() === 'DELETE_TODO') {
    if(key.sequence === 'y') {
      todos.deleteTodo(menu.getCurrentMenu());
      menu.setCurrentMenu(menu.getCurrentMenu() > 1 ? menu.getCurrentMenu() - 1 : 0);
    }
    if(['n', 'y'].includes(key.sequence)) {
      screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
    }
    return;
  }

  if(['MAIN_SCREEN', 'SUBTODO'].includes(screen.getCurrentScreen())) {
    screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
  }

});
