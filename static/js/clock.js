// 420clock.js by Ash Vance/wyrmdancer

// Defining variables first

// UI elements
const clock = document.getElementById('clock');
const audioPrompt = document.getElementById('audioPrompt');
const debugCheckbox = document.getElementById('debug420');           // Force 420 mode
const debugFridayCheckbox = document.getElementById('debugFriday');  // Force Friday
const debug422Checkbox = document.getElementById('debug422');        // Force 4:22
const debug420DayCheckbox = document.getElementById('debug420Day'); // Force 4/20 day
// Audio elements
// Silent audio added to fix bug where UnlockAudioOnce() stops the music if 420 mode is already active.
const silentAudio = document.getElementById('silentButDeadly');
const audio420 = document.getElementById('audio420');
const audio420friday = document.getElementById('audio420friday');

// 420 mode variables
let flashing = false;
let flashInterval = null;
let leafInterval = null;
let snoopLoopInterval = null;
let updateAudioInterval = null;
const leafImage = 'img/weedleaf.png';
const snoopVidSrc = 'vid/SnoopLoop.webm';
// Debug variables
let debugForce420Mode = false;
let debugForceTodayToBeFriday = false;
let debugForce422FlagTrue = false;
let debugForce420Day = false;

// Add event listeners to unlock audio on user interaction.
// Not technically "variables" but everything breaks if we don't add these here.
document.addEventListener("mouseenter", unlockAudioOnce, { once: true });
document.addEventListener("click", unlockAudioOnce, { once: true });

// Initialize time variables
let now;
let hours;
let minutes;
let seconds;

let isFriday;
let is420Day;
let prevIs420Day;
let is422;
let isPM;
let in420Window;

// Clock display variables
let displayHours;
let timeStr = null;

// Never thought I'd write a function to work around anti-screamer restrictions,
// but god forbid we ever go back to the myspace days of sudden surprise audio.
function unlockAudioOnce() {
    silentAudio.play().then(() => {
        silentAudio.pause();
        silentAudio.currentTime = 0;
        console.log("Attempting to unlock audio silently.");
        audioPrompt.style.display = 'none';
    }).catch((err) => {
        console.warn("Audio Still Blocked:", err);
    });
}

// Spawns leaf. Pretty self explanatory.
function spawnLeaf() {
    const leaf = document.createElement('img');
    leaf.src = leafImage;
    leaf.className = 'leaf';
    leaf.style.left = Math.random() * 100 + 'vw';
    leaf.style.animationDuration = (Math.random() * 3 + 3) + 's';
    leaf.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(leaf);
    setTimeout(() => leaf.remove(), 10000);
}

function spawnSnoopLoop()
{
    const snoopLoop = document.createElement('video');
    snoopLoop.autoplay = true;
    snoopLoop.loop = true;
    snoopLoop.muted = true;
    snoopLoop.playsInline = true;
    snoopLoop.src = snoopVidSrc;
    snoopLoop.className = 'snoop_loop';
    snoopLoop.style.left = Math.random() * 100 + 'vw';
    snoopLoop.style.animationDuration = (Math.random() * 3 + 3) + 's';
    snoopLoop.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(snoopLoop);
    setTimeout(() => snoopLoop.remove(), 5000);
}
// Funny story: I wrote this fucking thing, and even I don't know whether this gets called once every second,
// once every frame, or once when 420mode activates. JS is weird man.
function enter420Mode(isFriday, is422, is420Day) {

    // INIT (runs once per entry)
    if (!flashing) {
        flashing = true;

        if (isFriday || is420Day) {
            audio420friday.play().catch(() => { });
        } else {
            audio420.play().catch(() => { });
        }

        flashInterval = setInterval(() => {
            document.body.style.backgroundColor =
                document.body.style.backgroundColor === 'black' ? '#00ff00' : 'black';
            clock.style.color =
                document.body.style.backgroundColor === 'black' ? 'white' : 'black';
        }, 500);

        leafInterval = setInterval(spawnLeaf, 300);
        updateAudioInterval = setInterval(updateAudio, 1000);

        if (is420Day) {
            snoopLoopInterval = setInterval(spawnSnoopLoop, 500);
        }
    }

    // ALWAYS UPDATE TEXT (this fixes the 4:22 issue)
    if (!is420Day) {
        clock.textContent = is422 ? 'HAPPY 4:22!!!' : 'HAPPY 4:20!!!';
    } else {
        clock.innerHTML = '<p>Happy 4/20!!!<br/>Smoke em if ya got em!!!</p>';
    }
}

// Too much smoke, turn on the vent fans.
function exit420Mode(isFriday) {
    if (flashing)
    {
        flashing = false;

        audio420.pause();
        audio420.currentTime = 0;
        audio420friday.pause();
        audio420friday.currentTime = 0;

        clearInterval(flashInterval);
        clearInterval(leafInterval);
        clearInterval(snoopLoopInterval);
        clearInterval(updateAudioInterval);

        flashInterval = null;
        leafInterval = null;
        snoopLoopInterval = null;
        updateAudioInterval = null;

        document.body.style.backgroundColor = 'black';
        clock.style.color = 'white'
    }
}

// Main clock update function. Gets called every second using setInterval at the bottom of the script.
function updateClock() {
    // Update debug variables every second based on UI status
    debugForceTodayToBeFriday = debugFridayCheckbox?.checked || false;
    debugForce422FlagTrue = debug422Checkbox?.checked || false;
    debugForce420Mode = debugCheckbox?.checked || false;
    debugForce420Day = debug420DayCheckbox?.checked || false;

    now = new Date();
    hours = now.getHours();
    minutes = now.getMinutes();
    seconds = now.getSeconds();
    isPM = hours >= 12;

    isFriday = (now.getDay() === 5) || debugForceTodayToBeFriday;
    is420Day = (now.getMonth() === 3 && now.getDate() === 20) || debugForce420Day;
    is422 = (hours === 4 && minutes === 22 && seconds < 60) || debugForce422FlagTrue;

    if (is420Day !== prevIs420Day) {
        exit420Mode();
    }
    prevIs420Day = is420Day;

    in420Window =
        ((hours === 4 || hours === 16) &&
            ((minutes === 20 && seconds < 60) ||
                (minutes === 22 && seconds < 60)));


    if (debugForce420Mode || in420Window || is420Day) {
        enter420Mode(isFriday, is422, is420Day);
    } else {
        exit420Mode(isFriday);
        displayHours = hours % 12 || 12;
        timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
        clock.textContent = timeStr;
    }
}
function updateAudio()
{
    // If it's 4/20, check to see if the audio is done playing.
    // If it's not done, do nothing.
    // If it IS done, replay it.
    if (is420Day)
    {
        if (audio420friday.ended)
        {
            audio420friday.currentTime = 0;
            audio420friday.play().catch(() => { });
        }
    }
    //setInterval(updateAudioInterval, 1000);
}
setInterval(updateClock, 1000);
updateClock();