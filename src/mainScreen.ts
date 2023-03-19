import chalk from 'chalk';

const clear = console.clear;
const log = console.log;

function mainScreen(todos: string[], currTodoSelection: number): void {
  clear();
  if(todos?.length) {
    todos.map((item, i) => {
      const iNum = i+1;
      const logStr = iNum+' .'+item;
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
