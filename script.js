window.onload = function() {
    setInterval(function(){
        const date = new Date();
        const displayTime = date.toLocaleTimeString();
        document.getElementById('current-time').innerHTML = `Time: ${displayTime}`;
    }, 1000);
};

let boardEl = document.getElementById('board');
let addEl = document.querySelector('.add');

// Store duration between Add → Save
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
        <div contenteditable="true" class="time timing">00:00:00</div>
        <input class="boardInput" type="text" placeholder="timer_name" maxlength="15" minlength="1">
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

// Hide the input board
    cancelEl.addEventListener('click', () => {
        windowEl.remove();
        overlayEl.remove();
    });


// Save and create new timer
    saveEl.addEventListener('click', () => {
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
                    <button class="edit">edit</button>
                    <button class="full">full</button>
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
            clearInterval(localTimerInterval);
            localTimerInterval = null;
            soundEl.pause();
            startBtn.innerHTML = "Resume";
            startBtn.style.display = "inline-block";
            stopBtn.style.display = "none";
        });

        editBtn.addEventListener("click", () => {
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
        });
    });

});


