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
        menu.menuType = 'mainmenu';
      } else {
        screen.setCurrentScreen('SUBTODO');
        menu.menuType = 'submenu';
      }
    }
    if(kName === 's' && todos.getTodoLen() && !todos.getTodoByIdx(menu.getCurrentMenu()).isDone) {
      screen.setCurrentScreen('START_FOCUS');
      timer.startFocusTimer();
      let currTodo: any = todos.getTodoByIdx(menu.getCurrentMenu());
      currTodo = menu.menuType === 'submenu' ? currTodo.subTodo[menu.currentSubMenu].todo : currTodo.todo;
      timer.timerDisplay(timer.focusTimerCount, currTodo);
      return;
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
      screen.setCurrentScreen(menu.menuType === 'mainmenu' ? 'EDIT_TODO' : 'EDIT_SUBTODO');
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

  if(screen.getCurrentScreen() === 'START_FOCUS') {
    if(key.ctrl && key.name === 's') {
      const timerStatus = timer.checkTimerStatus();
      if(timerStatus.isTimerPaused &&
        timerStatus.isTimerStarted) {
        timer.startFocusTimer();
        let currTodo: any = todos.getTodoByIdx(menu.getCurrentMenu());
        currTodo = menu.menuType === 'submenu' ? currTodo.subTodo[menu.currentSubMenu].todo : currTodo.todo;
        timer.timerDisplay(timer.timerCount, currTodo);
        return;
      }
      if(!timer.checkTimerStatus().isTimerPaused) {
        while(!timer.checkTimerStatus().isTimerPaused) {
          timer.pauseTimer();
          clearTimeout(timer.timeout);
        }
      }
      return;
    }
    if(key.ctrl && key.name === 'q') {
      while(!timer.checkTimerStatus().isTimerStop) {
        timer.stopTimer();
      }
      if(timer.checkTimerStatus().isTimerStop) {
        setTimeout(() => {
          clear();
          screen.setCurrentScreen('MAIN_MENU');
          screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
          menu.menuType = 'mainmenu';
        }, 700);
      }
    }
    return;
  }
  if(screen.getCurrentScreen() === 'ADD_TODO') {
    if(screen.getIsUserInputMode()) {
      if(key.name === 'return') {
        todos.addTodo(screen.getTodoInputValue());
        screen.setIsUserInputMode(false);
        screen.clearUserInputValue();
        menu.setCurrentMenu(todos.getTodoLen() - 1);
        screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
        return;
      }
      screen.onAddTodo(key.sequence, key.name);
    }
  }
  if(screen.getCurrentScreen() === 'ADD_SUBTODO') {
    if(screen.getIsUserInputMode()) {
      if(key.name === 'return') {
        todos.getTodoByIdx(menu.getCurrentMenu()).isDone = false;
        todos.addSubTodo(screen.getTodoInputValue(), menu.getCurrentMenu());
        screen.clearUserInputValue();
        screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
        screen.setIsUserInputMode(false);
        return;
      }
      screen.onAddSubTodo(key.sequence, key.name, todos.getTodoByIdx(menu.getCurrentMenu()).todo);
    }
  }

  if(['EDIT_TODO', 'EDIT_SUBTODO'].includes(screen.getCurrentScreen())) {
    if(key && key.name === 'escape') {
      screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
      return;
    }
    if(key && key.name === 'return') {
      switch(screen.getCurrentScreen()) {
        case 'EDIT_TODO':
          todos.updateTodo(screen.getTodoInputValue(), menu.getCurrentMenu());
          break;
        case 'EDIT_SUBTODO':
          todos.updateSubTodo(screen.getTodoInputValue(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
          menu.menuType = 'submenu';
          screen.setCurrentScreen('SUBTODO');
          break;
      }
      screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
      screen.setIsUserInputMode(false);
      screen.clearUserInputValue();
      return;
    }

    let currTodo: any = todos.getTodoByIdx(menu.getCurrentMenu());
    currTodo = menu.menuType === 'submenu' ? currTodo.subTodo[menu.currentSubMenu].todo : currTodo.todo;
    if(menu.menuType === 'submenu') return screen.onEditSubTodo(key.sequence, key.name, currTodo);
    screen.onEditTodo(key.sequence, key.name, currTodo);
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
