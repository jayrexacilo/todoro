import Server from './Server.js';
import {todoTypeS, todoType, subTodoType} from './Todo.js';
import chalk from 'chalk';

const log = console.log;
const clear = console.clear;

class Screen {
  static withMenuBindings: string[] = ['MAIN_MENU', 'EDIT_TODO', 'DELETE_TODO', 'MAIN_SCREEN', 'SUBTODO'];
  static validUserInput: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  static validSpecialChar: string = `~!@#$^&()_+={}[]|\/:;"'<,.`;
  private userInput: string[] = [];
  private currentScreen: string
  private isUserInputMode: boolean = false;
  private isShowHelp: boolean = false;
  private server;

  constructor(
    currentScreen: string
  ) {
    this.currentScreen = currentScreen;
    this.server = new Server();
  }

  setCurrentScreen(screen: string) {
    this.currentScreen = screen;
  }
  getMenuWithBindings() {
    return Screen.withMenuBindings;
  }
  getCurrentScreen() {
    return this.currentScreen;
  }
  getIsUserInputMode() {
    return this.isUserInputMode;
  }
  setIsUserInputMode(mode: boolean) {
    this.isUserInputMode = mode;
  }
  toggleShowBindings() {
    this.isShowHelp = !this.isShowHelp;
  }
  async showMainScreen(currentMenu: number, currentSubMenu: number) {
    const _todos: any = await this.server.getTodos();

    if(this.currentScreen !== 'SUBTODO') this.currentScreen = 'MAIN_SCREEN';
    clear();
    if(_todos?.length) {
      let todos = _todos.filter((item: todoTypeS) => !item.parentTodoId);
      const subTodos = _todos.filter((item: todoTypeS) => item.parentTodoId);
      todos = todos.map((item: todoTypeS) => {
        const getSubTodo = subTodos.filter((sItem: todoTypeS) => sItem.parentTodoId === item.id);
        return {
          ...item,
          subTodo: getSubTodo?.length ? getSubTodo : []
        }
      });

      todos.map((item: any, i: number) => {
        const isDone = item.isDone  ? '[x]' : '[ ]';
        let logStr = isDone+' '+item.todo;
        if(currentMenu === i) {
          log(this.currentScreen === 'SUBTODO' ? logStr : chalk.green(logStr));
          if(item.subTodo?.length) {
            item.subTodo.map((subItem: subTodoType, i: number) => {
              const isDone = subItem.isDone ? '[x]' : '[ ]';
              let logStr = isDone+' '+subItem.todo;
              if(currentSubMenu === i && this.currentScreen === 'SUBTODO') {
                log('   '+chalk.green(logStr));
                return;
              }
              log('   '+logStr);
            });
          }
          return;
        }
        log(logStr);
        if(item.subTodo?.length) {
          item.subTodo.map((subItem: subTodoType, i:number) => {
            const isDone = subItem.isDone ? '[x]' : '[ ]';
            const logStr = isDone+' '+subItem.todo;
            log('   '+logStr);
          });
        }
      });
    } else {
      log(chalk.red("Nothing todo here...."));
    }
    const commandStyle = (str: string) => chalk.bgWhite(chalk.black(str));

    log(`\n\n${commandStyle('[Shift+h]')} Help\n`);

    if(this.isShowHelp) {
      log(`Ctrl+\n`);
      let timerDisplayCommands: string = '----------TIMER----------\n';
      timerDisplayCommands+= `${commandStyle('[s]')} Toggle focus\n`;
      timerDisplayCommands += `${commandStyle('[z]')} Toggle Break\n`;
      timerDisplayCommands += `${commandStyle('[q]')} Stop\n`;
      timerDisplayCommands += `${commandStyle('[o]')} Set focus time\n`;
      timerDisplayCommands += `${commandStyle('[p]')} Set break time`;

      let todoDisplayCommands = '\n----------TODO-----------\n';
      todoDisplayCommands += `${commandStyle('[a]')} Add\n`;
      todoDisplayCommands += `${commandStyle('[f]')} Add Subtask\n`;
      todoDisplayCommands += `${commandStyle('[e]')} Edit\n`;
      todoDisplayCommands += `${commandStyle('[d]')} Delete\n`;
      todoDisplayCommands += `${commandStyle('[space]')} Toggle Finish\n`;

      log(timerDisplayCommands+todoDisplayCommands);
      log(`\n${commandStyle('[x]')} Exit\n`); 
    }

  }
  private onUserInput(input: string, keyName: string, type: string, currentTodo: string = 'Enter todo') {
    if(Screen.validUserInput.includes(input) ||
      Screen.validSpecialChar.includes(input)
    ) this.userInput.push(input);
    if(keyName === 'backspace') {
      this.userInput.pop();
    }
    clear();
    let title: string = 'Enter todo';
    if(type === 'addsub') {
      title = 'Enter sub todo for: '+currentTodo;
    }
    if(type === 'edit') {
      title = 'Editing: '+currentTodo;
    }
    if(type === 'setFocusTime' || type === 'setBreakTime') {
      title = `Set focus time: \ncurrent: ${currentTodo}mins`;
      if(!+input && +input != 0 && this.userInput?.length) {
        title += chalk.red('\nInvalid input');
        this.userInput.pop();
      }
    }
    log(title);
    log('> ', this.userInput.join(''));
  }
  onSetFocusTime(input: string, keyName: string, currentTime: string) {
    this.onUserInput(input, keyName, 'setFocusTime', currentTime);
  }
  onSetBreakTime(input: string, keyName: string, currentTime: string) {
    this.onUserInput(input, keyName, 'setBreakTime', currentTime);
  }
  onAddTodo(input: string, keyName: string) {
    this.onUserInput(input, keyName, 'add');
  }
  onAddSubTodo(input: string, keyName: string, currentTodo: string) {
    this.onUserInput(input, keyName, 'addsub', currentTodo);
  }
  onEditTodo(input: string, keyName: string, currentTodo: string) {
    this.onUserInput(input, keyName, 'edit', currentTodo);
  }
  onEditSubTodo(input: string, keyName: string, currentTodo: string) {
    this.onUserInput(input, keyName, 'edit', currentTodo);
  }
  onDeleteTodo(todo: string) {
    clear();
    log(`Are you sure you want to delete ${todo}?`);
    log('Press "y" to delete or "n" to cancel: ');
  }
  getInputValue() {
    return this.userInput.join('');
  }
  clearUserInputValue() {
    this.userInput = [];
  }
}

export default Screen;
