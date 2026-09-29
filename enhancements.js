/* Motion preferences and input are independent from portfolio scene content. */
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let motionDisabled = motionPreference.matches;
function reducedMotion() { return motionDisabled; }
function applyMotionPreference() {
  document.body.classList.toggle('motion-off', motionDisabled);
  window.StationRenderer?.setMotion(!motionDisabled);
  const button = document.querySelector('#motionBtn');
  button.textContent = motionDisabled ? 'MOTION OFF' : 'MOTION ON';
  button.setAttribute('aria-pressed', String(motionDisabled));
}
applyMotionPreference();
motionPreference.addEventListener('change', e => { motionDisabled = e.matches; applyMotionPreference(); });
document.querySelector('#motionBtn').addEventListener('click', () => { motionDisabled = !motionDisabled; applyMotionPreference(); });
document.querySelector('#homeBtn').addEventListener('click', e => {
  e.preventDefault();
  if (busy) return;
  stack.length = 0;
  if (current === 'intro') { cutIn(); return; }
  wipeTo('menu', false);
});
let pointerFrame = 0;
addEventListener('pointermove', e => {
  if (motionDisabled || e.pointerType === 'touch' || pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    document.documentElement.style.setProperty('--mx', (e.clientX / innerWidth - .5).toFixed(3));
    document.documentElement.style.setProperty('--my', (e.clientY / innerHeight - .5).toFixed(3));
    pointerFrame = 0;
  });
}, {passive:true});
document.querySelectorAll('.scene').forEach(scene => scene.inert = scene.id !== 'start');
document.body.dataset.scene = 'start';
document.querySelector('#trainBtn').addEventListener('click', () => {
  if (!busy) { window.StationRenderer?.replay(); sfx('ok'); }
});
