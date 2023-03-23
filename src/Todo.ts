type subTodoType = {
  todo: string
  isDone: boolean,
}
type todoType = {
  todo: string
  isDone: boolean,
  subTodo: subTodoType[]
}

class Todo {
  private todos: todoType[];

  constructor(
    todos: todoType[]
  ) {
    this.todos = todos;
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
  }
  addSubTodo(todo: string, idx: number) {
    this.todos[idx].subTodo.push(this.todoFormat(todo, true));
  }
  deleteTodo(idx: number) {
    this.todos.splice(idx, 1);
  }
  updateTodo(todo: string, idx: number) {
    this.todos[idx].todo = todo;
  }
  getTodoByIdx(idx: number) {
    return this.todos[idx];
  }
  getTodos() {
    return this.todos;
  }
  toggleTodoStatus(idx: number) {
    const currTodo = this.todos[idx];
    if(currTodo.subTodo?.length) {
      currTodo.subTodo = currTodo.subTodo.map(item => ({...item,isDone: !currTodo.isDone}));
    }
    currTodo.isDone = !currTodo.isDone;
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
  todoType
};
