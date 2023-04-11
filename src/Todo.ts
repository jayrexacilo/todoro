import Server from './Server.js';
import sqlite3 from 'sqlite3';

type subTodoType = {
  todo: string
  isDone: boolean,
}
type todoType = {
  todo: string
  isDone: boolean,
  subTodo: subTodoType[]
}

type todoTypeS = {
  id: number,
  todo: string,
  isDone: boolean,
  parentTodoId: number
}

class Todo {
  private todos: todoType[];
  private server;

  constructor(
    todos: todoType[]
  ) {
    this.todos = todos;
    this.server = new Server();
  }

  todoFormat(todo: string, isSub: boolean): any {
    const format = {
      todo,
      isDone: false,
    };
    return isSub ? format : {...format, subTodo: []};
  }
  addTodo(todo: string) {
    const todoData: todoType = this.todoFormat(todo, false);
    this.todos.push(todoData);
    this.server.addTodo(todo);
  }
  addSubTodo(todo: string, parentTodoId: number) {
    this.server.addSubTodo(todo, parentTodoId);
  }
  async deleteTodo(idx: number) {
    const getTodos = await this.server.getTodos();
    const todo = getTodos.filter((item: any) => !item.parentTodoId)[idx];
    const deleteTodo = await this.server.deleteTodo(todo.id);
    return deleteTodo;
  }
  updateTodo(todo: string, idx: number) {
    this.todos[idx].todo = todo;
  }
  updateSubTodo(todo: string, idx: number, subidx: number) {
    this.todos[idx].subTodo[subidx].todo = todo;
  }
  async getTodoByIdx(idx: number): Promise<todoTypeS> {
    const todos: todoTypeS[] = await this.server.getTodos();
    const currTodo: todoTypeS = todos.filter((item: any) => !item.parentTodoId)[idx];
    return new Promise<todoTypeS>((resolve, reject) => {
      resolve(currTodo);
    });
  }
  async getServerTodos() {
    return await this.server.getTodos();
  }
  getTodos() {
    return this.todos;
  }
  async toggleTodoStatus(idx: number) {
    const getTodos = await this.server.getTodos();
    const currTodo = getTodos.filter((item: any) => !item.parentTodoId)[idx];
    const subTodos = getTodos.filter((item: any) => item.parentTodoId === currTodo.id);
    const isDone = !currTodo.isDone;
    if(subTodos?.length) {
      //currTodo.subTodo = currTodo.subTodo.map(item => ({...item,isDone: !currTodo.isDone}));
    }
    this.server.updateTodo(currTodo.id, isDone);
  }
  toggleSubTodoStatus(idx: number, subIdx: number) {
    this.todos[idx].isDone = false;
    this.todos[idx].subTodo[subIdx].isDone = !this.todos[idx].subTodo[subIdx].isDone;
    const isAllSubTodosDone = !this.todos[idx].subTodo.filter(i => !i.isDone).length;
    if(isAllSubTodosDone) this.todos[idx].isDone = true;
  }
  getTodoLen() {
    return this.todos?.length;
  }
}

export {
  Todo,
  subTodoType,
  todoType,
  todoTypeS
};
