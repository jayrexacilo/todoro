import sqlite3 from 'sqlite3';

let sql;

type todoTypeS = {
  id: number,
  todo: string,
  isDone: boolean,
  parentTodoId: number
}

class Server {
  private sqlStr: string = `INSERT INTO todos (id, todo, isDone, parentTodoId) VALUES (?,?,?,?)`;
  private db;
  constructor() {
    this.db = new sqlite3.Database("./todoro.db", sqlite3.OPEN_READWRITE, (err: any) => {
      if(err) return console.log('Database error ', err);
    });
  }
  
  addTodo(todo: string) {
    this.db.run(this.sqlStr, [null, todo, false, null], err => {
      if(err) return console.log(`INSERT FAILED! `, err);
    });
  }
  updateTodoText(todoId: number, text: string) {
    const updateSql = `UPDATE todos SET todo="${text}" WHERE id=?`;
    return new Promise((resolve, reject) => {
      this.db.run(updateSql, [todoId], err => {
        if(err) return reject(err);
        resolve(1);
      });
    });
  }
  updateTodo(todoId: number, isDone: boolean) {
    const updateSql = `UPDATE todos SET isDone=${isDone} WHERE id=?`;
    return new Promise((resolve, reject) => {
      this.db.run(updateSql, [todoId], err => {
        if(err) return reject(err);
        resolve(1);
      });
    });
  }
  deleteTodo(todoId: number) {
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM todos WHERE id=? OR parentTodoId=?`, [todoId, todoId], err => {
        if(err) return reject(err);
        resolve(1);
      });
    });
  }
  addSubTodo(todo: string, parentTodoId: number) {
    this.db.run(this.sqlStr, [null, todo, false, parentTodoId], err => {
      if(err) return console.log(`INSERT FAILED! `, err);
    });
  }
  getTodos(): Promise<todoTypeS[]> {
    const $db = this.db;
    return new Promise((resolve, reject) => {
      $db.all('SELECT * FROM todos', [], (err, rows: todoTypeS[]) => {
        if(err) reject(err);
        resolve(rows);
      });
    });
  }
  getSubTodos(): Promise<todoTypeS[]> {
    const $db = this.db;
    return new Promise((resolve, reject) => {
      $db.all('SELECT * FROM todos WHERE parentTodoId IS NOT NULL', [], (err, rows: todoTypeS[]) => {
        if(err) reject(err);
        resolve(rows);
      });
    });
  }
}

export default Server;
