//@ts-ignore
import cfonts from 'cfonts';

class Timer {
  private timerCount: number = 0;
  private isTimerStarted: boolean = false;
  private isTimerStop: boolean = true;
  focusTimerCount: number;
  breakTimerCount: number;

  constructor(
    focusTimerCount: number,
    breakTimerCount: number
  ){
    this.focusTimerCount = focusTimerCount;
    this.breakTimerCount = breakTimerCount;
  }

  startFocusTimer() {
    this.timerCount = this.focusTimerCount;
    this.isTimerStarted = true;
    this.isTimerStop = false;
  }
  startBreakTimer() {
    this.timerCount = this.breakTimerCount;
    this.isTimerStarted = true;
    this.isTimerStop = false;
  }
  stopTimer() {
    this.timerCount = 0;
    this.isTimerStarted = false;
    this.isTimerStop = true;
  }
  timerDisplay(time: number) {
    const h = Math.floor(time / 3600).toString().padStart(2,'0'),
        m = Math.floor(time % 3600 / 60).toString().padStart(2,'0'),
        s = Math.floor(time % 60).toString().padStart(2,'0');
      
    const timeStr = h + ':' + m + ':' + s;

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
}

export default Timer;
