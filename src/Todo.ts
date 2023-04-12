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
  async updateTodo(todo: string, idx: number) {
    const getTodos = await this.server.getTodos();
    const currTodo = getTodos.filter((item: any) => !item.parentTodoId)[idx];
    this.server.updateTodoText(currTodo.id, todo);
  }
  async updateSubTodoText(todo: string, idx: number, subidx: number) {
    const getTodos = await this.server.getTodos();
    const currTodo = getTodos.filter((item: any) => !item.parentTodoId)[idx];
    const subTodos = getTodos.filter((item: any) => item.parentTodoId === currTodo.id);
    const currSubTodo = subTodos[subidx];
    this.server.updateTodoText(currSubTodo.id, todo);
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
      subTodos.map((item: any) => {
        this.server.updateTodo(item.id, isDone);
      });
    }
    this.server.updateTodo(currTodo.id, isDone);
  }
  async toggleSubTodoStatus(idx: number, subIdx: number) {
    const getTodos = await this.server.getTodos();
    const currentTodo = getTodos.filter((item: any) => !item.parentTodoId)[idx];
    const subTodos = getTodos.filter((item: any) => item.parentTodoId === currentTodo.id);
    const currSubTodo = subTodos[subIdx];
    this.server.updateTodo(currSubTodo.id, !currSubTodo.isDone);

    subTodos[subIdx].isDone = !currSubTodo.isDone;
    const isAllSubTodosDone = subTodos?.filter((item: any) => item.isDone).length === subTodos.length;
    this.server.updateTodo(currentTodo.id, isAllSubTodosDone);
  }
  async getTodoLen() {
    const getTodos = await this.server.getTodos();
    const todos = getTodos.filter((item: any) => !item.parentTodoId);
    return todos?.length || 0;
  }
}

export {
  Todo,
  subTodoType,
  todoType,
  todoTypeS
};
