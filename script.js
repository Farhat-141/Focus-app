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
  constructor(name, durationStr, container, id) {
    this.id = id || Date.now();
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
    this.el.dataset.id = this.id; // Set the timer id for selection/deletion
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
        let saved = JSON.parse(localStorage.getItem('saved') || '[]');
        saved = saved.map(item => {
        if (item.id === this.id) {
        // preserve id, update other fields
        return { id: this.id, name: this.name, duration: this.originalDuration };
      }
      return item;
    });
    localStorage.setItem('saved', JSON.stringify(saved));
      });

      editCancelBtn.addEventListener('click',()=>{
        windowEl.remove();
        overlayEl.remove();
      });
      
      editDeleteBtn.addEventListener('click',()=>{
        let saved = JSON.parse(localStorage.getItem('saved') || '[]');
        saved = saved.filter(item => item.id !== this.id);
        localStorage.setItem('saved', JSON.stringify(saved));

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

class TimerModal{
  constructor(addSelector, groupSelector) {
    this.addBtn    = document.querySelector(addSelector);
    this.group     = document.querySelector(groupSelector);
    this.overlayEl = document.createElement('div');
    this.windowEl  = document.createElement('div');
    this.windowEl.className  = 'board';
    this.overlayEl.className = 'overlay';
    this._bindAdd();
  }

  _bindAdd() {
    this.addBtn.addEventListener('click', () => this.show());
  }

  show() {
    // build modal HTML (same as before)
    this.windowEl.innerHTML = `
      <p>Add Timer</p>
      <div class="time timing">00:00:00</div>
      <input class="boardInput" placeholder="timer_name" maxlength="15">
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
        <div contenteditable="true" class="clocking">00:00:00</div>
      </div>
      <div class="board-section">
        <button class="boardBtn saveBtn">Save</button>
        <button class="boardBtn cancelBtn">Cancel</button>
      </div>`;
    document.body.append(this.overlayEl, this.windowEl);
    this._bindModalEvents();
  }

  _bindModalEvents() {
    const td     = this.windowEl.querySelector('.timing');
    const inp    = this.windowEl.querySelector('.boardInput');
    const save   = this.windowEl.querySelector('.saveBtn');
    const cancel = this.windowEl.querySelector('.cancelBtn');
    const ready  = this.windowEl.querySelector('.ready-option');
    const custom = this.windowEl.querySelector('.custom-option');
    const opts   = this.windowEl.querySelector('.board-options');
    const cOpts  = this.windowEl.querySelector('.custom-options');
    const presets = this.windowEl.querySelectorAll('.board-option');
    const clkEl   = this.windowEl.querySelector('.clocking');

    ready.addEventListener('click', () => {
      opts.style.display = 'grid';
      cOpts.style.display = 'none';
      custom.style.display = 'block';
      ready.style.display = 'none';
    });
    custom.addEventListener('click', () => {
      opts.style.display = 'none';
      custom.style.display = 'none';
      ready.style.display = 'block';
      cOpts.style.display = 'block';
    });

    presets.forEach(b => b.addEventListener('click', () => td.textContent = b.textContent));
    clkEl.addEventListener('input', () => td.textContent = clkEl.textContent);

    cancel.addEventListener('click', () => this._hide());

    save.addEventListener('click', () => {
      const name     = inp.value.trim() || 'timer_name';
      const duration = td.textContent;
      const id = Date.now();
      const element  = {
        id,
        name,
        duration 
      };

      let savedTimers;
      try {
        const raw = localStorage.getItem('saved');
        savedTimers = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
      } catch {
        savedTimers = [];
      }

      savedTimers.push(element);
      localStorage.setItem('saved', JSON.stringify(savedTimers));

      new Timer(name, duration, this.group);
      this._hide();
});
  }

  _hide() {
    this.windowEl.remove();
    this.overlayEl.remove();
  }
}

class TimerSelect {
  constructor(selector, groupSelector) {
    this.clearBtn = document.querySelector(selector);
    this.group = document.querySelector(groupSelector);
    this.selectionActive = false; 
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this._bindClear();
  }

  _bindClear() {
    this.clearBtn.addEventListener('click', () => {
      if (!this.selectionActive) {
        this.selecting();
        
      } else {
        this.restore();
      }
    });
  }

  handleDeleteClick(e) {
    const el = e.currentTarget;
    const answer = confirm('Are you sure you want to delete this timer?');
    if (answer) {
      let timerId = el.dataset.id;
      let saved = JSON.parse(localStorage.getItem('saved') || '[]');
      saved = saved.filter(item => String(item.id) !== String(timerId));
      localStorage.setItem('saved', JSON.stringify(saved));
      el.remove();
    } else {
      alert('Clear operation cancelled');
    }
  }

  selecting() {
    const timerEls = this.group.querySelectorAll('.clock');
    this.clearBtn.src = "check-icon.png";
    this.clearBtn.className = "confirm"; 
    this.selectionActive = true;         

    timerEls.forEach((el) => {
      el.classList.add('selectionAffect');
      const cover = document.createElement('div');
      cover.className = 'selectionAffectCover';
      el.appendChild(cover);
      el.removeEventListener('click', this.handleDeleteClick); // Avoid stacking
      el.addEventListener('click', this.handleDeleteClick);
    });
  }


  
  restore() {
    const timerEls = this.group.querySelectorAll('.clock');
    timerEls.forEach((el) => {
      el.classList.remove('selectionAffect');
      const cover = el.querySelector('.selectionAffectCover');
      if (cover) cover.remove();
      el.removeEventListener('click', this.handleDeleteClick);
    });

    this.clearBtn.src = "clear-icon.png";
    this.clearBtn.className = "clear";
    this.selectionActive = false; 
  }
}



window.addEventListener('DOMContentLoaded', () => {
  new ClockDisplay('#current-time'); 
  new TimerModal('.add', '.group'); 
  new TimerSelect('.clear','.group'); 

  const savedTimers = JSON.parse(localStorage.getItem('saved'));
  savedTimers.forEach(el => {
    new Timer(el.name,el.duration,document.querySelector('.group'),el.id)
  });

});
