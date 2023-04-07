import { Todo } from './Todo.js';
import Menu from './Menu.js';
import Screen from './Screen.js';
import Timer from './Timer.js';

const clear = console.clear;

class ScreenStateTrigger {
  isSetFocusTimerState(key: any, todos: Todo, timer: Timer, menu: Menu, screen: Screen) {
    if(screen.getCurrentScreen() === 'SET_FOCUS_TIMER') {
      if(key.name === 'return') {
        timer.focusTimerCount = +screen.getInputValue() * 60;
        screen.setIsUserInputMode(false);
        screen.clearUserInputValue();
        screen.setCurrentScreen('MAIN_SCREEN');
        screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
        return true;
      }
      screen.onSetFocusTime(key.sequence, key.name, (timer.focusTimerCount / 60).toString());
      return true;
    }
    return false
  }
  isSetBreakTimer(key: any, todos: Todo, timer: Timer, menu: Menu, screen: Screen) {
    if(screen.getCurrentScreen() === 'SET_BREAK_TIMER') {
      if(key.name === 'return') {
        timer.breakTimerCount = +screen.getInputValue() * 60;
        screen.setIsUserInputMode(false);
        screen.clearUserInputValue();
        screen.setCurrentScreen('MAIN_SCREEN');
        screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
        return true;
      }
      screen.onSetBreakTime(key.sequence, key.name, (timer.breakTimerCount / 60).toString());
      return true;
    }

    return false;
  }
  isStartFocusOrBreak(key: any, todos: Todo, timer: Timer, screen: Screen, menu: Menu) {
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
          return true;
        }
        if(!timer.checkTimerStatus().isTimerPaused) {
          while(!timer.checkTimerStatus().isTimerPaused) {
            timer.pauseTimer();
            clearTimeout(timer.timeout);
          }
        }
        return true;
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
      return true;
    }
    return false;
  }
  isAddTodo(key: any, todos: Todo, screen: Screen, menu: Menu) {
    if(screen.getCurrentScreen() === 'ADD_TODO') {
      if(screen.getIsUserInputMode()) {
        if(key.name === 'return') {
          todos.addTodo(screen.getInputValue());
          screen.setIsUserInputMode(false);
          screen.clearUserInputValue();
          menu.setCurrentMenu(todos.getTodoLen() - 1);
          screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
          return true;
        }
        screen.onAddTodo(key.sequence, key.name);
        return true;
      }
    }
    return false;
  }
  isAddSubTodo(key: any, todos: Todo, screen: Screen, menu: Menu) {
    if(screen.getCurrentScreen() === 'ADD_SUBTODO') {
      if(screen.getIsUserInputMode()) {
        if(key.name === 'return') {
          todos.getTodoByIdx(menu.getCurrentMenu()).isDone = false;
          todos.addSubTodo(screen.getInputValue(), menu.getCurrentMenu());
          screen.clearUserInputValue();
          screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
          screen.setIsUserInputMode(false);
          return true;
        }
        screen.onAddSubTodo(key.sequence, key.name, todos.getTodoByIdx(menu.getCurrentMenu()).todo);
        return true;
      }
    }
    return false
  }
  isEditTodo(key: any, todos: Todo, screen: Screen, menu: Menu) {
    if(['EDIT_TODO', 'EDIT_SUBTODO'].includes(screen.getCurrentScreen())) {
      if(key && key.name === 'escape') {
        screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
        return true;
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
        return true;
      }

      let currTodo: any = todos.getTodoByIdx(menu.getCurrentMenu());
      currTodo = menu.menuType === 'submenu' ? currTodo.subTodo[menu.currentSubMenu].todo : currTodo.todo;
      if(menu.menuType === 'submenu') return screen.onEditSubTodo(key.sequence, key.name, currTodo);
      screen.onEditTodo(key.sequence, key.name, currTodo);
      return true;
    }
    return false;
  }
  isDeleteTodo(key: any, todos: Todo, screen: Screen, menu: Menu) {
    if(screen.getCurrentScreen() === 'DELETE_TODO') {
      if(key.sequence === 'y') {
        todos.deleteTodo(menu.getCurrentMenu());
        menu.setCurrentMenu(menu.getCurrentMenu() > 1 ? menu.getCurrentMenu() - 1 : 0);
      }
      if(['n', 'y'].includes(key.sequence)) {
        screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
      }
      return true;
    }
    return false;
  }
  isShowMainOrSubTodoScreen(screen: Screen, todos: Todo, menu: Menu) {
    if(['MAIN_SCREEN', 'SUBTODO'].includes(screen.getCurrentScreen())) {
      screen.showMainScreen(todos.getTodos(), menu.getCurrentMenu(), menu.getCurrentSubMenu());
    }
  }
}

export default ScreenStateTrigger;
