const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
const ids = ['photoPackage','dronePhotoPackage','videoPackage','socialQty','stagingQty','declutterQty','renoQty','rushPhotos','rushVideo','discountDollars','discountPercent','travelFee','customName','customAmount','notes'];
const el = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const rates = { social:250, staging:150, declutter:200, reno:350, rushPhotos:250, rushVideo:500 };
function val(id){ return Number(el[id].value) || 0; }
function qty(id){ return Math.max(0, Math.floor(val(id))); }
function selectedLabel(id){ return el[id].options[el[id].selectedIndex].text.split(' - ')[0]; }
function add(items,name,amount){ if(Number(amount)) items.push({name, amount:Number(amount)}); }
function calculate(){
  const items = [];
  add(items, `Property Photos: ${selectedLabel('photoPackage')}`, val('photoPackage'));
  add(items, `Drone Photos: ${selectedLabel('dronePhotoPackage')}`, val('dronePhotoPackage'));
  add(items, `Property Video: ${selectedLabel('videoPackage')}`, val('videoPackage'));
  add(items, `Social Media Package × ${qty('socialQty')}`, qty('socialQty') * rates.social);
  add(items, `Virtual Staging × ${qty('stagingQty')}`, qty('stagingQty') * rates.staging);
  add(items, `Virtual Decluttering × ${qty('declutterQty')}`, qty('declutterQty') * rates.declutter);
  add(items, `Virtual Renovation × ${qty('renoQty')}`, qty('renoQty') * rates.reno);
  if(el.rushPhotos.checked) add(items, 'Rush Photos', rates.rushPhotos);
  if(el.rushVideo.checked) add(items, 'Rush Video', rates.rushVideo);
  add(items, 'Travel Fee - over 10 miles', val('travelFee'));
  add(items, el.customName.value.trim() || 'Custom Line Item', val('customAmount'));

  const subtotal = items.reduce((sum,item) => sum + item.amount, 0);
  const dollars = Math.min(subtotal, Math.max(0, val('discountDollars')));
  const percent = Math.max(0, subtotal - dollars) * Math.min(100, Math.max(0, val('discountPercent'))) / 100;
  if(dollars) items.push({name:'Discount $', amount:-dollars});
  if(percent) items.push({name:`Discount ${val('discountPercent')}%`, amount:-percent});
  const total = subtotal - dollars - percent;

  document.getElementById('lineItems').innerHTML = items.length
    ? items.map(i => `<div class="line"><span>${i.name}</span><strong>${money(i.amount)}</strong></div>`).join('')
    : '<div class="line"><span>No items selected</span><strong>$0</strong></div>';
  document.getElementById('total').textContent = money(total);
  return {items,total};
}
ids.forEach(id => { el[id].addEventListener('input', calculate); el[id].addEventListener('change', calculate); });
document.getElementById('printBtn').addEventListener('click', () => window.print());
document.getElementById('resetBtn').addEventListener('click', () => {
  document.querySelectorAll('input, textarea').forEach(input => {
    if(input.type === 'checkbox') input.checked = false;
    else input.value = input.type === 'number' ? 0 : '';
  });
  document.querySelectorAll('select').forEach(select => select.value = 0);
  calculate();
});
document.getElementById('copyBtn').addEventListener('click', async () => {
  const q = calculate();
  const notes = el.notes.value.trim();
  const text = ['Four One Five Visuals Quote', ...q.items.map(i => `${i.name}: ${money(i.amount)}`), `Total: ${money(q.total)}`, notes ? `Notes: ${notes}` : ''].filter(Boolean).join('\n');
  try { await navigator.clipboard.writeText(text); } catch(e) {}
  const btn = document.getElementById('copyBtn');
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = 'Copy Quote', 1200);
});
calculate();
