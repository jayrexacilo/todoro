import { Todos } from './types.js';
const log = console.log;
const clear = console.clear;

const validUserInput: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
const validSpecialChar: string = `~!@#$^&()_+={}[]|\/:;"'<,.`;

let userInput: string[] = [];

function addTodo(input: string, name: string, todos: Todos[]) : {todos: Todos[], isExit: boolean} {
  if(validUserInput.includes(input) ||
    validSpecialChar.includes(input)
  ) userInput.push(input);

  if(name === 'return') {
    todos.push({
      id: Date.now(),
      label: userInput.join(''),
      isDone: false
    });
    userInput = [];
    return {todos, isExit: true};
  }
  if(name === 'backspace') {
    userInput.pop();
  }
  clear();
  log('Enter todo');
  log('> ', userInput.join(''));

  return {
    todos,
    isExit: false
  };
}

export default addTodo;
