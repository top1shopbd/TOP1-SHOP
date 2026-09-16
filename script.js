const pkgs=document.querySelectorAll('.package');let selected=null,method=null;
const uid=document.querySelector('#uid');uid.addEventListener('input',()=>document.querySelector('#summaryUid').textContent=uid.value.trim()||'—');
pkgs.forEach(b=>b.addEventListener('click',()=>{pkgs.forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selected=b;document.querySelector('#selected').textContent=b.dataset.type==='Diamond'?b.dataset.amount+' 💎':b.dataset.type;document.querySelector('#total').textContent='৳'+b.dataset.price}));
document.querySelector('#order').addEventListener('click',()=>{if(!uid.value.trim())return alert('Please enter your Player ID / UID.');if(!selected)return alert('Please select a package.');document.querySelector('#payment').classList.remove('hidden');document.querySelector('#payment').scrollIntoView({behavior:'smooth',block:'center'})});
document.querySelectorAll('.pay button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.pay button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');method=b.dataset.method;document.querySelector('#method').textContent=method}));
document.querySelector('#pay').addEventListener('click',()=>{if(!method)return alert('Please select bKash or Nagad.');alert('Demo payment successful! No real money was charged.')});

// UID -> Player Name check
const checkNameBtn=document.querySelector('#checkName');
const nameResult=document.querySelector('#nameResult');
checkNameBtn.addEventListener('click',async()=>{
 const playerUid=uid.value.trim();
 if(!/^\d{5,15}$/.test(playerUid)){nameResult.className='name-result error';nameResult.style.display='block';nameResult.textContent='Please enter a valid Player UID (5–15 digits).';return;}
 checkNameBtn.disabled=true; checkNameBtn.textContent='Checking...'; nameResult.className='name-result'; nameResult.style.display='block'; nameResult.textContent='Checking player name...';
 try{
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),10000);
  const url='https://free-ff-api-src-5plp.onrender.com/api/v1/account?region=BD&uid='+encodeURIComponent(playerUid);
  const response=await fetch(url,{headers:{Accept:'application/json'},signal:controller.signal}); clearTimeout(timer);
  if(!response.ok) throw new Error('API unavailable');
  const data=await response.json();
  const info=data.basicInfo||data.basicinfo||data.data?.basicInfo||data.data?.basicinfo||{};
  const playerName=info.nickname||info.nickName||data.nickname||data.name;
  const level=info.level||info.Level;
  if(!playerName) throw new Error('Player not found');
  nameResult.className='name-result ok'; nameResult.innerHTML='🎮 <b>Game Name:</b> '+escapeName(String(playerName))+(level?' &nbsp;•&nbsp; <b>Level:</b> '+escapeName(String(level)):'');
 }catch(err){
  nameResult.className='name-result error';
  nameResult.textContent=err.name==='AbortError'?'Name check timed out. Please try again.':'Name could not be found. Check UID or try again later.';
 }finally{checkNameBtn.disabled=false;checkNameBtn.textContent='🔍 Check Name';}
});
function escapeName(value){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
