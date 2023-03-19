import chalk from 'chalk';
import { Todos } from './types.js';

const clear = console.clear;
const log = console.log;

function mainScreen(todos: Todos[], currTodoSelection: number): void {
  clear();
  if(todos?.length) {
    todos.map((item, i) => {
      const logStr = '[ ] .'+item.label;
      if(currTodoSelection === i) {
        log(chalk.green(logStr));
        return;
      }
      log(logStr);
    });
  } else {
    log(chalk.red("Nothing todo here...."));
  }
  const commandStyle = (str: string) => chalk.bgWhite(chalk.black(str));
  log("\nCtrl+");
  log(`${commandStyle('[s]')} Start timer     ${commandStyle('[a]')} Add      ${commandStyle('[e]')} Edit     ${commandStyle('[d]')} Delete     ${commandStyle('[x]')} Exit`);
}

export default mainScreen;
