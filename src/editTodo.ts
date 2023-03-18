import chalk from 'chalk';

const validUserInput: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
const validSpecialChar: string = `~!@#$^&()_+={}[]|\/:;"'<,.`;

let updatedTodo: string[] = [];

const log = console.log;
const clear = console.clear;

function editTodo(todos: string[], currSelection: number, selectedTodo: null | number, input: string, keyName: string): {todos: string[], isExit: boolean} {
  if(selectedTodo === null) {
    clear();
    log('Select todo');
    todos.map((todo, i) => {
      const iNum = i + 1;
      if(currSelection === i) {
        log(chalk.green(iNum + '. ' + todo));
        return;
      }
      log(iNum + '. ' + todo);
    });

    log('\nPress escape to cancel...');

    return {
      todos,
      isExit: false
    };
  }

  if((validUserInput.includes(input) ||
    validSpecialChar.includes(input)) && selectedTodo !== null
  ) updatedTodo.push(input);

  if(keyName === 'backspace' && selectedTodo !== null) {
    updatedTodo.pop();
  }

  if(keyName === 'return' && selectedTodo !== null && updatedTodo?.length) {
    clear();
    const newTodos: string[] = todos.map((todo, index) => {
      if(currSelection === index) {
        return updatedTodo.join('');
      }
      return todo;
    });
    updatedTodo = [];
    return {
      todos: newTodos,
      isExit: true
    }
  }

  if(selectedTodo !== null) {
    clear();
    log('Editing => ', todos[currSelection]);
    log('> ', updatedTodo.join(''));

    log('\nPress escape to cancel...');
  }
  return {
    todos,
    isExit: false
  };
}
export default editTodo;
