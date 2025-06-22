window.onload = function() {
    setInterval(function(){
        const date = new Date();
        const displayTime = date.toLocaleTimeString();
        document.getElementById('current-time').innerHTML = `Time: ${displayTime}`;
    }, 1000);
};

let boardEl = document.querySelector('.board');
let addEl = document.querySelector('.add');
let currentName = 'timer_name';
let currentDuration = '';
const overlayEl = document.createElement('div');
const windowEl = document.createElement('div');

// Show the input board
addEl.addEventListener('click', () => {
    overlayEl.classList.add("overlay");
    windowEl.classList.add("board");
    windowEl.innerHTML=`
        <p>Add Timer</p>
            <div class="time timing">00:00:00</div>
            <input class="boardInput" type="text" placeholder="timer_name" maxlength="15" minlength="1">
            <div class="boardBtns">
                <div class="board-section">
                    <button class="boardBtn ready-option">ready</button>
                    <button class="boardBtn custom-option">custom</button>
                </div>

                <div class="board-options">
                    <button class="board-option long">long 90 min</button>
                    <button class="board-option pomodoro">pomodoro 25 min</button>
                    <button class="board-option short">short 15 min</button>
                </div>

                <div class="custom-options">
                    <div class="custom-time">
                        <div contenteditable="true" class="clocking">00:00:00</div>
                    </div>
                </div>

                <div class="board-section">
                    <button class="boardBtn saveBtn">Save</button>
                    <button class="boardBtn cancelBtn">Cancel</button>
                </div>
            </div>
    `;

    document.body.appendChild(windowEl);
    document.body.appendChild(overlayEl);

    let saveEl = document.querySelector('.saveBtn');
    let cancelEl = document.querySelector('.cancelBtn');
    let boardInput = document.querySelector('.boardInput');
    let timingDisplay = document.querySelector('.timing');
    let readyEl = document.querySelector('.ready-option');
    let customEl = document.querySelector('.custom-option');
    let boardOptions = document.querySelector('.board-options');
    let customOptions = document.querySelector('.custom-options');
    let longEl = document.querySelector('.long');
    let pomodoroEl = document.querySelector('.pomodoro');
    let shortEl = document.querySelector('.short');

    readyEl.addEventListener('click',() => {
        boardOptions.style.display = 'grid';
        customOptions.style.display = 'none';
        customEl.style.display = 'block';
        readyEl.style.display = 'none';
    });

    longEl.addEventListener('click',()=>{
        timingDisplay.textContent = '01:30:00'; 
    });
    pomodoroEl.addEventListener('click',()=>{
        timingDisplay.textContent = '00:25:00'; 
    });
    shortEl.addEventListener('click',()=>{
        timingDisplay.textContent = '00:15:00'; 
    });

    customEl.addEventListener('click',()=> {
        boardOptions.style.display = 'none';
        customEl.style.display = 'none';
        readyEl.style.display = 'block';
        
        let clockingEl = document.querySelector('.clocking')

        clockingEl.addEventListener('input',()=> {
            timingDisplay.innerHTML = clockingEl.textContent;
        });
    })

// Hide the input board
    cancelEl.addEventListener('click', () => {
        windowEl.remove();
        overlayEl.remove();
    });


// Save and create new timer
    saveEl.addEventListener('click', () => {
        let stoped = true;
        windowEl.remove();
        overlayEl.remove();
        currentName = boardInput.value;
        if (!currentName) {
            currentName = 'timer_name';
        }
        currentDuration = timingDisplay.textContent;

        const clockEl = document.createElement('div');
        clockEl.className = 'clock';
        clockEl.innerHTML = `
            <div class="header">
                <p>${currentName}</p>
                <div class="headerBtns">
                    <button class="headerBtn edit">edit</button>
                    <button class="headerBtn full">full</button>
                </div>
            </div>
            <div class="timer">
                <div class="time">${currentDuration}</div>
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

        document.querySelector('.group').appendChild(clockEl);

        const timeEl = clockEl.querySelector(".time");
        const startBtn = clockEl.querySelector(".start");
        const stopBtn = clockEl.querySelector(".stop");
        const resetBtn = clockEl.querySelector(".reset");
        const soundEl = clockEl.querySelector(".alarm");
        const editBtn = clockEl.querySelector(".edit");
        const fullBtn = clockEl.querySelector(".full");

        let localTimerInterval = null;

        startBtn.addEventListener("click", () => {
            stoped = false;
            startBtn.style.display = "none";
            stopBtn.style.display = "inline-block";
            resetBtn.style.display = "inline-block";

            if (localTimerInterval) return;

            localTimerInterval = setInterval(() => {
                let [hours, minutes, seconds] = timeEl.innerHTML.split(":").map(Number);

                if (seconds === 0) {
                    if (minutes === 0) {
                        if (hours === 0) {
                            clearInterval(localTimerInterval);
                            soundEl.play();
                            startBtn.style.display = "none";
                            stopBtn.style.display = "none";
                            resetBtn.style.display = "inline-block";
                            return;
                        } else {
                            hours--;
                            minutes = 59;
                            seconds = 59;
                        }
                    } else {
                        minutes--;
                        seconds = 59;
                    }
                } else {
                    seconds--;
                }

                timeEl.innerHTML = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }, 1000);
        });

        resetBtn.addEventListener("click", () => {
            stoped = true;
            clearInterval(localTimerInterval);
            localTimerInterval = null;
            soundEl.pause();
            soundEl.currentTime = 0;
            timeEl.innerHTML = currentDuration;
            startBtn.innerHTML = "Start";
            startBtn.style.display = "inline-block";
            stopBtn.style.display = "none";
            resetBtn.style.display = "none";
        });

        stopBtn.addEventListener("click", () => {
            stoped = true;
            clearInterval(localTimerInterval);
            localTimerInterval = null;
            soundEl.pause();
            startBtn.innerHTML = "Resume";
            startBtn.style.display = "inline-block";
            stopBtn.style.display = "none";

        });

        editBtn.addEventListener("click", () => {
            if(stoped){
                overlayEl.classList.add("overlay");
                windowEl.classList.add("board");
                windowEl.innerHTML=`
                    <div class="Eheader">
                        <p>Edit Timer</p>
                        <button class="EheaderBtn">delete</button>
                    </div>
                    <div contenteditable="true" class="time timing">${timeEl.innerHTML}</div>
                    <input class="boardInput" type="text" placeholder="timer_name" maxlength="15" minlength="1" value="${currentName}">
                    <div class="boardBtns">
                        <button class="boardBtn saveBtn">Save</button>
                        <button class="boardBtn cancelBtn">Cancel</button>
                    </div>
                `;
                document.body.appendChild(windowEl);
                document.body.appendChild(overlayEl);
                let saveEl = document.querySelector('.saveBtn');
                let cancelEl = document.querySelector('.cancelBtn');
                let boardInput = document.querySelector('.boardInput');
                let timingDisplay = document.querySelector('.timing');
                let deleteEl = document.querySelector('.EheaderBtn');

                cancelEl.addEventListener('click', () => {
                    windowEl.remove();
                    overlayEl.remove();
                });

                saveEl.addEventListener('click', () => {
                    currentName = boardInput.value;
                    currentDuration = timingDisplay.textContent;
                    clockEl.querySelector('.header p').textContent = currentName;
                    timeEl.innerHTML = currentDuration;
                    windowEl.remove();
                    overlayEl.remove();
                });
                deleteEl.addEventListener('click', () => {
                    clockEl.remove();
                    windowEl.remove();
                    overlayEl.remove();
                });
            }
        });

        let full = false;
        
        fullBtn.addEventListener("click", () => {
            const layerEl = document.createElement('div');
            if(!full){
                layerEl.classList.add("layer");
                document.body.append(layerEl);
                clockEl.classList.add("fullscreen");
                clockEl.classList.remove("clock");
                fullBtn.textContent = 'fit'
                full = true;
            }else{
                fullBtn.textContent = 'full'
                clockEl.classList.remove("fullscreen");
                clockEl.classList.add("clock");
                document.querySelector(".layer").remove();
                full = false;
            }
        });
    });
});