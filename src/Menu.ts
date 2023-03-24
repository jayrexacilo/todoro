class Menu {
  currentMenu: number;
  currentSubMenu: number = 0;
  menuType: string = 'mainmenu';
  constructor(currentMenu: number) {
    this.currentMenu = currentMenu;
  }
  getCurrentMenu() {
    return this.currentMenu;
  }
  getCurrentSubMenu() {
    return this.currentSubMenu;
  }
  setCurrentSubMenu(idx: number) {
    this.currentSubMenu = idx;
  }
  setCurrentMenu(idx: number) {
    this.currentMenu = idx;
  }
}

export default Menu;
