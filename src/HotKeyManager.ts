import { Todo } from './Todo.js';
import Menu from './Menu.js';
import Screen from './Screen.js';
import Timer from './Timer.js';
import Server from './Server.js';

class HotKeyManager {
  private menu: Menu;
  private screen: Screen;
  private timer: Timer;
  private todos: Todo;
  private server;

  constructor(menu: Menu, screen: Screen, timer: Timer, todos: Todo) {
    this.menu = menu;
    this.screen = screen;
    this.timer = timer;
    this.todos = todos;
    this.server = new Server();
  }

  isExit(keyName: string) {
    if(keyName === 'x') process.exit();
  }

  async isGotoSubTodo(keyName: string) {
    const currIdx: number = this.menu.getCurrentMenu();
    const getTodos = await this.server.getTodos();
    const todos = getTodos.filter((item: any) => !item.parentTodoId);
    const todosLen = todos?.length
    const currTodo = todos[currIdx];
    const subTodos = getTodos.filter((item: any) => item.parentTodoId === currTodo.id);
    if(keyName === 'tab' && todosLen && subTodos?.length) {
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
  async isStartFocusTimer(keyName: string) {
    if(keyName === 's' && await this.todos.getTodoLen()) {
      this.screen.setCurrentScreen('START_FOCUS');
      this.timer.startFocusTimer();
      let currTodo: any = await this.todos.getTodoByIdx(this.menu.getCurrentMenu());
      const getSubTodos = await this.todos.getSubTodos();
      const subTodos = getSubTodos?.filter((item: any) => item.parentTodoId === currTodo.id);
      if(!currTodo && !subTodos?.length) return;
      const currTodoText = this.menu.menuType === 'submenu' ? subTodos[this.menu.getCurrentSubMenu()].todo : currTodo.todo;
      this.timer.timerDisplay(this.timer.focusTimerCount, currTodoText, 'focus');
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
  async isEditTodo(keyName: string) {
    if(keyName === 'e' && await this.todos.getTodoLen()) {
      this.screen.setCurrentScreen(this.menu.menuType === 'mainmenu' ? 'EDIT_TODO' : 'EDIT_SUBTODO');
      this.screen.setIsUserInputMode(true);
    }
  }
  async isDeleteTodo(keyName: string) {
    const getTodos = await this.server.getTodos();
    const todos = getTodos.filter((item: any) => !item.parentTodoId);
    const todosLen = todos?.length
    if(keyName === 'd' && todosLen) {
      const getTodo = await this.todos.getTodoByIdx(this.menu.getCurrentMenu());
      setTimeout(() => {
        this.screen.setCurrentScreen('DELETE_TODO');
        this.screen.onDeleteTodo(getTodo.todo);
      }, 80);
    }
  }
  async isToggleTodoStatus(keyName: string, key: any) {
    const getTodos = await this.server.getTodos();
    const todos = getTodos.filter((item: any) => !item.parentTodoId);
    const todosLen = todos?.length

    if(keyName === '`' && key.ctrl && key.sequence === '\x00' && todosLen) {
      if(this.screen.getCurrentScreen() === 'MAIN_SCREEN') this.todos.toggleTodoStatus(this.menu.getCurrentMenu());
      if(this.screen.getCurrentScreen() === 'SUBTODO') this.todos.toggleSubTodoStatus(this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
      setTimeout(() => {
        this.screen.showMainScreen(this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
      }, 300);
    }
  }
  isTriggered(key: any) {
    return key.ctrl && ['MAIN_SCREEN', 'SUBTODO'].includes(this.screen.getCurrentScreen()) || (key.name === 'tab' && !key.ctrl);
  }
}

export default HotKeyManager;
