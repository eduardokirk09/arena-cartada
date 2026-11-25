const canvas = document.querySelector('#fut-campo');
const ctx = canvas.getContext('2d');
const tela = document.querySelector('#fut-tela');
const telaTitulo = document.querySelector('#fut-tela-titulo');
const telaTexto = document.querySelector('#fut-tela-texto');
const botaoSom = document.querySelector('#fut-btn-som');
const relogio = document.querySelector('#fut-relogio');
const regra = document.querySelector('#fut-regra');
const golsNaTela = document.querySelectorAll('.fut-gols');
const botoesPrincipais = document.querySelectorAll('#fut-btn-tela, #fut-btn-jogar');
const LIMITE_GOLS = 3;
const LIMITE_TEMPO = 3 * 60 * 60;
const DURACAO_GOL = 2 * 60;
const ACELERACAO = 0.1;
const ACELERACAO_CHUTANDO = 0.07;
const FORCA_CHUTE = 5;
const ALCANCE_CHUTE = 4;
const RECARGA_CHUTE = 8;
const CAMPO_X = 370;
const CAMPO_Y = 170;
const GOL_META = 64;
const LIMITE_X = 420;
const LIMITE_Y = 200;
const RAIO_CIRCULO = 75;
const COR_VERMELHO = '#e56e56';
const COR_AZUL = '#5689e5';
const COR_GRAMA = '#718c5a';
const COR_FORA = '#4a6340';
const COR_LINHA = '#c7e6bd';
const LARGURA = 860;
const ALTURA = 420;
const ESCALA = 2;
canvas.width = LARGURA * ESCALA;
canvas.height = ALTURA * ESCALA;
function criarDisco(x, y, raio, invMass, quique, damping) {
  return { x: x, y: y, vx: 0, vy: 0, r: raio, invMass: invMass, quique: quique, damping: damping };
}
const bola = criarDisco(0, 0, 10, 1, 0.5, 0.99);
function criarJogador(nome, numero, cor, teclas) {
  const j = criarDisco(0, 0, 15, 0.5, 0.5, 0.96);
  j.nome = nome;
  j.numero = numero;
  j.cor = cor;
  j.teclas = teclas;
  j.segurandoChute = false;
  j.chuteTravado = false;
  j.recarga = 0;
  return j;
}
const jogadores = [
  criarJogador('Jogador 1', '1', COR_VERMELHO,
    { cima: 'KeyW', baixo: 'KeyS', esquerda: 'KeyA', direita: 'KeyD', chute: 'Space' }),
  criarJogador('Jogador 2', '2', COR_AZUL,
    { cima: 'ArrowUp', baixo: 'ArrowDown', esquerda: 'ArrowLeft', direita: 'ArrowRight', chute: 'ShiftLeft' })
];
const traves = [
  criarDisco(-CAMPO_X, -GOL_META, 8, 0, 0.5, 1),
  criarDisco(-CAMPO_X, GOL_META, 8, 0, 0.5, 1),
  criarDisco(CAMPO_X, -GOL_META, 8, 0, 0.5, 1),
  criarDisco(CAMPO_X, GOL_META, 8, 0, 0.5, 1)
];
traves[0].cor = traves[1].cor = COR_VERMELHO;
traves[2].cor = traves[3].cor = COR_AZUL;
function pontosDaRede(lado) {
  return [
    [lado * 370, -64], [lado * 380, -64], [lado * 400, -44],
    [lado * 400, 44], [lado * 380, 64], [lado * 370, 64]
  ];
}
const paredes = [];
function criarParede(x1, y1, x2, y2, quique, jogador) {
  paredes.push({ x1: x1, y1: y1, x2: x2, y2: y2, quique: quique, jogador: jogador });
}
criarParede(-CAMPO_X, -CAMPO_Y, CAMPO_X, -CAMPO_Y, 1, false);
criarParede(-CAMPO_X, CAMPO_Y, CAMPO_X, CAMPO_Y, 1, false);
for (const lado of [-1, 1]) {
  criarParede(lado * CAMPO_X, -CAMPO_Y, lado * CAMPO_X, -GOL_META, 1, false);
  criarParede(lado * CAMPO_X, GOL_META, lado * CAMPO_X, CAMPO_Y, 1, false);
  const p = pontosDaRede(lado);
  for (let i = 0; i < p.length - 1; i++) {
    criarParede(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], 0.1, true);
  }
}
let estado = 'inicio';
let pausado = false;
let gols = [0, 0];
let passosDeJogo = 0;
let prorrogacao = false;
let quemSaca = 0;
let contagemGol = 0;
let ultimoGol = -1;
let vencedor = -1;
const teclasApertadas = {};
const TECLAS_DO_JOGO = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'];
function partidaAtiva() {
  return estado === 'saque' || estado === 'jogando' || estado === 'gol';
}
window.addEventListener('keydown', function (e) {
  if (partidaAtiva() && TECLAS_DO_JOGO.includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  teclasApertadas[e.code] = true;
  if (e.code === 'Enter') {
    e.preventDefault();
    acaoPrincipal();
  }
  if (e.code === 'KeyP' || e.code === 'Escape') alternarPausa();
  if (e.code === 'KeyR') novaPartida();
  if (e.code === 'KeyM') alternarSom();
  for (const j of jogadores) {
    if (e.code === j.teclas.chute || (j.numero === '2' && e.code === 'ShiftRight')) j.segurandoChute = true;
  }
});
window.addEventListener('keyup', function (e) {
  if (e.code === 'Space') e.preventDefault();
  teclasApertadas[e.code] = false;
  for (const j of jogadores) {
    if (e.code === j.teclas.chute || (j.numero === '2' && e.code === 'ShiftRight')) {
      j.segurandoChute = false;
      j.chuteTravado = false;
    }
  }
});
window.addEventListener('blur', function () {
  if (partidaAtiva() && !pausado) alternarPausa();
});
function soltarTeclas() {
  for (const tecla in teclasApertadas) teclasApertadas[tecla] = false;
  for (const j of jogadores) {
    j.segurandoChute = false;
    j.chuteTravado = false;
  }
}
function direcaoDoJogador(j) {
  let x = (teclasApertadas[j.teclas.direita] ? 1 : 0) - (teclasApertadas[j.teclas.esquerda] ? 1 : 0);
  let y = (teclasApertadas[j.teclas.baixo] ? 1 : 0) - (teclasApertadas[j.teclas.cima] ? 1 : 0);
  if (x !== 0 && y !== 0) {
    x *= Math.SQRT1_2;
    y *= Math.SQRT1_2;
  }
  return { x: x, y: y };
}
function colidirDiscos(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distancia = Math.hypot(dx, dy);
  const somaDosRaios = a.r + b.r;
  if (distancia >= somaDosRaios || distancia === 0) return;
  const nx = dx / distancia;
  const ny = dy / distancia;
  const parteDeA = a.invMass / (a.invMass + b.invMass);
  const sobra = somaDosRaios - distancia;
  a.x += nx * sobra * parteDeA;
  a.y += ny * sobra * parteDeA;
  b.x -= nx * sobra * (1 - parteDeA);
  b.y -= ny * sobra * (1 - parteDeA);
  const aproximacao = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  if (aproximacao >= 0) return;
  const impulso = aproximacao * (a.quique * b.quique + 1);
  a.vx -= nx * impulso * parteDeA;
  a.vy -= ny * impulso * parteDeA;
  b.vx += nx * impulso * (1 - parteDeA);
  b.vy += ny * impulso * (1 - parteDeA);
}
function colidirDiscoParede(d, p) {
  const ex = p.x2 - p.x1;
  const ey = p.y2 - p.y1;
  let t = ((d.x - p.x1) * ex + (d.y - p.y1) * ey) / (ex * ex + ey * ey);
  t = Math.max(0, Math.min(1, t));
  const dx = d.x - (p.x1 + ex * t);
  const dy = d.y - (p.y1 + ey * t);
  const distancia = Math.hypot(dx, dy);
  if (distancia >= d.r || distancia === 0) return;
  const nx = dx / distancia;
  const ny = dy / distancia;
  d.x += nx * (d.r - distancia);
  d.y += ny * (d.r - distancia);
  const batida = d.vx * nx + d.vy * ny;
  if (batida >= 0) return;
  const impulso = batida * (d.quique * p.quique + 1);
  d.vx -= nx * impulso;
  d.vy -= ny * impulso;
}
function colidirComLimites(d) {
  const q = d.quique * 0.1;
  if (d.x < -LIMITE_X + d.r) {
    d.x = -LIMITE_X + d.r;
    if (d.vx < 0) d.vx = -d.vx * q;
  }
  if (d.x > LIMITE_X - d.r) {
    d.x = LIMITE_X - d.r;
    if (d.vx > 0) d.vx = -d.vx * q;
  }
  if (d.y < -LIMITE_Y + d.r) {
    d.y = -LIMITE_Y + d.r;
    if (d.vy < 0) d.vy = -d.vy * q;
  }
  if (d.y > LIMITE_Y - d.r) {
    d.y = LIMITE_Y - d.r;
    if (d.vy > 0) d.vy = -d.vy * q;
  }
}
function tentarChutar(j) {
  if (!j.segurandoChute || j.chuteTravado || j.recarga > 0) return;
  const dx = bola.x - j.x, dy = bola.y - j.y;
  const distancia = Math.hypot(dx, dy);
  if (distancia === 0 || distancia - (j.r + bola.r) >= ALCANCE_CHUTE) return;
  bola.vx += (dx / distancia) * FORCA_CHUTE * bola.invMass;
  bola.vy += (dy / distancia) * FORCA_CHUTE * bola.invMass;
  j.chuteTravado = true;
  j.recarga = RECARGA_CHUTE;
  tocar(300, 90, 0.12, 'triangle', 0.2);
}
function passoDeFisica() {
  for (const j of jogadores) {
    const direcao = direcaoDoJogador(j);
    const aceleracao = j.segurandoChute ? ACELERACAO_CHUTANDO : ACELERACAO;
    j.vx += direcao.x * aceleracao;
    j.vy += direcao.y * aceleracao;
    if (j.recarga > 0) j.recarga--;
  }
  jogadores.forEach(tentarChutar);
  for (const d of [bola, jogadores[0], jogadores[1]]) {
    d.x += d.vx;
  d.y += d.vy;
    d.vx *= d.damping;
    d.vy *= d.damping;
  }
  colidirDiscos(jogadores[0], jogadores[1]);
  for (const j of jogadores) colidirDiscos(j, bola);
  for (const trave of traves) {
    colidirDiscos(bola, trave);
    colidirDiscos(jogadores[0], trave);
    colidirDiscos(jogadores[1], trave);
  }
  for (const parede of paredes) {
    colidirDiscoParede(bola, parede);
    if (parede.jogador) {
      colidirDiscoParede(jogadores[0], parede);
      colidirDiscoParede(jogadores[1], parede);
    }
  }
  for (const d of [bola, jogadores[0], jogadores[1]]) colidirComLimites(d);
  if (estado === 'saque') aplicarRegrasDoSaque();
  atualizarRegras();
}
function reposicionar() {
  jogadores[0].x = -170;
  jogadores[1].x = 170;
  for (const j of jogadores) {
    j.y = 0;
    j.vx = 0;
    j.vy = 0;
    j.recarga = 0;
    j.chuteTravado = false;
  }
  bola.x = 0;
  bola.y = 0;
  bola.vx = 0;
  bola.vy = 0;
}
function aplicarRegrasDoSaque() {
  jogadores.forEach(function (j, time) {
    if (time === 0 && j.x > -j.r) {
      j.x = -j.r;
      j.vx = Math.min(j.vx, 0);
    }
    if (time === 1 && j.x < j.r) {
      j.x = j.r;
      j.vx = Math.max(j.vx, 0);
    }
    const distancia = Math.hypot(j.x, j.y);
    const minimo = RAIO_CIRCULO + j.r;
    if (time !== quemSaca && distancia < minimo) {
      const nx = distancia === 0 ? (time === 0 ? -1 : 1) : j.x / distancia;
      const ny = distancia === 0 ? 0 : j.y / distancia;
      j.x = nx * minimo;
      j.y = ny * minimo;
      j.vx = j.vy = 0;
    }
  });
}
function atualizarRegras() {
  if (estado === 'saque' && (bola.x !== 0 || bola.y !== 0)) estado = 'jogando';
  if (estado === 'jogando') {
    passosDeJogo++;
    if (bola.x > CAMPO_X && Math.abs(bola.y) < GOL_META) {
      marcarGol(0);
      return;
    }
    if (bola.x < -CAMPO_X && Math.abs(bola.y) < GOL_META) {
      marcarGol(1);
      return;
    }
    if (!prorrogacao && passosDeJogo >= LIMITE_TEMPO) {
      if (gols[0] === gols[1]) {
        prorrogacao = true;
        tocar(2000, 2250, 0.3, 'sine', 0.07);
      } else {
        vencedor = gols[0] > gols[1] ? 0 : 1;
        estado = 'fim';
        mostrarTela();
      }
    }
  } else if (estado === 'gol') {
    contagemGol--;
    if (contagemGol > 0) return;
    if (vencedor >= 0) {
      estado = 'fim';
    } else {
      reposicionar();
      quemSaca = 1 - ultimoGol;
      estado = 'saque';
    }
    mostrarTela();
  }
}
function marcarGol(time) {
  gols[time]++;
  ultimoGol = time;
  estado = 'gol';
  contagemGol = DURACAO_GOL;
  if (gols[time] >= LIMITE_GOLS || prorrogacao) vencedor = time;
  [523, 659, 784, 1047].forEach(function (frequencia, i) {
    tocar(frequencia, frequencia, 0.18, 'square', 0.06, i * 0.11);
  });
}
function novaPartida() {
  gols = [0, 0];
  passosDeJogo = 0;
  prorrogacao = false;
  vencedor = -1;
  ultimoGol = -1;
  quemSaca = 0;
  pausado = false;
  reposicionar();
  estado = 'saque';
  mostrarTela();
}
function alternarPausa() {
  if (!partidaAtiva()) return;
  pausado = !pausado;
  if (pausado) soltarTeclas();
  mostrarTela();
}
function acaoPrincipal() {
  if (estado === 'inicio' || estado === 'fim') novaPartida();
  else alternarPausa();
}
let audio = null;
let mudo = false;
function tocar(f0, f1, duracao, tipo, volume, atraso) {
  if (mudo) return;
  audio = audio || new AudioContext();
  if (audio.state === 'suspended') audio.resume();
  const inicio = audio.currentTime + (atraso || 0);
  const oscilador = audio.createOscillator();
  const ganho = audio.createGain();
  oscilador.type = tipo;
  oscilador.frequency.setValueAtTime(f0, inicio);
  oscilador.frequency.exponentialRampToValueAtTime(f1, inicio + duracao);
  ganho.gain.setValueAtTime(volume, inicio);
  ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  oscilador.connect(ganho);
  ganho.connect(audio.destination);
  oscilador.start(inicio);
  oscilador.stop(inicio + duracao);
}
function alternarSom() {
  mudo = !mudo;
  botaoSom.textContent = mudo ? 'Som: desligado' : 'Som: ligado';
}
function desenharCirculo(x, y, raio, corDeDentro, corDaBorda, espessura) {
  ctx.beginPath();
  ctx.arc(x, y, raio, 0, Math.PI * 2);
  ctx.fillStyle = corDeDentro;
  ctx.fill();
  ctx.lineWidth = espessura;
  ctx.strokeStyle = corDaBorda;
  ctx.stroke();
}
function desenharLinha(x1, y1, x2, y2, cor) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = cor;
  ctx.lineWidth = 3;
  ctx.stroke();
}
function desenharRede(lado) {
  ctx.beginPath();
  pontosDaRede(lado).forEach(function (ponto) {
    ctx.lineTo(ponto[0], ponto[1]);
  });
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function desenharCampo() {
  ctx.fillStyle = COR_FORA;
  ctx.fillRect(-LARGURA / 2, -ALTURA / 2, LARGURA, ALTURA);
  ctx.fillStyle = COR_GRAMA;
  ctx.fillRect(-CAMPO_X, -CAMPO_Y, CAMPO_X * 2, CAMPO_Y * 2);
  ctx.strokeStyle = COR_LINHA;
  ctx.lineWidth = 3;
  ctx.strokeRect(-CAMPO_X, -CAMPO_Y, CAMPO_X * 2, CAMPO_Y * 2);
  desenharLinha(0, -CAMPO_Y, 0, CAMPO_Y, COR_LINHA);
  ctx.beginPath();
  ctx.arc(0, 0, RAIO_CIRCULO, 0, Math.PI * 2);
  ctx.stroke();
  desenharRede(-1);
  desenharRede(1);
  desenharLinha(-CAMPO_X, -GOL_META, -CAMPO_X, GOL_META, COR_VERMELHO);
  desenharLinha(CAMPO_X, -GOL_META, CAMPO_X, GOL_META, COR_AZUL);
  for (const trave of traves) desenharCirculo(trave.x, trave.y, trave.r, trave.cor, '#000', 2);
}
function desenharJogador(j) {
  const chutePronto = j.segurandoChute && !j.chuteTravado && j.recarga === 0;
  desenharCirculo(j.x, j.y, j.r, j.cor, chutePronto ? '#fff' : '#000', 3);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';
  ctx.font = '700 15px "Work Sans", sans-serif';
  ctx.fillText(j.numero, j.x, j.y + 1);
  ctx.fillStyle = '#fff';
  ctx.font = '600 11px "Work Sans", sans-serif';
  ctx.fillText(j.nome, j.x, j.y - j.r - 8);
}
function desenharAviso() {
  const texto = ultimoGol === 0 ? 'GOL DO VERMELHO!' : 'GOL DO AZUL!';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 54px "Bricolage Grotesque", sans-serif';
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.strokeText(texto, 0, -110);
  ctx.fillStyle = ultimoGol === 0 ? COR_VERMELHO : COR_AZUL;
  ctx.fillText(texto, 0, -110);
}
function desenhar() {
  ctx.setTransform(ESCALA, 0, 0, ESCALA, (LARGURA / 2) * ESCALA, (ALTURA / 2) * ESCALA);
  desenharCampo();
  desenharCirculo(bola.x, bola.y, bola.r, '#fff', '#000', 2);
  jogadores.forEach(desenharJogador);
  if (estado === 'gol') desenharAviso();
}
function atualizarPlacar() {
  const segundos = Math.floor(passosDeJogo / 60);
  golsNaTela[0].textContent = gols[0];
  golsNaTela[1].textContent = gols[1];
  relogio.textContent = Math.floor(segundos / 60) + ':' + String(segundos % 60).padStart(2, '0');
  relogio.style.color = prorrogacao ? COR_VERMELHO : '';
  regra.textContent = prorrogacao ? 'Prorrogação: próximo gol vence' : LIMITE_GOLS + ' gols ou 3 min';
}
function mostrarTela() {
  tela.hidden = !(pausado || estado === 'inicio' || estado === 'fim');
  let textoDoBotao = 'Pausar';
  if (pausado) {
    telaTitulo.textContent = 'Jogo pausado';
    telaTexto.textContent = 'Placar: ' + gols[0] + ' x ' + gols[1] + '. Aperte Enter, P ou Esc para voltar.';
    textoDoBotao = 'Continuar';
  } else if (estado === 'inicio') {
    telaTitulo.textContent = 'Pronto para o apito?';
    telaTexto.textContent = 'Vermelho ataca o gol da direita, azul ataca o da esquerda.';
    textoDoBotao = 'Começar';
  } else if (estado === 'fim') {
    telaTitulo.textContent = (vencedor === 0 ? 'Vermelho' : 'Azul') + ' venceu!';
    telaTexto.textContent = 'Placar final: ' + gols[0] + ' x ' + gols[1] + '. Aperte Enter para jogar de novo.';
    textoDoBotao = 'Jogar de novo';
  }
  botoesPrincipais.forEach(function (botao) {
    botao.textContent = textoDoBotao;
  });
}
function aoClicar(seletor, funcao) {
  document.querySelectorAll(seletor).forEach(function (botao) {
    botao.addEventListener('click', function () {
      funcao();
      botao.blur();
    });
  });
}
aoClicar('#fut-btn-tela, #fut-btn-jogar', acaoPrincipal);
aoClicar('#fut-btn-reiniciar', novaPartida);
aoClicar('#fut-btn-som', alternarSom);
const MS_POR_PASSO = 1000 / 60;
let ultimoQuadro = performance.now();
let acumulador = 0;
function quadro(agora) {
  acumulador += Math.min(agora - ultimoQuadro, 100);
  ultimoQuadro = agora;
  while (acumulador >= MS_POR_PASSO) {
    if (partidaAtiva() && !pausado) passoDeFisica();
    acumulador -= MS_POR_PASSO;
  }
  desenhar();
  atualizarPlacar();
  requestAnimationFrame(quadro);
}
reposicionar();
mostrarTela();
requestAnimationFrame(quadro);