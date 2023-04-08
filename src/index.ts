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
const hkey = new HotKeyManager(menu, screen, timer, todos);
const todoListMovements = new TodoListMovementsManager(todos, menu, screen, todosMenu);
const onScreenStateChange = new ScreenStateTrigger();

screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());

process.stdin.on('keypress', (char, key) => {
  if (key.ctrl && key.name === 'c') process.exit();
  if(key.shift && key.name === 'h' && screen.getCurrentScreen() === 'MAIN_SCREEN') screen.toggleShowBindings();
    
  if(hkey.isTriggered(key)) {
    const keyName = key.name;
    hkey.isExit(keyName);
    hkey.isGotoSubTodo(keyName);
    hkey.isSetFocusTimer(keyName);
    hkey.isSetBreakTimer(keyName);
    hkey.isToggleTodoStatus(keyName, key);
    hkey.isAddTodo(keyName);
    hkey.isAddSubTodo(keyName);
    hkey.isEditTodo(keyName);
    hkey.isDeleteTodo(keyName);
    if(hkey.isStartFocusTimer(keyName)) return;
    if(hkey.isStartBreakTimer(keyName)) return;
  }

  if(todoListMovements.isTriggered()) {
    const currentMenuSelection: number = menu.getCurrentMenu();
    const currScreen = screen.getCurrentScreen();
    todoListMovements.isSubTodoDown(key, currScreen, currentMenuSelection);
    todoListMovements.isSubTodoUp(key, currScreen, currentMenuSelection)
    todoListMovements.isTodoUpDown(key, currScreen);
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
