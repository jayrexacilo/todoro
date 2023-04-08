import { Todo } from './Todo.js';
import Menu from './Menu.js';
import Screen from './Screen.js';

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

  isSubTodoDown(key: any, currScreen: string, currentMenuSelection: number) {
    if(key && key.name == 'j' && currScreen !== 'SUBTODO') {
      if(currentMenuSelection === (this.todos.getTodoLen() - 1) && this.todosMenu.includes(currScreen)) {
        this.menu.setCurrentMenu(0);
      } else {
        this.menu.setCurrentMenu(this.menu.getCurrentMenu() + 1);
      }
    }
  }

  isSubTodoUp(key: any, currScreen: string, currentMenuSelection: number) {
    if(key && key.name == 'k' && currScreen !== 'SUBTODO') {
      this.menu.setCurrentSubMenu(0);
      if(currentMenuSelection === 0) {
        switch(currScreen) {
          case 'EDIT_TODO':
          case 'DELETE_TODO':
          case 'MAIN_SCREEN':
            this.menu.setCurrentMenu(this.todos.getTodoLen() - 1);
            break;
        }
      } else {
        this.menu.setCurrentMenu(this.menu.getCurrentMenu() - 1);
      }
    }
  }

  isTodoUpDown(key: any, currScreen: string) {
    if(currScreen === 'SUBTODO') {
      const currentSubMenuSelection: number = this.menu.getCurrentSubMenu();
      const currentTodo = this.todos.getTodoByIdx(this.menu.getCurrentMenu());
      const currentSubTodo = currentTodo.subTodo;
      if(key && key.name == 'j') {
        if(currentSubMenuSelection === (currentSubTodo.length - 1) && this.todosMenu.includes(currScreen)) {
          this.menu.setCurrentSubMenu(0);
        } else {
          this.menu.setCurrentSubMenu(this.menu.getCurrentSubMenu() + 1);
        }
      }
      if(key && key.name == 'k') {
        if(currentSubMenuSelection === 0) {
          this.menu.setCurrentSubMenu(currentSubTodo.length - 1);
        } else {
          this.menu.setCurrentSubMenu(this.menu.getCurrentSubMenu() - 1);
        }
      }
    }
  }
  isTriggered() {
    return this.screen.getMenuWithBindings().includes(this.screen.getCurrentScreen()) && !this.screen.getIsUserInputMode() && this.todos.getTodoLen();
  }
}

export default TodoListMovementsManager;
