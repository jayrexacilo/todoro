import readlineModule from 'readline';
import cliCursor from 'cli-cursor';

import { Todo } from './Todo.js';
import Menu from './Menu.js';
import Screen from './Screen.js';
import Timer from './Timer.js';
import HotKeyManager from './HotKeyManager.js';
import TodoListMovementsManager from './TodoListMovementManager.js';

cliCursor.hide();

const clear = console.clear;

readlineModule.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const todosMenu: string[] = ['EDIT_TODO', 'DELETE_TODO', 'MAIN_SCREEN', 'SUBTODO'];
const screen = new Screen('MAIN_SCREEN');
const todos = new Todo([]);
const menu = new Menu(0);
const timer = new Timer();
const hkey = new HotKeyManager();
const todoListMovements = new TodoListMovementsManager();

screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());

process.stdin.on('keypress', (char, key) => {
  if (key.ctrl && key.name === 'c') process.exit();
  if(key.shift && key.name === 'h' && screen.getCurrentScreen() === 'MAIN_SCREEN') screen.toggleShowBindings();
    
  if(hkey.isTriggered(key, screen)) {
    const keyName = key.name;
    hkey.isExit(keyName);
    hkey.isGotoSubTodo(keyName, menu, todos, screen);
    hkey.isSetFocusTimer(keyName, screen);
    hkey.isSetBreakTimer(keyName, screen);
    hkey.isToggleTodoStatus(keyName, key, todos, menu, screen);
    hkey.isAddTodo(keyName, screen);
    hkey.isAddSubTodo(keyName, screen);
    hkey.isEditTodo(keyName, screen, todos, menu);
    hkey.isDeleteTodo(keyName, screen, todos, menu);
    if(hkey.isStartFocusTimer(keyName, todos, menu, screen, timer)) return;
    if(hkey.isStartBreakTimer(keyName, screen, timer)) return;
  }

  if(todoListMovements.isTriggered(screen, todos)) {
    const currentMenuSelection: number = menu.getCurrentMenu();
    const currScreen = screen.getCurrentScreen();
    todoListMovements.isSubTodoDown(key, currScreen, currentMenuSelection, todosMenu, todos, menu);
    todoListMovements.isSubTodoUp(key, currScreen, currentMenuSelection, todos, menu)
    todoListMovements.isTodoUpDown(key, currScreen, todosMenu, todos, menu);
  }

  if(screen.getCurrentScreen() === 'SET_FOCUS_TIMER') {
    if(key.name === 'return') {
      timer.focusTimerCount = +screen.getInputValue() * 60;
      screen.setIsUserInputMode(false);
      screen.clearUserInputValue();
      screen.setCurrentScreen('MAIN_SCREEN');
      screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
      return;
    }
    screen.onSetFocusTime(key.sequence, key.name, (timer.focusTimerCount / 60).toString());
    return;
  }
  if(screen.getCurrentScreen() === 'SET_BREAK_TIMER') {
    if(key.name === 'return') {
      timer.breakTimerCount = +screen.getInputValue() * 60;
      screen.setIsUserInputMode(false);
      screen.clearUserInputValue();
      screen.setCurrentScreen('MAIN_SCREEN');
      screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
      return;
    }
    screen.onSetBreakTime(key.sequence, key.name, (timer.breakTimerCount / 60).toString());
    return;
  }
  if(['START_FOCUS', 'START_BREAK'].includes(screen.getCurrentScreen())) {
    const isToggleBreakTimer = key.name === 'z' && screen.getCurrentScreen() === 'START_BREAK';
    const isToggleFocusTimer = key.name === 's' && screen.getCurrentScreen() === 'START_FOCUS';
    if(key.ctrl && (isToggleBreakTimer || isToggleFocusTimer)) {
      const timerStatus = timer.checkTimerStatus();
      if(timerStatus.isTimerPaused &&
        timerStatus.isTimerStarted) {
        switch(screen.getCurrentScreen()) {
          case 'START_FOCUS':
            timer.startFocusTimer();
            break;
          case 'START_BREAK':
            timer.startBreakTimer();
            break;
        }
        let currTodo: any = todos.getTodoByIdx(menu.getCurrentMenu());
        currTodo = menu.menuType === 'submenu' ? currTodo.subTodo[menu.currentSubMenu].todo : isToggleBreakTimer ? '' : currTodo.todo;
        timer.timerDisplay(timer.timerCount, currTodo, screen.getCurrentScreen() === 'START_FOCUS' ? 'focus' : 'break');
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
        clearTimeout(timer.timeout);
      }
      if(timer.checkTimerStatus().isTimerStop) {
        setTimeout(() => {
          clear();
          screen.setCurrentScreen(menu.menuType === 'submenu' ? 'SUBTODO' : 'MAIN_MENU');
          screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
        }, 700);
      }
    }
    return;
  }
  if(screen.getCurrentScreen() === 'ADD_TODO') {
    if(screen.getIsUserInputMode()) {
      if(key.name === 'return') {
        todos.addTodo(screen.getInputValue());
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
        todos.addSubTodo(screen.getInputValue(), menu.getCurrentMenu());
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
          todos.updateTodo(screen.getInputValue(), menu.getCurrentMenu());
          break;
        case 'EDIT_SUBTODO':
          todos.updateSubTodo(screen.getInputValue(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
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
