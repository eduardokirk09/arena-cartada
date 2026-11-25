document.addEventListener('DOMContentLoaded', () => {
  const hierarquia = [
    { texto: 'A', valor: 1 },
    { texto: '2', valor: 2 },
    { texto: '3', valor: 3 },
    { texto: '4', valor: 4 },
    { texto: '5', valor: 5 },
    { texto: '6', valor: 6 },
    { texto: '7', valor: 7 },
    { texto: '8', valor: 8 },
    { texto: '9', valor: 9 },
    { texto: '10', valor: 10 },
    { texto: 'J', valor: 11 },
    { texto: 'Q', valor: 12 },
    { texto: 'K', valor: 13 }
  ];
  const naipes = ['♥', '♦'];

  let bolo = [];
  let noveCartas = [];
  let indiceSelecionado = null;
  let jogoAcabou = false;
  const gradeMesa = document.getElementById('grade-mesa');
  const espacoSorteada = document.getElementById('espaco-sorteada');
  const numVidas = document.getElementById('num-vidas');
  const numRestantes = document.getElementById('num-restantes');
  const textoStatus = document.getElementById('texto-status');
  const btnMaior = document.getElementById('btn-maior');
  const btnMenor = document.getElementById('btn-menor');
  const btnReiniciar = document.getElementById('btn-reiniciar');
  function criarBaralho() {
    const lista = [];
    for (let i = 0; i < 3; i++) {
      const naipeAtual = naipes[i % 2];
      for (const item of hierarquia) {
        lista.push({ texto: item.texto, valor: item.valor, naipe: naipeAtual });
      }
    }
    for (let i = 2; i <= 6; i++) {
      lista.push({ texto: String(i), valor: i, naipe: '♦' });
    }
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
  }
  function desenharMesa() {
    gradeMesa.innerHTML = '';
    let vidasAtivas = 0;

    noveCartas.forEach((slot, index) => {
      const divCarta = document.createElement('div');

      if (!slot.viva) {
        divCarta.className = 'carta carta-morta';
        divCarta.innerHTML = '<span class="xis">✕</span>';
      } else {
        vidasAtivas++;
        divCarta.className = 'carta carta-vermelha';
        if (indiceSelecionado === index) {
          divCarta.classList.add('selecionada');
        }

        divCarta.innerHTML = `
          <span class="valor">${slot.carta.texto}</span>
          <span class="naipe">${slot.carta.naipe}</span>
        `;
        divCarta.addEventListener('click', () => {
          if (jogoAcabou) return;
          indiceSelecionado = index;
          btnMaior.disabled = false;
          btnMenor.disabled = false;
          textoStatus.textContent = `Carta [${slot.carta.texto}${slot.carta.naipe}] escolhida! A próxima do bolo será MAIOR ou MENOR que ${slot.carta.texto}?`;
          desenharMesa();
        });
      }

      gradeMesa.appendChild(divCarta);
    });

    numVidas.textContent = vidasAtivas;
    numRestantes.textContent = bolo.length;
    if (vidasAtivas === 0) {
      jogoAcabou = true;
      textoStatus.textContent = 'FIM DE JOGO! Você perdeu todas as 9 vidas.';
      btnMaior.disabled = true;
      btnMenor.disabled = true;
    } else if (bolo.length === 0) {
      jogoAcabou = true;
      textoStatus.textContent = `PARABÉNS! Você zerou o baralho com ${vidasAtivas} vida(s) sobrando!`;
      btnMaior.disabled = true;
      btnMenor.disabled = true;
    }
  }
  function fazerJogada(escolha) {
    if (indiceSelecionado === null || jogoAcabou || bolo.length === 0) return;

    const cartaDaMesa = noveCartas[indiceSelecionado].carta;
    const cartaPuxada = bolo.pop(); // Tira 1 carta do bolo
    espacoSorteada.innerHTML = `
      <div class="carta carta-vermelha" style="cursor: default;">
        <span class="valor">${cartaPuxada.texto}</span>
        <span class="naipe">${cartaPuxada.naipe}</span>
      </div>
    `;

    let acertou = false;
    if (escolha === 'maior' && cartaPuxada.valor > cartaDaMesa.valor) {
      acertou = true;
    } else if (escolha === 'menor' && cartaPuxada.valor < cartaDaMesa.valor) {
      acertou = true;
    }

    if (acertou) {
      noveCartas[indiceSelecionado].carta = cartaPuxada;
      textoStatus.textContent = `ACERTOU! Saiu ${cartaPuxada.texto}${cartaPuxada.naipe}. Escolha outra carta para continuar.`;
    } else {
      noveCartas[indiceSelecionado].viva = false;
      if (cartaPuxada.valor === cartaDaMesa.valor) {
        textoStatus.textContent = `EMPATOU (${cartaPuxada.texto} com ${cartaDaMesa.texto})! Empate perde uma vida.`;
      } else {
        textoStatus.textContent = `ERROU! Saiu ${cartaPuxada.texto}${cartaPuxada.naipe}. Você perdeu essa carta!`;
      }
    }
    indiceSelecionado = null;
    btnMaior.disabled = true;
    btnMenor.disabled = true;
    desenharMesa();
  }
  function iniciarPartida() {
    bolo = criarBaralho();
    noveCartas = [];
    indiceSelecionado = null;
    jogoAcabou = false;
    for (let i = 0; i < 9; i++) {
      noveCartas.push({
        carta: bolo.pop(),
        viva: true
      });
    }

    espacoSorteada.innerHTML = '<div class="carta carta-vazia">?</div>';
    textoStatus.textContent = 'Clique em uma das 9 cartas da esquerda para fazer sua aposta.';
    btnMaior.disabled = true;
    btnMenor.disabled = true;

    desenharMesa();
  }
  btnMaior.addEventListener('click', () => fazerJogada('maior'));
  btnMenor.addEventListener('click', () => fazerJogada('menor'));
  btnReiniciar.addEventListener('click', iniciarPartida);
  iniciarPartida();
});