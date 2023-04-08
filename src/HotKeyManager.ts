import { Todo } from './Todo.js';
import Menu from './Menu.js';
import Screen from './Screen.js';
import Timer from './Timer.js';

class HotKeyManager {
  private menu: Menu;
  private screen: Screen;
  private timer: Timer;
  private todos: Todo;

  constructor(menu: Menu, screen: Screen, timer: Timer, todos: Todo) {
    this.menu = menu;
    this.screen = screen;
    this.timer = timer;
    this.todos = todos;
  }

  isExit(keyName: string) {
    if(keyName === 'x') process.exit();
  }

  isGotoSubTodo(keyName: string) {
    if(keyName === 'tab' && this.todos.getTodoLen() && this.todos.getTodoByIdx(this.menu.getCurrentMenu()).subTodo?.length) {
      this.menu.setCurrentSubMenu(0);
      if(this.screen.getCurrentScreen() === 'SUBTODO') {
        this.screen.setCurrentScreen('MAIN_SCREEN');
        this.menu.menuType = 'mainmenu';
      } else {
        this.screen.setCurrentScreen('SUBTODO');
        this.menu.menuType = 'submenu';
      }
    }
  }
  isStartFocusTimer(keyName: string) {
    if(keyName === 's' && this.todos.getTodoLen() && !this.todos.getTodoByIdx(this.menu.getCurrentMenu()).isDone) {
      this.screen.setCurrentScreen('START_FOCUS');
      this.timer.startFocusTimer();
      let currTodo: any = this.todos.getTodoByIdx(this.menu.getCurrentMenu());
      currTodo = this.menu.menuType === 'submenu' ? currTodo.subTodo[this.menu.currentSubMenu].todo : currTodo.todo;
      this.timer.timerDisplay(this.timer.focusTimerCount, currTodo, 'focus');
      return true;
    }
    return false;
  }
  isStartBreakTimer(keyName: string) {
    if(keyName === 'z') {
      this.screen.setCurrentScreen('START_BREAK');
      this.timer.startBreakTimer();
      this.timer.timerDisplay(this.timer.breakTimerCount, '', 'break');
      return true;
    }
    return false;
  }
  isSetFocusTimer(keyName: string) {
    if(keyName === 'o') {
      this.screen.setCurrentScreen('SET_FOCUS_TIMER');
    }
  }
  isSetBreakTimer(keyName: string) {
    if(keyName === 'p') {
      this.screen.setCurrentScreen('SET_BREAK_TIMER');
    }
  }
  isAddTodo(keyName: string) {
    if(keyName === 'a') {
      this.screen.setCurrentScreen('ADD_TODO');
      this.screen.setIsUserInputMode(true);
    }
  }
  isAddSubTodo(keyName: string) {
    if(keyName === 'f') {
      this.screen.setCurrentScreen('ADD_SUBTODO');
      this.screen.setIsUserInputMode(true);
    }
  }
  isEditTodo(keyName: string) {
    if(keyName === 'e' && this.todos.getTodoLen()) {
      this.screen.setCurrentScreen(this.menu.menuType === 'mainmenu' ? 'EDIT_TODO' : 'EDIT_SUBTODO');
      this.screen.setIsUserInputMode(true);
    }
  }
  isDeleteTodo(keyName: string) {
    if(keyName === 'd' && this.todos.getTodoLen()) {
      this.screen.setCurrentScreen('DELETE_TODO');
      this.screen.onDeleteTodo(this.todos.getTodoByIdx(this.menu.getCurrentMenu()).todo);
    }
  }
  isToggleTodoStatus(keyName: string, key: any) {
    if(keyName === '`' && key.ctrl && key.sequence === '\x00' && this.todos.getTodoLen()) {
      if(this.screen.getCurrentScreen() === 'MAIN_SCREEN') this.todos.toggleTodoStatus(this.menu.getCurrentMenu());
      if(this.screen.getCurrentScreen() === 'SUBTODO') this.todos.toggleSubTodoStatus(this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
      this.screen.showMainScreen(this.todos.getTodos(), this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
    }
  }
  isTriggered(key: any) {
    return key.ctrl && ['MAIN_SCREEN', 'SUBTODO'].includes(this.screen.getCurrentScreen()) || (key.name === 'tab' && !key.ctrl);
  }
}

export default HotKeyManager;
