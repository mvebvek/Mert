/* Eşik — page behaviour. Every block checks for its elements, so one file serves all pages. */
(function(){
  const $ = id => document.getElementById(id);

  /* deadline strip: the next 15 January or 15 July, recomputed every visit */
  const strip = $('deadlines');
  if(strip){
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const fmt = d => d.getDate()+' '+months[d.getMonth()]+' '+d.getFullYear();
    const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const today = new Date(); today.setHours(0,0,0,0);
    const dates = [];
    for(let y=today.getFullYear(); dates.length<2; y++){
      [new Date(y,0,15), new Date(y,6,15)].forEach(d=>{ if(d>=today && dates.length<2) dates.push(d); });
    }
    const notes = {
      0:{label:'Yaz dönemi '+'%Y', text:'Yaz dönemi başvuruları ve Studienkolleg için yaygın son gün. Tıpta birçok üniversitenin yıllık tek tarihi.'},
      6:{label:'Kış dönemi %Y/%N', text:'Çoğu lisans programı için yaygın son gün. Bazı yüksek lisans programları çok daha erken kapanır.'}
    };
    const lab = d => notes[d.getMonth()].label.replace('%Y',d.getFullYear()).replace('%N',String(d.getFullYear()+1).slice(2));
    const [a,b] = dates;
    const days = Math.round((a-today)/86400000);
    const set = (k,v) => { const el=strip.querySelector('[data-k="'+k+'"]'); if(el) el.textContent=v; };
    set('a-date',fmt(a)); strip.querySelector('[data-k="a-date"]').setAttribute('datetime',iso(a));
    set('a-note',notes[a.getMonth()].text);
    set('days', days===0 ? 'Bugün' : days+' gün');
    set('b-label',lab(b)); set('b-date',fmt(b)); strip.querySelector('[data-k="b-date"]').setAttribute('datetime',iso(b));
    set('b-note',notes[b.getMonth()].text);
  }

  /* path finder */
  if($('pf')){
    const pf = $('pf');
    const kolleg = {eng:'T',cs:'T',sci:'T',arch:'T',eco:'W',med:'M',life:'M',hum:'G'};
    const v = n => (pf.querySelector('input[name="'+n+'"]:checked')||{}).value;
    function render(){
      const st=v('st'), fd=v('fd'), ln=v('ln');
      let path, test, chan, warn='';
      if(st==='lise'){
        path = 'Büyük ihtimalle Studienkolleg: bir yıllık hazırlık ve Feststellungsprüfung. Önerilen kurs: ' + kolleg[fd] + '-Kurs. Türkiye\'de ilgili alanda bir ya da iki yıl okumak bazı durumlarda doğrudan başvuruyu açar.';
        test = 'Studienkolleg giriş sınavı (Almanca ve matematik, çoğu yerde B1 ya da B2 Almanca). TestAS, bazı üniversitelerde başvurunu güçlendirir ya da yol kısaltır.';
        chan = 'Studienkolleg\'e uni-assist ya da doğrudan; yaz dönemi için 15 Ocak, kış dönemi için 15 Temmuz.';
      } else if(st==='yks'){
        path = 'Doğrudan başvuru ihtimalin var, genellikle yerleştiğin ya da okuduğun alanla ilişkili programlara. Kuralı programa göre DAAD ve uni-assist bilgileriyle teyit ederiz.';
        test = 'TestAS çoğu zaman şart değil ama birçok programda avantaj; alan modülü sana göre seçilir.';
        chan = 'Çoğunlukla uni-assist; bazı üniversiteler doğrudan başvuru alır. YKS yerleştirme belgesi dosyanın parçasıdır.';
      } else if(st==='bsc'){
        path = 'Yüksek lisans başvurusu. Lisans dersler ve notlar, programın beklediği içerikle karşılaştırılır.';
        test = (fd==='eco') ? 'Bazı iktisat ve işletme programları GRE ya da GMAT ister veya puanlar.' : 'Çoğu programda ek yetenek sınavı yok; bazıları portfolyo, mülakat ya da özel belgeler ister.';
        chan = 'Ön değerlendirme (VPD) ya da doğrudan başvuru. Yüksek lisans son tarihleri lisanstan çok daha erken olabilir.';
      } else {
        path = 'Alman lisesinden alınan Abitur ile doğrudan, alan kısıtı olmadan başvuru.';
        test = 'Genellikle ek sınav gerekmez.';
        chan = 'Programa göre doğrudan üniversiteye ya da merkezi sistem üzerinden.';
      }
      let lang;
      if(fd==='med'){ lang = 'C1 Almanca: TestDaF (dört bölümde TDN 4), DSH-2 ya da DSH-3, telc C1 Hochschule veya Goethe C2.'; }
      else if(ln==='de'){ lang = (st==='lise') ? 'Studienkolleg sonunda Feststellungsprüfung dil belgesi yerine geçer. Doğrudan girersen TestDaF, DSH-2, telc C1 Hochschule ya da kabul edilen bir Goethe belgesi.' : 'TestDaF (dört bölümde TDN 4), DSH-2, telc C1 Hochschule ya da programın kabul ettiği Goethe veya ÖSD belgesi.'; }
      else if(ln==='en'){ lang = 'IELTS Academic, TOEFL iBT ya da Cambridge C1; seviye programa göre, çoğunlukla B2–C1.' + (st==='lise' ? ' Studienkolleg Almanca olduğu için yine de Almanca gerekir.' : ''); }
      else { lang = 'İki seçenek de açık: Almanca programlar için TestDaF ya da eşdeğeri, İngilizce programlar için IELTS ya da TOEFL. Program listesi netleşince birine odaklanırız.'; }

      if(fd==='med'){
        warn = 'Tıp: AB dışı adaylara kontenjanın yaklaşık yüzde 5\'i ayrılır, program neredeyse her zaman Almancadır, birçok üniversitede yıllık tek başvuru tarihi 15 Ocak\'tır. TestAS tıp modülü yalnızca dijitaldir; Hamburg şart koşar.';
        if(ln==='en') lang += ' Almanya\'da tıp eğitimi pratikte Almancadır.';
      } else if(fd==='life'){
        warn = 'TestAS yaşam bilimleri modülü yalnızca dijital formatta sunulur. Psikoloji ve eczacılık gibi programlarda kontenjan sınırlıdır.';
      } else if(fd==='hum' && ln!=='en'){
        warn = 'Hukuk Alman hukukuna dayanır ve çok ileri Almanca ister; yabancı hukukçular için yüksek lisans (LL.M.) çoğu zaman daha uygun bir giriştir.';
      }
      $('o-path').textContent=path; $('o-lang').textContent=lang; $('o-test').textContent=test; $('o-chan').textContent=chan;
      const w=$('o-warn'); if(warn){w.hidden=false;w.textContent=warn;} else w.hidden=true;
    }
    pf.addEventListener('change',render);
    pf.addEventListener('submit',e=>e.preventDefault());
    render();
  }

  /* university explorer */
  if($('tabs')){
    const E='Mükemmeliyet 2027', H='Harç: 1.500 €/dönem', T='Harç: TUM';
    const F = {
      eng:{name:'Mühendislik',note:'Mühendislikte en büyük teknik üniversiteler TU9 birliğinde toplanır. Uygulamalı bilimler üniversiteleri de sanayiyle iç içe güçlü programlar sunar.',list:[
        ['TUM','München','Makine, elektrik ve havacılık; sanayiyle çok yakın bağ.',[E,T]],
        ['RWTH Aachen','Aachen','Makine ve üretim mühendisliğinde köklü ve çok büyük bir fakülte.',[E]],
        ['KIT','Karlsruhe','Makine, elektrik ve enerji; büyük bir araştırma merkeziyle birleşik.',[E,H]],
        ['Universität Stuttgart','Stuttgart','Otomotiv, havacılık ve uzay; bölgenin otomotiv sanayiyle iç içe.',[H]],
        ['TU Darmstadt','Darmstadt','Elektrik, makine ve bilgisayar mühendisliği.',[E]],
        ['TU Dresden','Dresden','Elektrik, malzeme ve mikroelektronik; çip sanayisinin yoğun olduğu bölge.',[E]],
        ['TU Berlin','Berlin','Geniş mühendislik yelpazesi, başkentte.',[E]]]},
      cs:{name:'Bilgisayar bilimleri',note:'Yapay zekâ ve güvenlik araştırmalarında üniversitelerin çevresindeki Max Planck ve benzeri enstitüler belirleyici rol oynar.',list:[
        ['TUM','München','Bilgisayar bilimleri ve yapay zekâda ülkenin önde gelenlerinden.',[E,T]],
        ['LMU München','München','Makine öğrenmesi ve istatistik.',[E]],
        ['KIT','Karlsruhe','Yazılım, robotik ve bilgi sistemleri.',[E,H]],
        ['Universität des Saarlandes','Saarbrücken','CISPA güvenlik merkezi ve Max Planck enstitüleri; güvenlik ve teorik bilgisayar bilimleri.',[]],
        ['Universität Tübingen','Tübingen','Cyber Valley çevresinde makine öğrenmesi.',[E,H]],
        ['TU Darmstadt','Darmstadt','Siber güvenlik ve yapay zekâ.',[E]],
        ['RWTH Aachen','Aachen','Bilgisayar bilimleri ve yazılım mühendisliği.',[E]]]},
      sci:{name:'Matematik ve doğa bilimleri',note:'Matematik ve fizikte araştırma kümeleri (Exzellenzcluster) iyi bir yön göstergesidir.',list:[
        ['Universität Bonn','Bonn','Matematikte Hausdorff Merkezi ile uluslararası bir merkez.',[E]],
        ['LMU München','München','Fizik ve kimyada güçlü araştırma.',[E]],
        ['Universität Heidelberg','Heidelberg','Fizik, kimya ve matematik.',[E,H]],
        ['TUM','München','Fizik ve kimya; Garching araştırma kampüsü.',[E,T]],
        ['Universität Göttingen','Göttingen','Matematik ve fizikte köklü gelenek; Max Planck enstitüleri.',[]],
        ['Universität Jena','Jena','Optik ve fotonik.',[E]]]},
      med:{name:'Tıp',note:'Tıpta üniversite hastanesinin araştırma gücü belirleyicidir. AB dışı adaylar ayrı ve küçük bir kontenjanda yarışır.',list:[
        ['Universität Heidelberg','Heidelberg','Tıp ve kanser araştırmalarında uluslararası bir merkez.',[E,H]],
        ['LMU München','München','Büyük üniversite hastanesi ve geniş araştırma.',[E]],
        ['Charité','Berlin','Avrupa\'nın en büyük üniversite hastanelerinden.',[E]],
        ['TUM','München','Klinik araştırma ve mühendislikle iç içe tıp.',[E,T]],
        ['Universität Freiburg','Freiburg','Köklü tıp fakültesi.',[E,H]],
        ['Universität Tübingen','Tübingen','Nörobilim ve klinik araştırma.',[E,H]],
        ['Universität Hamburg','Hamburg','Uluslararası adaylardan TestAS istiyor.',[E]]]},
      life:{name:'Yaşam bilimleri',note:'Biyoloji ve biyokimyada üniversitenin çevresindeki araştırma enstitüleri staj ve tez fırsatlarını belirler.',list:[
        ['Universität Heidelberg','Heidelberg','EMBL ve Alman Kanser Araştırma Merkezi ile aynı şehirde.',[E,H]],
        ['LMU München','München','Martinsried kampüsünde biyoloji ve biyokimya.',[E]],
        ['TUM','München','Yaşam ve gıda bilimleri, Freising.',[E,T]],
        ['Universität Freiburg','Freiburg','Biyoloji ve biyoteknoloji.',[E,H]],
        ['Universität Göttingen','Göttingen','Max Planck enstitüleriyle yakın çalışma.',[]],
        ['Universität Tübingen','Tübingen','Biyoloji ve nörobilim.',[E,H]]]},
      eco:{name:'İktisat ve işletme',note:'İktisatta araştırma odaklı programlar ile işletmede uygulama odaklı programlar arasında belirgin bir fark vardır.',list:[
        ['Universität Mannheim','Mannheim','İktisat ve işletmede ülkenin önde gelenlerinden.',[H]],
        ['Universität Bonn','Bonn','İktisatta güçlü bir araştırma kümesi (Köln ile birlikte).',[E]],
        ['Universität zu Köln','Köln','İktisat ve işletme.',[E]],
        ['LMU München','München','İktisat ve işletme.',[E]],
        ['Goethe-Universität Frankfurt','Frankfurt','Finans; Avrupa Merkez Bankası\'nın şehri.',[E]],
        ['Humboldt-Universität','Berlin','İktisat ve uygulamalı istatistik.',[E]]]},
      hum:{name:'Beşeri ve sosyal bilimler',note:'Beşeri bilimlerin çoğunda program dili Almancadır; sosyal bilimlerde İngilizce yüksek lisanslar daha yaygındır.',list:[
        ['Freie Universität Berlin','Berlin','Beşeri ve sosyal bilimlerde geniş yelpaze.',[E]],
        ['Humboldt-Universität','Berlin','Felsefe, tarih ve sosyal bilimler.',[E]],
        ['Universität Heidelberg','Heidelberg','Almanya\'nın en eski üniversitesi; beşeri bilimler ve hukuk.',[E,H]],
        ['Universität Tübingen','Tübingen','Felsefe, teoloji ve beşeri bilimler.',[E,H]],
        ['Universität Göttingen','Göttingen','Beşeri bilimlerde köklü gelenek.',[]],
        ['Universität Konstanz','Konstanz','Siyaset ve sosyal bilimler.',[H]]]},
      arch:{name:'Mimarlık',note:'Mimarlık başvurularında portfolyo ya da yetenek sınavı istenebilir; teknik üniversiteler ile sanat ve tasarım okulları farklı yaklaşır.',list:[
        ['TUM','München','Mimarlık ve şehir planlama.',[E,T]],
        ['Universität Stuttgart','Stuttgart','Yapı tasarımı ve hafif yapılar.',[H]],
        ['KIT','Karlsruhe','Mimarlık ve yapı mühendisliği.',[E,H]],
        ['RWTH Aachen','Aachen','Mimarlık ve yapı teknolojisi.',[E]],
        ['TU Berlin','Berlin','Mimarlık ve kent çalışmaları.',[E]],
        ['Bauhaus-Universität Weimar','Weimar','Bauhaus geleneğinde mimarlık ve tasarım.',[]]]}
    };
    const tabs=$('tabs'), unis=$('unis'), note=$('fieldnote');
    function show(key){
      [...tabs.children].forEach(b=>b.setAttribute('aria-selected', b.dataset.k===key ? 'true':'false'));
      const f=F[key];
      unis.textContent='';
      f.list.forEach(([n,c,w,tg])=>{
        const a=document.createElement('article'); a.className='uni';
        const h=document.createElement('header');
        const h4=document.createElement('h4'); h4.textContent=n;
        const sp=document.createElement('span'); sp.className='city'; sp.textContent=c;
        h.append(h4,sp);
        const p=document.createElement('p'); p.textContent=w;
        a.append(h,p);
        if(tg.length){const t=document.createElement('div'); t.className='tags';
          tg.forEach(x=>{const s=document.createElement('span'); s.className='tag'+(x===E?'':' red'); s.textContent=x; t.append(s);}); a.append(t);}
        unis.append(a);
      });
      note.textContent=f.note;
    }
    Object.keys(F).forEach(k=>{
      const b=document.createElement('button'); b.type='button'; b.role='tab'; b.dataset.k=k; b.textContent=F[k].name;
      b.addEventListener('click',()=>show(k));
      tabs.append(b);
    });
    show('eng');
  }

  /* contact form: composes an e-mail in the visitor's mail app; nothing is stored on a server */
  const cf = $('cf');
  if(cf){
    const out = $('cf-out');
    cf.addEventListener('submit', e=>{
      e.preventDefault();
      if(!cf.reportValidity()) return;
      const g = n => (cf.elements[n].value||'').trim();
      const sel = n => { const s=cf.elements[n]; return s.value ? s.options[s.selectedIndex].text : '-'; };
      const body = [
        'Ad: '+g('ad'),
        'E-posta: '+g('eposta'),
        'Şu anki durum: '+sel('durum'),
        'İlgilenilen alan: '+(g('alan')||'-'),
        'Hedef dönem: '+(g('donem')||'-'),
        'Dil seviyesi: '+(g('dil')||'-'),
        '',
        g('mesaj')
      ].join('\n');
      const subject = 'Ön görüşme talebi: '+g('ad');
      const to = cf.dataset.to;
      out.hidden = false;
      out.textContent = '';
      if(!to || to.indexOf('@')<0){
        out.textContent = 'İletişim adresi henüz eklenmedi. Mesajını aşağıdan kopyalayıp sayfadaki iletişim kanallarından birine gönderebilirsin.';
      } else {
        location.href = 'mailto:'+to+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
        out.textContent = 'E-posta uygulaman açılmadıysa aşağıdaki metni kopyalayıp '+to+' adresine gönder.';
      }
      const pre = document.createElement('pre'); pre.textContent = subject+'\n\n'+body; out.append(pre);
    });
  }
})();
