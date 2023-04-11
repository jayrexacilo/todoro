import readlineModule from 'readline';
import cliCursor from 'cli-cursor';
import fs from 'fs';

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
const onScreenStateChange = new ScreenStateTrigger(todos, menu, timer, screen);

screen.showMainScreen(menu.getCurrentMenu(), menu.getCurrentSubMenu()).then(res => {
});

process.stdin.on('keypress', async (char, key) => {
  if (key.ctrl && key.name === 'c') {
    try {
      fs.writeFileSync('./timer.txt', '');
    } catch(err) {
    }
    process.exit();
  }
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

  if(await todoListMovements.isTriggered()) {
    const currentMenuSelection: number = menu.getCurrentMenu();
    const currScreen = screen.getCurrentScreen();
    await todoListMovements.isMenuMoving(key, currScreen, currentMenuSelection);
  }

  if(await onScreenStateChange.isSetFocusTimerState(key)) return;
  if(await onScreenStateChange.isSetBreakTimer(key)) return;
  if(await onScreenStateChange.isStartFocusOrBreak(key)) return;
  if(await onScreenStateChange.isAddTodo(key)) return;
  if(await onScreenStateChange.isAddSubTodo(key)) return;
  if(await onScreenStateChange.isEditTodo(key)) return;
  if(await onScreenStateChange.isDeleteTodo(key)) return;
  await onScreenStateChange.isShowMainOrSubTodoScreen();
});
