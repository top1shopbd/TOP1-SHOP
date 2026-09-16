const pkgs=document.querySelectorAll('.package');let selected=null,method=null;
const uid=document.querySelector('#uid');uid.addEventListener('input',()=>document.querySelector('#summaryUid').textContent=uid.value.trim()||'—');
pkgs.forEach(b=>b.addEventListener('click',()=>{pkgs.forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selected=b;document.querySelector('#selected').textContent=b.dataset.type==='Diamond'?b.dataset.amount+' 💎':b.dataset.type;document.querySelector('#total').textContent='৳'+b.dataset.price}));
document.querySelector('#order').addEventListener('click',()=>{if(!uid.value.trim())return alert('Please enter your Player ID / UID.');if(!selected)return alert('Please select a package.');document.querySelector('#payment').classList.remove('hidden');document.querySelector('#payment').scrollIntoView({behavior:'smooth',block:'center'})});
document.querySelectorAll('.pay button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.pay button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');method=b.dataset.method;document.querySelector('#method').textContent=method}));
document.querySelector('#pay').addEventListener('click',()=>{if(!method)return alert('Please select bKash or Nagad.');alert('Demo payment successful! No real money was charged.')});

// UID -> Player Name check
const checkNameBtn=document.querySelector('#checkName');
const nameResult=document.querySelector('#nameResult');

async function fetchJson(url, timeoutMs=12000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(url,{headers:{Accept:'application/json'},signal:controller.signal});
    if(!response.ok) throw new Error('HTTP_'+response.status);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function lookupPlayerName(playerUid){
  // Primary endpoint: documented to accept BD + UID and return basicInfo.nickname.
  const primary='https://free-ff-api-src-5plp.onrender.com/api/v1/account?region=BD&uid='+encodeURIComponent(playerUid);
  try{
    const data=await fetchJson(primary);
    const info=data.basicInfo||data.basicinfo||data.data?.basicInfo||data.data?.basicinfo||{};
    const nickname=info.nickname||info.nickName||data.nickname||data.name;
    if(nickname) return {nickname, level:info.level||info.Level||null};
  }catch(e){}

  // Fallback endpoint: profile lookup by UID.
  const fallback='https://glob-info2.vercel.app/info?uid='+encodeURIComponent(playerUid);
  const data=await fetchJson(fallback);
  const info=data.basicInfo||data.basicinfo||data.AccountInfo||data.accountInfo||data.data?.basicInfo||{};
  const nickname=info.nickname||info.nickName||info.AccountName||data.nickname||data.name;
  if(!nickname) throw new Error('PLAYER_NOT_FOUND');
  return {nickname, level:info.level||info.AccountLevel||info.Level||null};
}

checkNameBtn.addEventListener('click',async()=>{
  const playerUid=uid.value.trim();
  if(!/^\d{5,15}$/.test(playerUid)){
    nameResult.className='name-result error';
    nameResult.style.display='block';
    nameResult.textContent='Please enter a valid Player UID (5–15 digits).';
    return;
  }

  checkNameBtn.disabled=true;
  checkNameBtn.textContent='Checking...';
  nameResult.className='name-result';
  nameResult.style.display='block';
  nameResult.textContent='Checking player name...';

  try{
    const result=await lookupPlayerName(playerUid);
    nameResult.className='name-result ok';
    nameResult.innerHTML='🎮 <b>Game Name:</b> '+escapeName(String(result.nickname))+
      (result.level?' &nbsp;•&nbsp; <b>Level:</b> '+escapeName(String(result.level)):'');
  }catch(err){
    nameResult.className='name-result error';
    nameResult.textContent=err.name==='AbortError'
      ? 'Name check timed out. Please try again.'
      : 'Name could not be found. Check UID or try again later.';
  }finally{
    checkNameBtn.disabled=false;
    checkNameBtn.textContent='🔍 Check Name';
  }
});

function escapeName(value){
  return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}


// Demo Wallet / Add Money
const walletBalanceEl = document.getElementById('walletBalance');
const addMoneyAmountEl = document.getElementById('addMoneyAmount');
const addMoneyBtn = document.getElementById('addMoneyBtn');

let walletBalance = Number(localStorage.getItem('top1shop_wallet_balance') || 0);

function renderWallet(){
  if(walletBalanceEl) walletBalanceEl.textContent = walletBalance.toFixed(0);
}

if(addMoneyBtn){
  addMoneyBtn.addEventListener('click',()=>{
    const amount = Number(addMoneyAmountEl.value);
    if(!Number.isFinite(amount) || amount <= 0){
      alert('Please enter a valid amount.');
      return;
    }
    walletBalance += Math.floor(amount);
    localStorage.setItem('top1shop_wallet_balance', String(walletBalance));
    addMoneyAmountEl.value = '';
    renderWallet();
    alert('Demo Money Added Successfully!\\nWallet Balance: ৳' + walletBalance);
  });
}
renderWallet();


// Wallet payment guard for demo orders
function getSelectedOrderPrice(){
  const selected = document.querySelector('.package-card.selected, .package.selected, [data-selected="true"]');
  if(!selected) return null;
  const priceText = selected.querySelector('.price, .package-price, [data-price]')?.textContent || selected.getAttribute('data-price') || '';
  const match = priceText.replace(/,/g,'').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}


// Demo wallet checkout: deduct the current package price before allowing order.
(function(){
  const orderBtn = document.querySelector('#createOrder, #createDemoOrder, button[type="submit"]');
  if(!orderBtn || orderBtn.dataset.walletGuarded === '1') return;
  orderBtn.dataset.walletGuarded = '1';

  const originalClick = orderBtn.onclick;
  orderBtn.onclick = function(ev){
    const price = getSelectedOrderPrice();
    if(price !== null){
      const balance = Number(localStorage.getItem('top1shop_wallet_balance') || 0);
      if(balance < price){
        ev.preventDefault();
        ev.stopImmediatePropagation();
        alert('Insufficient Wallet Balance.\\nPlease add more Demo Money to your Wallet.');
        return false;
      }
      localStorage.setItem('top1shop_wallet_balance', String(balance - price));
      const walletBalanceEl = document.getElementById('walletBalance');
      if(walletBalanceEl) walletBalanceEl.textContent = String(balance - price);
    }
    if(typeof originalClick === 'function') return originalClick.call(this, ev);
  };
})();
