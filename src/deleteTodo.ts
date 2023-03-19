import chalk from 'chalk';
import { Todos } from './types.js';

const log = console.log;
const clear = console.clear;

function deleteTodo(todos: Todos[], currentSelection: number, selectedTodo: null | number, confirmation: string) : { todos: Todos[], isExit: boolean } {
  if(selectedTodo !== null) {
    clear();
    log(`Are you sure you want to delete ${todos[selectedTodo].label}?`);
    log('Press "y" to delete or "n" to cancel: ');

    const isConfirmed = confirmation === 'y' || confirmation === 'Y';
    const isNo = confirmation === 'n' || confirmation === 'N';

    return {
      todos: isConfirmed ? todos.filter((todo, index) => index !== selectedTodo) : todos,
      isExit: isConfirmed || isNo
    };
  }

  clear();
  log('Select todo');
  todos.map((todo, currIndex) => {
    const itemNum = currIndex + 1;
    if(currIndex === currentSelection) {
      log(chalk.green(itemNum + '. ' + todo));
      return;
    }
    log(itemNum + '. ' + todo);
  });
  log('\nPress escape to cancel...');

  return {
    todos,
    isExit: false
  };
}

export default deleteTodo;
