import readlineModule from 'readline';
import cliCursor from 'cli-cursor';

import { Todo } from './Todo.js';
import Menu from './Menu.js';
import Screen from './Screen.js';
import Timer from './Timer.js';
import HotKeyManager from './HotKeyManager.js';
import TodoListMovementsManager from './TodoListMovementManager.js';
import ScreenStateTrigger from './ScreenStateTrigger.js';

cliCursor.hide();

readlineModule.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const todosMenu: string[] = ['EDIT_TODO', 'DELETE_TODO', 'MAIN_SCREEN', 'SUBTODO'];
const screen = new Screen('MAIN_SCREEN');
const todos = new Todo([]);
const menu = new Menu(0);
const timer = new Timer();
const hkey = new HotKeyManager();
const todoListMovements = new TodoListMovementsManager();
const onScreenStateChange = new ScreenStateTrigger();

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

  if(onScreenStateChange.isSetFocusTimerState(key, todos, timer, menu, screen)) return;
  if(onScreenStateChange.isSetBreakTimer(key, todos, timer, menu, screen)) return;
  if(onScreenStateChange.isStartFocusOrBreak(key, todos, timer, screen, menu)) return;
  if(onScreenStateChange.isAddTodo(key, todos, screen, menu)) return;
  if(onScreenStateChange.isAddSubTodo(key, todos, screen, menu)) return;
  if(onScreenStateChange.isEditTodo(key, todos, screen, menu)) return;
  if(onScreenStateChange.isDeleteTodo(key, todos, screen, menu)) return;
  onScreenStateChange.isShowMainOrSubTodoScreen(screen, todos, menu)
});
