import { Todo } from './Todo.js';
import Menu from './Menu.js';
import Screen from './Screen.js';
import Server from './Server.js';

class TodoListMovementsManager {
  private todos: Todo;
  private menu: Menu;
  private screen: Screen;
  private todosMenu: string[];

  constructor(todos: Todo, menu: Menu, screen: Screen, todosMenu: string[]) {
    this.todos = todos;
    this.menu = menu;
    this.screen = screen;
    this.todosMenu = todosMenu;
  }

  async isTodoUpDown(key: any, currScreen: string, currentMenuSelection: number, todosLen: number) {
    if(currScreen !== 'SUBTODO') {
      if(key && key.name == 'j') {
        if(currentMenuSelection === (todosLen - 1) && this.todosMenu.includes(currScreen)) {
          this.menu.setCurrentMenu(0);
        } else {
          this.menu.setCurrentMenu(this.menu.getCurrentMenu() + 1);
        }
      }
      if(key && key.name == 'k') {
        this.menu.setCurrentSubMenu(0);
        if(currentMenuSelection === 0) {
          switch(currScreen) {
            case 'EDIT_TODO':
            case 'DELETE_TODO':
            case 'MAIN_SCREEN':
              this.menu.setCurrentMenu(todosLen - 1);
              break;
          }
        } else {
          this.menu.setCurrentMenu(this.menu.getCurrentMenu() - 1);
        }
      }
    }
  }

  async isSubTodoUpDown(key: any, currScreen: string, currentSubMenuSelection: number, todosLen: number) {
    if(currScreen === 'SUBTODO') {
      if(key && key.name == 'j') {
        if(currentSubMenuSelection === (todosLen - 1) && this.todosMenu.includes(currScreen)) {
          this.menu.setCurrentSubMenu(0);
        } else {
          this.menu.setCurrentSubMenu(currentSubMenuSelection + 1);
        }
      }
      if(key && key.name == 'k') {
        if(currentSubMenuSelection === 0) {
          this.menu.setCurrentSubMenu(todosLen - 1);
        } else {
          this.menu.setCurrentSubMenu(currentSubMenuSelection - 1);
        }
      }
    }
  }

  async isMenuMoving(key: any, currScreen: string, currentMenuSelection: number, currentSubMenuSelection: number) {
    const server = new Server();
    const getTodos: any = await server.getTodos();
    const todos = getTodos.filter((item: any) => !item.parentTodoId);
    const todosLen: any = todos?.length ? todos.length : 0;
    const currentTodo = todos[currentMenuSelection];
    const subTodos = getTodos?.filter((item: any) => item.parentTodoId === currentTodo.id);
    const subTodosLen = subTodos.length;

    this.screen.setCurrentScreen(currScreen);
    this.isSubTodoUpDown(key, currScreen, currentSubMenuSelection, subTodosLen);
    this.isTodoUpDown(key, currScreen, currentMenuSelection, todosLen);
  }
  async isTriggered() {
    const server = new Server();
    const getTodos: any = await server.getTodos();
    const todos = getTodos.filter((item: any) => !item.parentTodoId);
    const todosLen: any = todos?.length ? todos.length : 0;
    return this.screen.getMenuWithBindings().includes(this.screen.getCurrentScreen()) && !this.screen.getIsUserInputMode() && todosLen;
  }
}

export default TodoListMovementsManager;
