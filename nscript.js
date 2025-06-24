// 1) ClockDisplay: keeps the current time updated
class ClockDisplay {
  constructor(selector) {
    this.el = document.querySelector(selector);
    if (!this.el) throw new Error(`No element matches "${selector}"`);
    this.start();
  }

  start() {
    this.update();
    this._interval = setInterval(() => this.update(), 1000);
  }

  update() {
    const now = new Date().toLocaleTimeString();
    this.el.textContent = `Time: ${now}`;
  }

  stop() {
    clearInterval(this._interval);
  }
}

// 2) Timer: encapsulates one countdown instance
class Timer {
  constructor(name, durationStr, container) {
    this.name = name;
    this.originalDuration = durationStr;
    this.remaining = this._parseDuration(durationStr);
    this.container = container;
    this.interval = null;
    this.isfull = false;
    this._createDOM();
    this._bindEvents();
    this._updateDisplay();
  }

  _parseDuration(str) {
    const [h, m, s] = str.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }

  _formatTime(sec) {
    const hh = String(Math.floor(sec / 3600)).padStart(2, '0');
    const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  _createDOM() {
    this.el = document.createElement('div');
    this.el.className = 'clock';
    this.el.innerHTML = `
            <div class="header">
                <p>${this.name}</p>
                <div class="headerBtns">
                    <button class="headerBtn edit">edit</button>
                    <button class="headerBtn full">full</button>
                </div>
            </div>
            <div class="timer">
                <div class="time">${this.originalDuration}</div>
            </div>
            <div class="control">
                <button class="btn reset" style="display:none;">Reset</button>
                <button class="btn stop" style="display:none;">Stop</button>
                <button class="btn start">Start</button>
            </div>
            <audio class="alarm" loop>
                <source src="Sound1.mp3" type="audio/mp3">
            </audio>
    `;
    this.container.appendChild(this.el);

    this.timeEl   = this.el.querySelector('.time');
    this.startBtn = this.el.querySelector('.start');
    this.stopBtn  = this.el.querySelector('.stop');
    this.resetBtn = this.el.querySelector('.reset');
    this.audio    = this.el.querySelector('.alarm');
    this.editBtn  = this.el.querySelector('.edit');
    this.fullBtn  = this.el.querySelector('.full');
  }

  _bindEvents() {
    this.startBtn.addEventListener('click', () => this.start());
    this.stopBtn. addEventListener('click', () => this.stop());
    this.resetBtn.addEventListener('click', () => this.reset());
    this.editBtn. addEventListener('click',()=> this.edit());
    this.fullBtn. addEventListener('click',()=> this.full());
  }

  _updateDisplay() {
    this.timeEl.textContent = this._formatTime(this.remaining);
  }

  start() {
    if (this.interval) return;
    this.startBtn.style.display = 'none';
    this.stopBtn.style.display  = 'inline-block';
    this.resetBtn.style.display = 'inline-block';
    
    this.interval = setInterval(() => {
      if (this.remaining <= 0) {
        this.stopBtn.style.display  =  'none';
        this.audio.play();
        return;
      }
      this.remaining--;
      this._updateDisplay();
    }, 1000);
  }

  stop() {
    clearInterval(this.interval);
    this.interval = null;
    this.startBtn.textContent = 'Resume';
    this.startBtn.style.display = 'inline-block';
    this.stopBtn.style.display  = 'none';
  }

  reset() {
    this.stop();
    this.remaining = this._parseDuration(this.originalDuration);
    this.startBtn.textContent = 'Start';
    this.resetBtn.style.display = 'none';
    this.audio.pause();
    this.audio.currentTime = 0;
    this._updateDisplay();
  }

  edit(){
    if (this.interval) return;
      const overlayEl = document.createElement('div');
      const windowEl  = document.createElement('div');
      overlayEl.className = 'overlay';
      windowEl.className  = 'board';
      windowEl.innerHTML=`
        <div class="Eheader">
            <p>Edit Timer</p>
            <button class="EheaderBtn deleteBtn">delete</button>
        </div>
        <div contenteditable="true" class="time timing">${this.timeEl.textContent}</div>
        <input class="boardInput" type="text" placeholder="timer_name" maxlength="15" minlength="1" value="${this.name}">
        <div class="boardBtns">
            <button class="boardBtn saveBtn">Save</button>
            <button class="boardBtn cancelBtn">Cancel</button>
        </div>
        `;

      document.body.appendChild(windowEl);
      document.body.appendChild(overlayEl);          
  
      const editSaveBtn   = windowEl.querySelector('.saveBtn');
      const editCancelBtn = windowEl.querySelector('.cancelBtn');
      const editDeleteBtn = windowEl.querySelector('.deleteBtn');

      editSaveBtn.addEventListener('click',() => {
        const newDuration   = windowEl.querySelector('.timing').textContent;
        const newName        = windowEl.querySelector('.boardInput').value || 'timer_name';
        this.remaining = this._parseDuration(newDuration);
        this.originalDuration = newDuration;
        this._updateDisplay();
        this.el.querySelector('.header p').textContent = newName;
        windowEl.remove();
        overlayEl.remove();
      });

      editCancelBtn.addEventListener('click',()=>{
        windowEl.remove();
        overlayEl.remove();
      });
      
      editDeleteBtn.addEventListener('click',()=>{
        this.el.remove();
        windowEl.remove();
        overlayEl.remove();
      });
    }

  full(){
    if (!this.isfull) {
      const layerEl = document.createElement('div');
      layerEl.classList.add("layer");
      document.body.append(layerEl);
      this.el.classList.add("fullscreen");
      this.el.classList.remove("clock");
      this.fullBtn.textContent = 'fit';
      this.isfull = true;
    } else {
      this.fullBtn.textContent = 'full';
      this.el.classList.remove("fullscreen");
      this.el.classList.add("clock");
      const layer = document.querySelector(".layer");
      if (layer) layer.remove();
      this.isfull = false;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // initialize live clock
  new ClockDisplay('#current-time');

  // prepare modal elements
  const addEl     = document.querySelector('.add');
  const overlayEl = document.createElement('div');
  const windowEl  = document.createElement('div');
  overlayEl.className = 'overlay';
  windowEl.className  = 'board';

  addEl.addEventListener('click', () => {
    // build modal HTML
    windowEl.innerHTML = `
      <p>Add Timer</p>
      <div class="time timing">00:00:00</div>
      <input class="boardInput" type="text" placeholder="timer_name" maxlength="15" minlength="1">
      <div class="board-section">
        <button class="boardBtn ready-option">ready</button>
        <button class="boardBtn custom-option">custom</button>
      </div>
      <div class="board-options">
        <button class="board-option long">01:30:00</button>
        <button class="board-option pomodoro">00:25:00</button>
        <button class="board-option short">00:15:00</button>
      </div>
      <div class="custom-options" style="display:none;">
        <div class="custom-time">
          <div contenteditable="true" class="clocking">00:00:00</div>
        </div>
      </div>
      <div class="board-section">
        <button class="boardBtn saveBtn">Save</button>
        <button class="boardBtn cancelBtn">Cancel</button>
      </div>
    `;
    document.body.append(overlayEl, windowEl);

    // cache modal elements
    const timingDisplay = windowEl.querySelector('.timing');
    const boardInput    = windowEl.querySelector('.boardInput');
    const saveEl        = windowEl.querySelector('.saveBtn');
    const cancelEl      = windowEl.querySelector('.cancelBtn');
    const readyEl       = windowEl.querySelector('.ready-option');
    const customEl      = windowEl.querySelector('.custom-option');
    const optsEl        = windowEl.querySelector('.board-options');
    const customOptsEl  = windowEl.querySelector('.custom-options');
    const presetBtns    = windowEl.querySelectorAll('.board-option');
    const clockingEl    = windowEl.querySelector('.clocking');

    readyEl.addEventListener('click', () => {
      optsEl.style.display = 'grid';
      customOptsEl.style.display = 'none';
      readyEl.style.display = 'none';
      customEl.style.display = 'inline-block';

    });
    customEl.addEventListener('click', () => {
      optsEl      .style.display = 'none';
      customEl    .style.display = 'none';
      customOptsEl.style.display = 'block';
      readyEl     .style.display = 'block';
    });

    // presets set timing
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        timingDisplay.textContent = btn.textContent;
      });
    });

    // custom input updates timing
    clockingEl.addEventListener('input', () => {
      timingDisplay.textContent = clockingEl.textContent;
    });

    // cancel: just close modal
    cancelEl.addEventListener('click', () => {
      overlayEl.remove();
      windowEl.remove();
    });

    // save: create a new Timer
    saveEl.addEventListener('click', () => {
      overlayEl.remove();
      windowEl.remove();

      const name     = boardInput.value.trim() || 'timer_name';
      const duration = timingDisplay.textContent;
      const group    = document.querySelector('.group');

      new Timer(name, duration, group);
    });
  });
});
