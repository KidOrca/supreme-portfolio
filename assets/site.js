(function(){
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // 4-bit ALU demo (home page)
  if (document.getElementById('abits')) (function(){
  var a = [1,0,1,1], b = [0,1,1,0]; // MSB first
  function mk(id, arr){
    var box = document.getElementById(id);
    arr.forEach(function(_, i){
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'bit';
      btn.setAttribute('aria-label', id[0].toUpperCase() + ' bit ' + (3 - i));
      btn.addEventListener('click', function(){ arr[i] ^= 1; update(); });
      box.appendChild(btn);
    });
  }
  function val(arr){ return arr[0]*8 + arr[1]*4 + arr[2]*2 + arr[3]; }
  function bits4(n){ return [(n>>3)&1,(n>>2)&1,(n>>1)&1,n&1]; }
  var rbox = document.getElementById('rbits'), leds = [];
  for (var i = 0; i < 4; i++){ var l = document.createElement('span'); l.className = 'led'; rbox.appendChild(l); leds.push(l); }
  mk('abits', a); mk('bbits', b);

  function update(){
    var A = val(a), B = val(b), op = document.getElementById('op').value, r, c = 0;
    if (op === 'ADD'){ var s = A + B; r = s & 15; c = s >> 4; }
    else if (op === 'SUB'){ var d = A + ((~B) & 15) + 1; r = d & 15; c = d >> 4; }
    else if (op === 'AND') r = A & B;
    else if (op === 'OR')  r = A | B;
    else r = A ^ B;
    [['abits',a],['bbits',b]].forEach(function(p){
      var kids = document.getElementById(p[0]).children;
      for (var i = 0; i < 4; i++){ kids[i].textContent = p[1][i]; kids[i].setAttribute('aria-pressed', p[1][i] ? 'true' : 'false'); }
    });
    var rb = bits4(r);
    leds.forEach(function(l, i){ l.textContent = rb[i]; l.classList.toggle('on', !!rb[i]); });
    var fc = document.getElementById('fc'), fz = document.getElementById('fz');
    fc.classList.toggle('on', !!c); fz.classList.toggle('on', r === 0);
    document.getElementById('readout').textContent = A + ' ' + op + ' ' + B + ' = ' + r + '  (carry ' + c + ', zero ' + (r === 0 ? 1 : 0) + ')';
  }
  document.getElementById('op').addEventListener('change', update);
  update();
  })();

  // project type tabs (projects page)
  if (document.querySelector('.type-card')) (function(){
  
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.type-card'));
  function pick(i, focus){
    tabs.forEach(function(t, j){
      var on = i === j;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById('panel-' + j).hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ pick(i, false); });
    t.addEventListener('keydown', function(e){
      var n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End') n = tabs.length - 1;
      if (n !== null){ e.preventDefault(); pick(n, true); }
    });
  });
  })();
})();
