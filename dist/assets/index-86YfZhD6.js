(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerPolicy&&(s.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?s.credentials="include":t.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(t){if(t.ep)return;t.ep=!0;const s=n(t);fetch(t.href,s)}})();class y{constructor(e=[]){this.board=Array(10).fill().map(()=>Array(10).fill("")),this.ships=e,this.shipPositions=[],this.placeShips()}placeShips(){this.ships.forEach(e=>{let n=!1;for(;!n;){const r=Math.floor(Math.random()*10),t=Math.floor(Math.random()*10);this.canPlaceShip(e,r,t)&&(this.setShip(e,r,t),this.shipPositions.push(Array.from({length:e.length},(s,o)=>[r,t+o])),n=!0)}})}canPlaceShip(e,n,r){if(r+e.length>10)return!1;for(let t=0;t<e.length;t++)if(this.board[n][r+t]!=="")return!1;return!0}setShip(e,n,r){for(let t=0;t<e.length;t++)this.board[n][r+t]="O"}getShipAt(e,n){const r=this.shipPositions.findIndex(t=>t.some(([s,o])=>s===e&&o===n));return r!==-1?this.ships[r]:null}allShipsSunk(){return this.ships.every(e=>e.isSunk())}}class m{constructor(e,n){this.name=e,this.gameboard=new y(n)}getName(){return this.name}getGameboard(){return this.gameboard}}class i{constructor(e){this.length=e,this.hits=0,this.sunk=!1}hit(){this.hits+=1,this.hits===this.length&&(this.sunk=!0)}isSunk(){return this.sunk}}class f{static createDivs(e,n,r){for(let t=0;t<e;t++)for(let s=0;s<e;s++){const o=document.createElement("div");o.dataset.value=r.getGameboard().board[t][s],o.dataset.row=t,o.dataset.col=s,o.innerHTML="",n.appendChild(o),o.addEventListener("click",()=>{n===p()&&this.handleCompGridClick(o,r)})}}static handleCompGridClick(e,n){if(e.dataset.clicked)return;e.dataset.clicked=!0;const r=parseInt(e.dataset.row),t=parseInt(e.dataset.col);if(e.dataset.value==="")e.style.backgroundColor="red";else if(e.dataset.value==="O"){e.style.backgroundColor="green";const s=n.getGameboard().getShipAt(r,t);if(s&&(s.hit(),console.log(`Ship of length ${s.length} was hit!`),s.isSunk())){console.log(`Ship of length ${s.length} has sunk!`);const o=n.getGameboard().shipPositions.find(d=>d.some(([h,a])=>h===r&&a===t));o&&o.forEach(([d,h])=>{const a=p().querySelector(`[data-row="${d}"][data-col="${h}"]`);a&&(a.style.backgroundColor="gold",a.dataset.clicked=!0)})}}e.style.pointerEvents="none",n.getGameboard().allShipsSunk()&&this.endGame()}static endGame(){const e=document.createElement("div");e.className="modal-overlay";const n=document.createElement("div");n.className="modal-content",n.innerHTML=`
                <p>Game Over!</p>
                <button id="restart">Restart</button>
            `,e.appendChild(n),document.getElementById("app").appendChild(e),document.getElementById("restart").addEventListener("click",()=>{location.reload()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&e.remove()})}}const S=[new i(6),new i(5),new i(4),new i(3),new i(2)],v=[new i(6),new i(5),new i(4),new i(3),new i(2)],w=new m("Johnny",S),b=new m("Computer",v),g=document.querySelector("main"),u=document.createElement("div"),l=document.createElement("div");u.className="game_grid";l.className="game_grid";f.createDivs(10,u,w);f.createDivs(10,l,b);g.appendChild(u);g.appendChild(l);function p(){return l}
