import chalk from 'chalk';

const log = console.log;
const clear = console.clear;

function showTodos(todos: string[]): void {
  if(todos?.length) {
    log(chalk.red('====== Todo list ====='));
    todos.map((item, num) => {
      const itemNum = num + 1;
      log(itemNum+'. '+item);
    });
  }
  if(!todos?.length) log('No todos...');

  log('\nPress anything...');
}

export default showTodos;
