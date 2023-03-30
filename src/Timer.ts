//@ts-ignore
import cfonts from 'cfonts';
import chalk from 'chalk';
//@ts-ignore
import notifier from 'node-notifier';
//@ts-ignore
import sound from 'sound-play';
import { exec } from "child_process";
import process, { cwd } from "process";

const clear = console.clear;
const log = console.log;

class Timer {
  private isTimerStarted: boolean = false;
  private isTimerStop: boolean = true;
  timeout: ReturnType<typeof setTimeout> | undefined;
  timerCount: number = 0;
  isTimerPaused: boolean = false;
  focusTimerCount: number;
  breakTimerCount: number;

  constructor(
    focusTimerCount: number = 1500,
    breakTimerCount: number = 300
  ){
    this.focusTimerCount = focusTimerCount;
    this.breakTimerCount = breakTimerCount
  }

  onStartTimer() {
    this.isTimerStarted = true;
    this.isTimerStop = false;
    this.isTimerPaused = false;
  }
  startFocusTimer() {
    this.onStartTimer();
  }
  startBreakTimer() {
    this.onStartTimer();
  }
  pauseTimer() {
    this.isTimerPaused = true;
  }
  stopTimer() {
    this.isTimerStarted = false;
    this.isTimerStop = true;
  }
  checkTimerStatus() {
    return {
      isTimerStarted: this.isTimerStarted,
      isTimerStop: this.isTimerStop,
      isTimerPaused: this.isTimerPaused
    }
  }
  timerDisplay(time: number, todo: string, type: string) {
    const cols = process.stdout.columns;
    const rows = process.stdout.rows;
    const h = Math.floor(time / 3600).toString().padStart(2,'0'),
        m = Math.floor(time % 3600 / 60).toString().padStart(2,'0'),
        s = Math.floor(time % 60).toString().padStart(2,'0');
      
    const timeStr = m + ':' + s;
    const addSpacerStr: any = (n: number) => !+n || n <= 0 ? '' : Array.apply(null, Array(Math.ceil(n))).map(i => " ").join('');

    clear();
    if(cols < 50 || rows < 50) {
      log("\n"+addSpacerStr((cols / 2) - timeStr.toString().length)+timeStr.toString()+"\n");
    } else {
      cfonts.say(timeStr.toString(), {
        font: 'block',              // define the font face
        align: 'center',              // define text alignment
        colors: ['system'],         // define all colors
        background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
        letterSpacing: 1,           // define letter spacing
        lineHeight: 1,              // define the line height
        space: true,                // define if the output text should have empty lines on top and on the bottom
        maxLength: '0',             // define how many character can be on one line
        gradient: false,            // define your two gradient colors
        independentGradient: false, // define if you want to recalculate the gradient for each new line
        transitionGradient: false,  // define if this is a transition between colors directly
        env: 'node'                 // define the environment cfonts is being executed in
      });
    }

    const titleSpaceStr = !+cols || !type?.length ? '' : addSpacerStr((cols / 2) - type.length);
    const todoSpaceStr = !+cols || !todo?.length ? '' : addSpacerStr((cols / 2) - todo.length);

    log(titleSpaceStr+chalk.red(type.toUpperCase())+"\n");
    if(type === 'focus') log(todoSpaceStr+chalk.green(todo));

    this.timerCount = time - 1;

    if(this.timerCount >= 0 &&
      this.isTimerStarted &&
      (!this.isTimerStop || !this.isTimerPaused)
    ) {
      this.timeout = setTimeout(() => this.timerDisplay(this.timerCount, todo, type), 1000);
    }

    if(this.timerCount < 0) {
      notifier.notify({
        title: type === 'focus' ? 'Focus is done!' : 'Break is done!',
        message: type === 'focus' ? 'Take a break now.' : 'Time to work!'
      });
      exec(`mpv --audio-display=no ${cwd()}/src/timer-alarm.wav`);
      setTimeout(() => {
        process.stdin.emit('keypress', null, { name: 'q', ctrl: true, meta: false });
      }, 2000);
    }
  }
}

export default Timer;
