const toggleBtn = document.getElementById('toggleBtn');
const naviList = document.getElementById('navi-list');

toggleBtn.addEventListener('click', ()=>{
    naviList.classList.toggle('active');
})
