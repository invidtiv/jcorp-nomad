// <!-- Version 4 -->
/* tiny shared helpers used across the frontend pages, dependency-free */

// one leading slash, no trailing slash, no double slashes, backslashes -> forward.
// most defensive of the old per-page copies (some missed doubled slashes)
function normalizePath(p) {
  if (!p) return '/';
  p = String(p).trim().replace(/\\/g, '/').replace(/\/+/g, '/');
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

// in-place shuffle for the music shuffle-play mode
function fisherYates(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

/* keeps the screen on during video. tries the Wake Lock API, falls back to
   NoSleep.js if its loaded, no-ops if neither */
let wakeLock = null;
let noSleep = null;

async function requestWakeLock(){
  try {
    if('wakeLock' in navigator){
      if(!wakeLock){
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener && wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
      return true;
    }

    if(window.NoSleep){
      if(!noSleep) noSleep = new NoSleep();
      try { noSleep.enable(); } catch(e){ console.warn('NoSleep.enable() failed', e); }
      return true;
    }

    console.warn('No Wake Lock API or NoSleep available — screen may still sleep.');
    return false;
  } catch(e){
    console.warn('requestWakeLock error', e);
    if(window.NoSleep){
      try { if(!noSleep) noSleep = new NoSleep(); noSleep.enable(); return true; } catch(e2){}
    }
    return false;
  }
}

async function releaseWakeLock(){
  try {
    if(wakeLock){
      try { await wakeLock.release(); } catch(e){}
      wakeLock = null;
    }
    if(noSleep){
      try { noSleep.disable(); } catch(e){}
    }
  } catch(e){
    console.warn('releaseWakeLock error', e);
  }
}
