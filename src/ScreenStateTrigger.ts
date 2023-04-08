import { Todo } from './Todo.js';
import Menu from './Menu.js';
import Screen from './Screen.js';
import Timer from './Timer.js';
import fs from 'fs';

const clear = console.clear;

class ScreenStateTrigger {
  private todos: Todo;
  private menu: Menu;
  private timer: Timer;
  private screen: Screen;

  constructor(todos: Todo, menu: Menu, timer: Timer, screen: Screen) {
    this.todos = todos;
    this.menu = menu;
    this.timer = timer;
    this.screen = screen;
  }

  isSetFocusTimerState(key: any) {
    if(this.screen.getCurrentScreen() === 'SET_FOCUS_TIMER') {
      if(key.name === 'return') {
        this.timer.focusTimerCount = +this.screen.getInputValue() * 60;
        this.screen.setIsUserInputMode(false);
        this.screen.clearUserInputValue();
        this.screen.setCurrentScreen('MAIN_SCREEN');
        this.screen.showMainScreen(this.todos.getTodos(), this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
        return true;
      }
      this.screen.onSetFocusTime(key.sequence, key.name, (this.timer.focusTimerCount / 60).toString());
      return true;
    }
    return false
  }
  isSetBreakTimer(key: any) {
    if(this.screen.getCurrentScreen() === 'SET_BREAK_TIMER') {
      if(key.name === 'return') {
        this.timer.breakTimerCount = +this.screen.getInputValue() * 60;
        this.screen.setIsUserInputMode(false);
        this.screen.clearUserInputValue();
        this.screen.setCurrentScreen('MAIN_SCREEN');
        this.screen.showMainScreen(this.todos.getTodos(), this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
        return true;
      }
      this.screen.onSetBreakTime(key.sequence, key.name, (this.timer.breakTimerCount / 60).toString());
      return true;
    }

    return false;
  }
  isStartFocusOrBreak(key: any) {
    if(['START_FOCUS', 'START_BREAK'].includes(this.screen.getCurrentScreen())) {
      const isToggleBreakTimer = key.name === 'z' && this.screen.getCurrentScreen() === 'START_BREAK';
      const isToggleFocusTimer = key.name === 's' && this.screen.getCurrentScreen() === 'START_FOCUS';
      if(key.ctrl && (isToggleBreakTimer || isToggleFocusTimer)) {
        const timerStatus = this.timer.checkTimerStatus();
        if(timerStatus.isTimerPaused &&
          timerStatus.isTimerStarted) {
          switch(this.screen.getCurrentScreen()) {
            case 'START_FOCUS':
              this.timer.startFocusTimer();
              break;
            case 'START_BREAK':
              this.timer.startBreakTimer();
              break;
          }
          let currTodo: any = this.todos.getTodoByIdx(this.menu.getCurrentMenu());
          currTodo = this.menu.menuType === 'submenu' ? currTodo.subTodo[this.menu.currentSubMenu].todo : isToggleBreakTimer ? '' : currTodo.todo;
          this.timer.timerDisplay(this.timer.timerCount, currTodo, this.screen.getCurrentScreen() === 'START_FOCUS' ? 'focus' : 'break');
          return true;
        }
        if(!this.timer.checkTimerStatus().isTimerPaused) {
          while(!this.timer.checkTimerStatus().isTimerPaused) {
            this.timer.pauseTimer();
            clearTimeout(this.timer.timeout);
          }
        }
        return true;
      }
      if(key.ctrl && key.name === 'q') {
        while(!this.timer.checkTimerStatus().isTimerStop) {
          this.timer.stopTimer();
          clearTimeout(this.timer.timeout);
          try {
            fs.writeFileSync('./timer.txt', '');
          } catch(err) {
            //console.log('error on write file => ', err);
          }
        }
        if(this.timer.checkTimerStatus().isTimerStop) {
          setTimeout(() => {
            clear();
            this.screen.setCurrentScreen(this.menu.menuType === 'submenu' ? 'SUBTODO' : 'MAIN_MENU');
            this.screen.showMainScreen(this.todos.getTodos(), this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
          }, 700);
        }
      }
      return true;
    }
    return false;
  }
  isAddTodo(key: any) {
    if(this.screen.getCurrentScreen() === 'ADD_TODO') {
      if(this.screen.getIsUserInputMode()) {
        if(key.name === 'return') {
          this.todos.addTodo(this.screen.getInputValue());
          this.screen.setIsUserInputMode(false);
          this.screen.clearUserInputValue();
          this.menu.setCurrentMenu(this.todos.getTodoLen() - 1);
          this.screen.showMainScreen(this.todos.getTodos(), this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
          return true;
        }
        this.screen.onAddTodo(key.sequence, key.name);
        return true;
      }
    }
    return false;
  }
  isAddSubTodo(key: any) {
    if(this.screen.getCurrentScreen() === 'ADD_SUBTODO') {
      if(this.screen.getIsUserInputMode()) {
        if(key.name === 'return') {
          this.todos.getTodoByIdx(this.menu.getCurrentMenu()).isDone = false;
          this.todos.addSubTodo(this.screen.getInputValue(), this.menu.getCurrentMenu());
          this.screen.clearUserInputValue();
          this.screen.showMainScreen(this.todos.getTodos(), this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
          this.screen.setIsUserInputMode(false);
          return true;
        }
        this.screen.onAddSubTodo(key.sequence, key.name, this.todos.getTodoByIdx(this.menu.getCurrentMenu()).todo);
        return true;
      }
    }
    return false
  }
  isEditTodo(key: any) {
    if(['EDIT_TODO', 'EDIT_SUBTODO'].includes(this.screen.getCurrentScreen())) {
      if(key && key.name === 'escape') {
        this.screen.showMainScreen(this.todos.getTodos(), this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
        return true;
      }
      if(key && key.name === 'return') {
        switch(this.screen.getCurrentScreen()) {
          case 'EDIT_TODO':
            this.todos.updateTodo(this.screen.getInputValue(), this.menu.getCurrentMenu());
            break;
          case 'EDIT_SUBTODO':
            this.todos.updateSubTodo(this.screen.getInputValue(), this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
            this.menu.menuType = 'submenu';
            this.screen.setCurrentScreen('SUBTODO');
            break;
        }
        this.screen.showMainScreen(this.todos.getTodos(), this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
        this.screen.setIsUserInputMode(false);
        this.screen.clearUserInputValue();
        return true;
      }

      let currTodo: any = this.todos.getTodoByIdx(this.menu.getCurrentMenu());
      currTodo = this.menu.menuType === 'submenu' ? currTodo.subTodo[this.menu.currentSubMenu].todo : currTodo.todo;
      if(this.menu.menuType === 'submenu') return this.screen.onEditSubTodo(key.sequence, key.name, currTodo);
      this.screen.onEditTodo(key.sequence, key.name, currTodo);
      return true;
    }
    return false;
  }
  isDeleteTodo(key: any) {
    if(this.screen.getCurrentScreen() === 'DELETE_TODO') {
      if(key.sequence === 'y') {
        this.todos.deleteTodo(this.menu.getCurrentMenu());
        this.menu.setCurrentMenu(this.menu.getCurrentMenu() > 1 ? this.menu.getCurrentMenu() - 1 : 0);
      }
      if(['n', 'y'].includes(key.sequence)) {
        this.screen.showMainScreen(this.todos.getTodos(), this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
      }
      return true;
    }
    return false;
  }
  isShowMainOrSubTodoScreen() {
    if(['MAIN_SCREEN', 'SUBTODO'].includes(this.screen.getCurrentScreen())) {
      this.screen.showMainScreen(this.todos.getTodos(), this.menu.getCurrentMenu(), this.menu.getCurrentSubMenu());
    }
  }
}

export default ScreenStateTrigger;
