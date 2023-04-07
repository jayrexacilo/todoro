import { Todo } from './Todo.js';
import Menu from './Menu.js';
import Screen from './Screen.js';
import Timer from './Timer.js';

class HotKeyManager {
  isExit(keyName: string) {
    if(keyName === 'x') process.exit();
  }

  isGotoSubTodo(keyName: string, menu: Menu, todos: Todo, screen: Screen) {
    if(keyName === 'tab' && todos.getTodoLen() && todos.getTodoByIdx(menu.getCurrentMenu()).subTodo?.length) {
      menu.setCurrentSubMenu(0);
      if(screen.getCurrentScreen() === 'SUBTODO') {
        screen.setCurrentScreen('MAIN_SCREEN');
        menu.menuType = 'mainmenu';
      } else {
        screen.setCurrentScreen('SUBTODO');
        menu.menuType = 'submenu';
      }
    }
  }
  isStartFocusTimer(keyName: string, todos: Todo, menu: Menu, screen: Screen, timer: Timer) {
    if(keyName === 's' && todos.getTodoLen() && !todos.getTodoByIdx(menu.getCurrentMenu()).isDone) {
      screen.setCurrentScreen('START_FOCUS');
      timer.startFocusTimer();
      let currTodo: any = todos.getTodoByIdx(menu.getCurrentMenu());
      currTodo = menu.menuType === 'submenu' ? currTodo.subTodo[menu.currentSubMenu].todo : currTodo.todo;
      timer.timerDisplay(timer.focusTimerCount, currTodo, 'focus');
      return true;
    }
    return false;
  }
  isStartBreakTimer(keyName: string, screen: Screen, timer: Timer) {
    if(keyName === 'z') {
      screen.setCurrentScreen('START_BREAK');
      timer.startBreakTimer();
      timer.timerDisplay(timer.breakTimerCount, '', 'break');
      return true;
    }
    return false;
  }
  isSetFocusTimer(keyName: string, screen: Screen) {
    if(keyName === 'o') {
      screen.setCurrentScreen('SET_FOCUS_TIMER');
    }
  }
  isSetBreakTimer(keyName: string, screen: Screen) {
    if(keyName === 'p') {
      screen.setCurrentScreen('SET_BREAK_TIMER');
    }
  }
  isAddTodo(keyName: string, screen: Screen) {
    if(keyName === 'a') {
      screen.setCurrentScreen('ADD_TODO');
      screen.setIsUserInputMode(true);
    }
  }
  isAddSubTodo(keyName: string, screen: Screen) {
    if(keyName === 'f') {
      screen.setCurrentScreen('ADD_SUBTODO');
      screen.setIsUserInputMode(true);
    }
  }
  isEditTodo(keyName: string, screen: Screen, todos: Todo, menu: Menu) {
    if(keyName === 'e' && todos.getTodoLen()) {
      screen.setCurrentScreen(menu.menuType === 'mainmenu' ? 'EDIT_TODO' : 'EDIT_SUBTODO');
      screen.setIsUserInputMode(true);
    }
  }
  isDeleteTodo(keyName: string, screen: Screen, todos: Todo, menu: Menu) {
    if(keyName === 'd' && todos.getTodoLen()) {
      screen.setCurrentScreen('DELETE_TODO');
      screen.onDeleteTodo(todos.getTodoByIdx(menu.getCurrentMenu()).todo);
    }
  }
  isToggleTodoStatus(keyName: string, key: any, todos: Todo, menu: Menu, screen: Screen) {
    if(keyName === '`' && key.ctrl && key.sequence === '\x00' && todos.getTodoLen()) {
      if(screen.getCurrentScreen() === 'MAIN_SCREEN') todos.toggleTodoStatus(menu.getCurrentMenu());
      if(screen.getCurrentScreen() === 'SUBTODO') todos.toggleSubTodoStatus(menu.getCurrentMenu(), menu.getCurrentSubMenu());
      screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
    }
  }
  isTriggered(key: any, screen: Screen) {
    return key.ctrl && ['MAIN_SCREEN', 'SUBTODO'].includes(screen.getCurrentScreen()) || (key.name === 'tab' && !key.ctrl);
  }
}

export default HotKeyManager;
