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
    this.el.textContent = `${now}`;
  }
  stop() {
    clearInterval(this._interval);
  }
}

// Global registry to track timer instances
const timerRegistry = new Map();
// total musure by second

class Timer {
  constructor(name, durationStr, container, id) {
    this.id = id || Date.now();
    this.name = name;
    this.originalDuration = durationStr;
    this.remaining = this._parseDuration(durationStr);
    this.container = container;
    this.total = 1.5;
    this.interval = null;
    this.isfull = false;
    this._createDOM();
    this._bindEvents();
    this._updateDisplay();
    // Register this timer instance
    timerRegistry.set(this.id, this);
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
    this.el.dataset.id = this.id;
    this.el.innerHTML = `
      <div class="header">
        <p>${this.name}</p>
        <div class="headerBtns">
          <button class="headerBtn edit">edit</button>
          <button class="headerBtn full">full</button>
        </div>
      </div>
      <div class="timer">
        <svg class="progress-circle" viewBox="0 0 36 36">
          <path class="circle-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path class="circle-bar"
            stroke-dasharray="0, 100"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831" />
          <text x="18" y="20.35" class="circle-label">${this.originalDuration}</text>
        </svg>
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

    this.timeEl   = this.el.querySelector('.circle-label');
    this.startBtn = this.el.querySelector('.start');
    this.stopBtn  = this.el.querySelector('.stop');
    this.resetBtn = this.el.querySelector('.reset');
    this.audio    = this.el.querySelector('.alarm');
    this.editBtn  = this.el.querySelector('.edit');
    this.fullBtn  = this.el.querySelector('.full');
    this.progressBar = this.el.querySelector('.circle-bar');
  }

  _bindEvents() {
    this.startBtn.addEventListener('click', () => this.start());
    this.stopBtn. addEventListener('click', () => this.stop());
    this.resetBtn.addEventListener('click', () => this.reset());
    this.editBtn. addEventListener('click',()=> this.edit());
    this.fullBtn. addEventListener('click',()=> this.full());
  }

  _updateDisplay() {
    const formatted = this._formatTime(this.remaining);
    this.timeEl.textContent = formatted;    

    if (this.progressBar) {
      const percent = 100 * (this.remaining / this._parseDuration(this.originalDuration));
      this.progressBar.setAttribute('stroke-dasharray', `${percent}, 100`);
    }
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
      this.total++;
      document.getElementById('res').textContent = (this.total/60).toPrecision(2);
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

  destroy() {
    this.stop();
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
    // Remove from registry
    timerRegistry.delete(this.id);
  }

  edit(){
    if (this.interval) return;
      const overlayEl = document.createElement('div');
      const windowEl  = document.createElement('div');
      overlayEl.className = 'overlay';
      windowEl.className  = 'board';

      const [hh, mm, ss] = this.timeEl.textContent.split(':');

      windowEl.innerHTML=`
        <div class="Eheader">
            <p>Edit Timer</p>
            <button class="EheaderBtn deleteBtn">delete</button>
        </div>
        <div class="time timing">
          <span class="time-part" contenteditable="true">${hh}</span>:
          <span class="time-part" contenteditable="true">${mm}</span>:
          <span class="time-part" contenteditable="true">${ss}</span>
        </div>
        <input class="boardInput" type="text" placeholder="timer_name" maxlength="15" minlength="1" value="${this.name}">
        <div class="boardBtns">
            <button class="boardBtn saveBtn">Save</button>
            <button class="boardBtn cancelBtn">Cancel</button>
        </div>
        `;

      document.body.append(this.overlayEl, this.windowEl);

      const timeParts = windowEl.querySelectorAll('.time-part');

    timeParts.forEach(span => {
      span.addEventListener('keydown', (e) => {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
        if (
          !e.ctrlKey &&
          !e.metaKey &&
          !allowedKeys.includes(e.key) &&
          !/^\d$/.test(e.key)
        ) {
          e.preventDefault();
        }
      });

      span.addEventListener('input', () => {
        let text = span.textContent.replace(/\D/g, '');

        // Shift left if more than 2 digits
        if (text.length > 2) {
          text = text.slice(-2); // keep last 2 digits
        }

        span.textContent = text;

        // Move caret to end
        const range = document.createRange();
        range.selectNodeContents(span);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });

      span.addEventListener('paste', (e) => {
        e.preventDefault();
        const data = (e.clipboardData || window.clipboardData).getData('text');
        const digits = data.replace(/\D/g, '').slice(-2); // keep last 2 digits
        span.textContent = digits;
      });
    });



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

        // Properly destroy the timer instance
        this.destroy();
        windowEl.remove();
        overlayEl.remove();
        instruction();
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
    this.addBtn.addEventListener('click', () => this.show());+
    document.body.addEventListener('keypress', (e) => {
      if (e.key === '+') {
        this.show(); 
      }
    });
}

  show() {
    // build modal HTML (same as before)
    this.windowEl.innerHTML = `
      <p>Add Timer</p>
      <div class="time timing">
        <span class="time-part" contenteditable="true">00</span>:
        <span class="time-part" contenteditable="true">00</span>:
        <span class="time-part" contenteditable="true">00</span>
      </div>
      <input class="boardInput" placeholder="timer_name" maxlength="15">
      <div class="board-section">
        <button class="boardBtn ready-option">ready</button>
        <button class="boardBtn custom-option">custom</button>
      </div>
      <div class="board-options">
        <button class="board-option long">01: 30: 00</button>
        <button class="board-option pomodoro">00: 25: 00</button>
        <button class="board-option short">00: 15: 00</button>
      </div>
      <div class="custom-timer" style="display:none;">
        <span class="time-part" contenteditable="true">00</span>:
        <span class="time-part" contenteditable="true">00</span>:
        <span class="time-part" contenteditable="true">00</span>
      </div>
      <div class="board-section">
        <button class="boardBtn saveBtn">Save</button>
        <button class="boardBtn cancelBtn">Cancel</button>
      </div>`;
    document.body.append(this.overlayEl, this.windowEl);
    
    
const timeParts = this.windowEl.querySelectorAll('.time-part');

    timeParts.forEach(span => {
      span.addEventListener('keydown', (e) => {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
        if (
          !e.ctrlKey &&
          !e.metaKey &&
          !allowedKeys.includes(e.key) &&
          !/^\d$/.test(e.key)
        ) {
          e.preventDefault();
        }
      });

      span.addEventListener('input', () => {
        let text = span.textContent.replace(/\D/g, '');

        // Shift left if more than 2 digits
        if (text.length > 2) {
          text = text.slice(-2); // keep last 2 digits
        }

        span.textContent = text;

        // Move caret to end
        const range = document.createRange();
        range.selectNodeContents(span);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });

      span.addEventListener('paste', (e) => {
        e.preventDefault();
        const data = (e.clipboardData || window.clipboardData).getData('text');
        const digits = data.replace(/\D/g, '').slice(-2); // keep last 2 digits
        span.textContent = digits;
      });
    });
    
    
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
    const cOpts  = this.windowEl.querySelector('.custom-timer');
    const presets = this.windowEl.querySelectorAll('.board-option');
    const clkEl   = this.windowEl.querySelector('.custom-timer');

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

    clkEl.addEventListener('input', () => {
      const [hh, mm ,ss] = clkEl.textContent.split(':') 
      td.textContent = `${hh}: ${mm} :${ss}`;
    });

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

      new Timer(name, duration, this.group, id);
      instruction();
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
  // Click event on the button
  this.clearBtn.addEventListener('click', (e) => {
    this._handleClear();
  });

  // Global keydown event for 'Delete' key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete') {
      this._handleClear();
    }
  });
}

_handleClear() {
  if (!this.selectionActive) {
    this.selecting();
  } else {
    this.restore();
  }
}


  handleDeleteClick(e) {
    const el = e.currentTarget;
    const answer = confirm('Are you sure you want to delete this timer?');
    if (answer) {
      let timerId = el.dataset.id;
      let saved = JSON.parse(localStorage.getItem('saved') || '[]');
      saved = saved.filter(item => String(item.id) !== String(timerId));
      localStorage.setItem('saved', JSON.stringify(saved));

      // Get the timer instance and properly destroy it
      const timerInstance = timerRegistry.get(Number(timerId));
      if (timerInstance) {
        timerInstance.destroy();
      }
      
      instruction();

    } else {
      alert('Clear operation cancelled');
    }
  }

  selecting() {
    const timerEls = this.group.querySelectorAll('.clock');
    this.clearBtn.src = "check-icon.png";
    this.clearBtn.className = "confirm"; 
    this.selectionActive = true;        
    const selectingOverlay = document.createElement('div');
    selectingOverlay.className = 'selectingOverlay';
    document.querySelector('.main').append(selectingOverlay);
    
    const functionsOverlay = document.createElement('div');
    functionsOverlay.className = 'functionsOverlay';
    document.querySelector('.functions').append(functionsOverlay);

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
    document.body.querySelector('.selectingOverlay').remove();
    document.querySelector('.functionsOverlay').remove();
  }
}


/*
if (window.innerWidth < 768) {
  const themeLabel = document.getElementById('theme-label');
  const themePanel = document.getElementById('theme');
  const themeArea = document.getElementById('theme-area');

  themeLabel.addEventListener('mouseenter', () => {
    themePanel.style.transform = 'translateX(0px)';
    themeLabel.style.borderRadius = '0 0 12px 12px';
    themeLabel.style.transition = '0.5s';
  });

  themeArea.addEventListener('mouseleave', () => {
    themePanel.style.transform = 'translateX(-150px)';
    themeLabel.style.borderRadius = '12px';
    themeLabel.style.transition = '0.5s';
  });
}
function handleResize() {  
    const themeLabel = document.getElementById('theme-label');
    const themePanel = document.getElementById('theme');
    const themeArea = document.getElementById('theme-area');
  
if (window.innerWidth < 768) {
  themeLabel.removeEventListener('click', themeToggle);
  themeLabel.addEventListener('mouseenter', () => {
    themePanel.style.transform = 'translateX(0px)';
    themeLabel.style.borderRadius = '0 0 12px 12px';
    themeLabel.style.transition = '0.5s';
  });

  themeArea.addEventListener('mouseleave', () => {
    themePanel.style.transform = 'translateX(-150px)';
    themeLabel.style.borderRadius = '12px';
    themeLabel.style.transition = '0.5s';
  });
}
 if (window.innerWidth > 768) {
    themePanel.style.transform = 'translateX(0px)';
    themeLabel.style.borderRadius = '12px 0 0 12px';
    themeLabel.style.transition = '0.5s';
    themeArea.addEventListener('mouseleave', () => {
      themePanel.style.transform = 'translateX(0px)';
      themeLabel.style.borderRadius = '12px 0 0 12px';
    });
    let opened = true;

    themeLabel.addEventListener('click',themeToggle);

    function themeToggle(){
      if (opened) {
      themePanel.style.display = 'none';
      opened = false;
      themeLabel.style.borderRadius = '12px';
    }else{
      themePanel.style.display = 'flex';
      opened = true;
    }
    }
  }
}
window.addEventListener("resize", handleResize);
handleResize();
*/

document.querySelectorAll('#theme li').forEach(option => {
  option.addEventListener('click', () => {
    document.body.className = `theme-${option.id}`;
    localStorage.setItem('selectedTheme', option.id);
  });
});

document.querySelectorAll('.side-bar-list-item').forEach(option => {
  option.addEventListener('click', () => {
    const name = `.${option.id}`;
    if(document.querySelector(name)){
    clearDisplay();  
    document.querySelector(name).classList.remove('empty');
    document.querySelector(name).style.display = 'grid';
    }
  });
});

function clearDisplay(){
  document.querySelectorAll('.sections section').forEach(option => {
    option.classList.add('empty');
    option.style.display = 'none'
  });
};

function instruction(){
  const instructionEl = document.querySelector('.instruction');
  const element = document.querySelector('.timer-section');
  if (element.querySelectorAll('.clock').length === 0) {
    instructionEl.style.display = 'flex';
  }
  else {
    instructionEl.style.display = 'none';
  }
}

class sideBar{
  constructor(){
    this.toggle = document.querySelector('.toggle-menu');
    this.group = document.querySelectorAll('.side-bar-list-item p');
    this.statue = false;
    this.trigger();
  }
  trigger(){
    this.toggle.addEventListener('click',()=>{
      if(this.statue == false){
        this.statue = true;
        this.group.forEach(el=>{
          el.style.display = 'block';
        })
      }else{
        this.statue = false;
        this.group.forEach(el=>{
          el.style.display = 'none';
        })
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ClockDisplay('#current-time'); 
  new TimerModal('.add', '.timer-section'); 
  new TimerSelect('.clear','.timer-section');   
  new sideBar();


  const saved = localStorage.getItem('selectedTheme');
  if (saved) {
    document.body.className = `theme-${saved}`;
  }

  const savedTimers = JSON.parse(localStorage.getItem('saved') || '[]');
  savedTimers.forEach(el => {
    new Timer(el.name,el.duration,document.querySelector('.timer-section'),el.id)
  });
  instruction();
});