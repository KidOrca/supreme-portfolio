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

// content.json renderer (shared by all pages)
(function(){
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
  function safe(u){return /^(https?:\/\/|assets\/|\/|#)/.test(u||'')?u:'#'}
  function photo(src,alt){
    var d=el('div','photo');d.setAttribute('data-file',src||'assets/your-photo.jpg');
    if(src){var i=el('img');i.src=safe(src);i.alt=alt;i.onerror=function(){d.classList.add('missing')};d.appendChild(i)}
    else d.classList.add('missing');
    return d;
  }
  function $(id){return document.getElementById(id)}
  fetch('content.json',{cache:'no-store'}).then(function(r){return r.json()}).then(function(D){
    var s=D.site||{}, P=D.projects||[];
    document.querySelectorAll('[data-site]').forEach(function(n){var v=s[n.getAttribute('data-site')];if(v)n.textContent=v});
    document.querySelectorAll('[data-mail]').forEach(function(n){if(s.email)n.href='mailto:'+s.email});
    document.querySelectorAll('[data-link]').forEach(function(n){var u=s[n.getAttribute('data-link')];if(u)n.href=safe(u);else n.hidden=true});

    var f=P.filter(function(p){return p.featured})[0];
    if($('teaser-h')){ if(f){$('teaser-h').textContent='Featured project: '+f.title;$('teaser-p').textContent=f.summary||''} }

    if($('featured')){
      var box=$('featured');box.textContent='';
      if(f){
        var a=el('article','project featured'),l=el('div'),h=el('h3',null,f.title);h.id='featured-h';
        a.setAttribute('aria-labelledby','featured-h');
        l.appendChild(el('div','tag','Featured project'+(f.year?' · '+f.year:'')));l.appendChild(h);l.appendChild(el('p',null,f.summary||''));
        var t=el('table','specs');
        [['Built with',f.tools],['Result',f.result]].forEach(function(r){if(r[1]){var tr=el('tr');tr.appendChild(el('th',null,r[0]));tr.appendChild(el('td',null,r[1]));t.appendChild(tr)}});
        if(f.link){var tr=el('tr'),td=el('td'),k=el('a',null,'View project');k.href=safe(f.link);td.appendChild(k);tr.appendChild(el('th',null,'Source'));tr.appendChild(td);t.appendChild(tr)}
        l.appendChild(t);a.appendChild(l);
        var fig=el('figure');fig.appendChild(photo(f.photo,f.title));a.appendChild(fig);box.appendChild(a);
      }
    }

    ['logic','fpga','cpu','other'].forEach(function(type,i){
      var c=document.querySelector('#panel-'+i+' .plist');if(!c)return;c.textContent='';
      var list=P.filter(function(p){return p.type===type});
      if(!list.length)c.appendChild(el('p',null,'Nothing here yet.'));
      list.forEach(function(p){
        var row=el('div','pitem'),d=el('div');
        d.appendChild(el('h4',null,p.title+(p.year?' ('+p.year+')':'')));d.appendChild(el('p',null,p.summary||''));row.appendChild(d);
        if(p.link){var k=el('a',null,'View');k.href=safe(p.link);row.appendChild(k)}
        c.appendChild(row);
      });
    });

    if($('skills-body')){
      var tb=$('skills-body');tb.textContent='';
      (D.skills||[]).forEach(function(k){var tr=el('tr');tr.appendChild(el('th',null,k.area));tr.appendChild(el('td',null,k.detail));tb.appendChild(tr)});
    }
    if($('jobs')){
      var jb=$('jobs');jb.textContent='';
      (D.experience||[]).forEach(function(e){
        var j=el('div','job'),d=el('div'),ul=el('ul');
        j.appendChild(el('time',null,e.dates));d.appendChild(el('h3',null,e.title));
        (e.bullets||[]).forEach(function(b){ul.appendChild(el('li',null,b))});
        d.appendChild(ul);j.appendChild(d);jb.appendChild(j);
      });
    }
  }).catch(function(){});
})();
