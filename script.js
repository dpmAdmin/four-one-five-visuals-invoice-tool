const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n || 0);
const ids = ['photoPackage','videoPackage','socialQty','stagingQty','declutterQty','renoQty','rushPhotos','rushVideo','discountDollars','discountPercent','travelFee','customName','customAmount','notes'];
const el = Object.fromEntries(ids.map(id=>[id,document.getElementById(id)]));
const rates = {social:250, staging:150, declutter:200, reno:350, rushPhotos:250, rushVideo:500};
function val(id){return Number(el[id].value)||0}
function qty(id){return Math.max(0, Math.floor(val(id)))}
function add(items, name, amount){ if(amount) items.push({name, amount}); }
function calculate(){
  const items=[];
  const photo = val('photoPackage');
  const video = val('videoPackage');
  const photoText = el.photoPackage.options[el.photoPackage.selectedIndex].text.split(' — ')[0];
  const videoText = el.videoPackage.options[el.videoPackage.selectedIndex].text.split(' — ')[0];
  add(items, `Property Photos: ${photoText}`, photo);
  add(items, `Property Video: ${videoText}`, video);
  add(items, `Social Media Package × ${qty('socialQty')}`, qty('socialQty')*rates.social);
  add(items, `Virtual Staging × ${qty('stagingQty')}`, qty('stagingQty')*rates.staging);
  add(items, `Virtual Decluttering × ${qty('declutterQty')}`, qty('declutterQty')*rates.declutter);
  add(items, `Virtual Renovation × ${qty('renoQty')}`, qty('renoQty')*rates.reno);
  if(el.rushPhotos.checked) add(items,'Rush Photos',rates.rushPhotos);
  if(el.rushVideo.checked) add(items,'Rush Video',rates.rushVideo);
  add(items,'Travel Fee - over 10 miles',val('travelFee'));
  const customName = el.customName.value.trim() || 'Custom Line Item';
  add(items,customName,val('customAmount'));
  const subtotal = items.reduce((s,i)=>s+i.amount,0);
  const dollarDiscount = Math.min(subtotal, val('discountDollars'));
  const percentDiscount = Math.max(0, subtotal - dollarDiscount) * Math.min(100,val('discountPercent')) / 100;
  if(dollarDiscount) items.push({name:'Discount $', amount:-dollarDiscount});
  if(percentDiscount) items.push({name:`Discount ${val('discountPercent')}%`, amount:-percentDiscount});
  const total = subtotal - dollarDiscount - percentDiscount;
  document.getElementById('lineItems').innerHTML = items.length ? items.map(i=>`<div class="line"><span>${i.name}</span><strong>${money(i.amount)}</strong></div>`).join('') : '<div class="line"><span>No items selected</span><strong>$0</strong></div>';
  document.getElementById('total').textContent = money(total);
  return {items,total};
}
ids.forEach(id=>el[id].addEventListener('input',calculate));
ids.forEach(id=>el[id].addEventListener('change',calculate));
document.getElementById('printBtn').addEventListener('click',()=>window.print());
document.getElementById('resetBtn').addEventListener('click',()=>{document.querySelectorAll('input,textarea').forEach(i=>{if(i.type==='checkbox')i.checked=false;else i.value=i.type==='number'?0:''}); document.querySelectorAll('select').forEach(s=>s.value=0); calculate();});
document.getElementById('copyBtn').addEventListener('click',async()=>{const q=calculate(); const notes=el.notes.value.trim(); const text=['Four One Five Visuals Quote',...q.items.map(i=>`${i.name}: ${money(i.amount)}`),`Total: ${money(q.total)}`, notes?`Notes: ${notes}`:''].filter(Boolean).join('\n'); await navigator.clipboard.writeText(text); document.getElementById('copyBtn').textContent='Copied!'; setTimeout(()=>document.getElementById('copyBtn').textContent='Copy Quote',1200);});
calculate();
