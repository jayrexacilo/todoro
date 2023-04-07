import { Todo } from './Todo.js';
import Menu from './Menu.js';

class TodoListMovementsManager {
  isSubTodoDown(key: any, currScreen: string, currentMenuSelection: number, todosMenu: string[], todos: Todo, menu: Menu) {
    if(key && key.name == 'j' && currScreen !== 'SUBTODO') {
      if(currentMenuSelection === (todos.getTodoLen() - 1) && todosMenu.includes(currScreen)) {
        menu.setCurrentMenu(0);
      } else {
        menu.setCurrentMenu(menu.getCurrentMenu() + 1);
      }
    }
  }

  isSubTodoUp(key: any, currScreen: string, currentMenuSelection: number, todos: Todo, menu: Menu) {
    if(key && key.name == 'k' && currScreen !== 'SUBTODO') {
      menu.setCurrentSubMenu(0);
      if(currentMenuSelection === 0) {
        switch(currScreen) {
          case 'EDIT_TODO':
          case 'DELETE_TODO':
          case 'MAIN_SCREEN':
            menu.setCurrentMenu(todos.getTodoLen() - 1);
            break;
        }
      } else {
        menu.setCurrentMenu(menu.getCurrentMenu() - 1);
      }
    }
  }

  isTodoUpDown(key: any, currScreen: string, todosMenu: string[], todos: Todo, menu: Menu) {
    if(currScreen === 'SUBTODO') {
      const currentSubMenuSelection: number = menu.getCurrentSubMenu();
      const currentTodo = todos.getTodoByIdx(menu.getCurrentMenu());
      const currentSubTodo = currentTodo.subTodo;
      if(key && key.name == 'j') {
        if(currentSubMenuSelection === (currentSubTodo.length - 1) && todosMenu.includes(currScreen)) {
          menu.setCurrentSubMenu(0);
        } else {
          menu.setCurrentSubMenu(menu.getCurrentSubMenu() + 1);
        }
      }
      if(key && key.name == 'k') {
        if(currentSubMenuSelection === 0) {
          menu.setCurrentSubMenu(currentSubTodo.length - 1);
        } else {
          menu.setCurrentSubMenu(menu.getCurrentSubMenu() - 1);
        }
      }
    }
  }
}

export default TodoListMovementsManager;
