document.addEventListener('DOMContentLoaded', () => {
  const PALAVRAS_COMUNS = [
    "BOLSA", "BARCO", "TERMO", "CARTA", "JOGOS", "ARENA", "LIVRO", "PORTA", "VENTO", "FESTA",
    "PLANO", "TEMPO", "MUNDO", "TERRA", "NOITE", "PRAIA", "VERDE", "CORPO", "FORCA", "GRUPO",
    "PONTO", "FORMA", "VISTA", "CAMPO", "LINHA", "ORDEM", "PAPEL", "VALOR", "PASSO", "FONTE",
    "CAIXA", "BANCO", "LISTA", "CONTA", "MENTE", "MARCA", "SERIE", "CURSO", "IDEIA", "FAIXA",
    "CHAVE", "FILME", "SINAL", "PONTE", "CARRO", "ROUPA", "PRATO", "PEDRA", "PEIXE", "CHUVA",
    "SONHO", "TARDE", "MANHA", "FOLHA", "GALHO", "FRUTA", "LIMAO", "MANGA", "MELAO", "AMORA",
    "TIGRE", "ZEBRA", "COBRA", "AGUIA", "CISNE", "PANDA", "PORCO", "CABRA", "GATOS", "PULGA",
    "MOSCA", "GRILO", "TRIGO", "MILHO", "ARROZ", "AVEIA", "CARNE", "LEITE", "TORTA", "DOCES",
    "CALDO", "MOLHO", "PIZZA", "SUSHI", "PASTA", "VINHO", "SUCOS", "AGUAS", "FOGAO", "FORNO",
    "MESAS", "SOFAS", "CAMAS", "COFRE", "TETOS", "MUROS", "GRADE", "TRAVE", "REDES", "BOLAS",
    "GOLOS", "APITO", "PISTA", "TENIS", "SURFE", "SKATE", "VELAS", "NADAR", "CORRE", "PULAR",
    "JOGAR", "BATER", "CHUTE", "TOQUE", "PASSE", "FALTA", "PENAL", "LANCE", "PLACA", "DADOS",
    "FICHA", "SORTE", "TRUCO", "POKER", "RODAS", "DAMAS", "OUROS", "COPAS", "MAIOR", "MENOR",
    "IGUAL", "VENCE", "PERDE", "VIDAS", "MONTE", "TURNO", "NIVEL", "ETAPA", "FASES", "FINAL",
    "LADOS", "FUNDO", "ATRAS", "ACIMA", "FORAS", "PERTO", "LONGE", "ANTES", "AGORA", "ONTEM",
    "NUNCA", "QUASE", "MUITO", "POUCO", "TANTO", "OUTRO", "MESMO", "CERTO", "FACIL", "LENTO",
    "FORTE", "FRACO", "NOVOS", "VELHO", "JOVEM", "BELOS", "FEIOS", "CLARO", "FRIOS", "CHEIO",
    "VAZIO", "LIMPO", "SUJOS", "RICOS", "POBRE", "FELIZ", "CALMO", "BRAVO", "DOIDO", "SABIO",
    "LOUCO", "SANTO", "JUSTO", "NOBRE", "FIRME", "SOLTO", "PRESO", "LIVRE", "AMIGO", "IRMAO",
    "PRIMO", "FILHO", "NETOS", "NOIVO", "CASAL", "GENTE", "POVOS", "TURMA", "BANDO", "TIMES",
    "CLUBE", "LIGAS", "TACAS", "PRATA", "FERRO", "COBRE", "ZINCO", "LATAO", "VIDRO", "BARRO",
    "GESSO", "TINTA", "CORES", "PRETO", "CINZA", "CORAL", "LOIRO", "RUIVO", "NEGRO", "ALVOS",
    "PARDO", "INDIO", "MITOS", "LENDA", "CONTO", "POEMA", "VERSO", "PROSA", "TEXTO", "FRASE",
    "LETRA", "VOZES", "GRITO", "CANTO", "RUIDO", "RITMO", "SAMBA", "BLUES", "FORRO", "BAILE",
    "DANCA", "PALCO", "CIRCO", "MUSEU", "FEIRA", "LOJAS", "HOTEL", "MOTEL", "BARES", "CAFES",
    "PRACA", "HORTO", "MATOS", "SELVA", "SERRA", "MORRO", "VALES", "GRUTA", "ILHAS", "LAGOA",
    "LAGOS", "MARES", "ONDAS", "BRISA", "TUFAO", "CICLO", "RAIOS", "NEVES", "GEADA", "NEVOA",
    "NUVEM", "SOLAR", "LUNAR", "ASTRO", "COMUM", "PLANA", "COSMO", "ATOMO", "VIRUS", "FUNGO",
    "ALGAS", "FLORA", "FAUNA", "BICHO", "CERVO", "URSOS", "LOBOS", "SIMIO", "RATOS", "FOCAS",
    "MORSA", "POLVO", "LULAS", "SIRIS", "OSTRA", "PAVAO", "GANSO", "PATOS", "GALOS", "PERUS",
    "POMBO", "CORVO", "URUBU", "SAPOS", "CUPIM", "LESMA", "ROSAS", "CRAVO", "LIRIO", "LOTUS",
    "PINHO", "CEDRO", "BAMBU", "PALMA", "FIGOS", "NOZES", "AVELA", "SOJAS", "GRAOS", "NABOS",
    "ALHOS", "JILOS", "COUVE", "SALSA", "LOURO", "BANHA", "CREME", "SOROS", "CLARA", "GEMAS",
    "BIFES", "LOMBO", "BACON", "PEITO", "COXAS", "MOELA", "FILES", "POSTA", "ATUNS", "TRUTA",
    "CACAO", "PESCA", "PACUS", "BAGRE", "CARPA", "BOLOS", "PUDIM", "DOCES", "BALAS", "TRUFA",
    "COCOS", "CURAU", "BEIJU", "CREPE", "PENNE", "SOPAS", "CANJA", "BOBOS", "TUTUS", "PIRAO",
    "PURES", "SHOYU", "GELOS", "VAPOR", "MATES", "CACAU", "CHOPE", "CIDRA", "SAQUE", "VODKA",
    "LICOR", "PINGA", "DRINK", "GEMER", "FALAR", "OUVIR", "OLHAR", "ANDAR", "SUBIR", "CAIRE"
  ];
  const DICIONARIO_LOCAL = new Set([
    ...PALAVRAS_COMUNS,
    "CASAS", "FATOS", "VOTOS", "FOTOS", "MOTOS", "LOTES", "POTES", "BOTES", "DOTES", "DENTE",
    "LENTE", "SENTE", "TENTE", "LENTO", "TENTO", "CENTO", "TONTO", "CRIAI", "FERAS", "VERAS",
    "PERAS", "CERAS", "MERAS", "GERAS", "ZEROS", "HEROI", "FEROZ", "VELOZ", "ATROZ", "CAPAZ",
    "SAGAZ", "TENAZ", "AUDAZ", "FUGAZ", "RAPAZ", "PAZES", "LUZES", "ATRIZ", "NARIZ", "JUIZO",
    "SOCIO", "OCIOS", "MIDIA", "FERIA", "SERIA", "MEDIA", "TEDIO", "ALMAS", "FOGOS", "FLORE",
    "FRUTO", "CASCA", "ERVAS", "GRAMA", "MUSGO", "CACTO", "CIPOS", "ABRIR", "ACHAR", "ADIAR",
    "AGITO", "AJUDA", "ALADO", "ALTAR", "AMADO", "AMBOS", "AMPLO", "ANJOS", "ANUAL", "APOIO",
    "ARAME", "ARCAR", "ARDER", "AREIA", "ARMAS", "AROMA", "artes", "ASPAS", "ASSAR", "ATADO",
    "ATIVA", "ATIVO", "ATLAS", "ATUAL", "AUDIO", "AULAS", "AUTOR", "AVIAO", "AVISO", "AZEDO",
    "AZUIS", "BACIA", "BALDE", "BALSA", "BAMBA", "BANDA", "BANHO", "BARBA", "BARRO", "BASTA",
    "BEBER", "BEIJO", "BEIRA", "BICAR", "BICOS", "BLOCO", "BLUSA", "BOCAS", "BODAS", "BOIAR",
    "BOLHA", "BOLSO", "BOMBA", "BONDE", "BONES", "BORDA", "BOTAO", "BOTAR", "BOTAS", "BRACO",
    "BRASA", "BREVE", "BRIGA", "BRUTO", "BUCHA", "BUQUE", "BURRO", "BUSCA", "CABER", "CABOS",
    "CACAR", "CACHO", "CAIXA", "CALCA", "CALMA", "CALOR", "CALVO", "CANAL", "CANOA", "CANOS",
    "CAPAS", "CAPIM", "CAPUZ", "CARAS", "CARGA", "CAROS", "CASAR", "CASCO", "CASOS", "CAUDA",
    "CAUSA", "CAVAR", "CEDER", "CEGOS", "CEIAS", "CENAS", "CENSO", "CERCA", "CERCO", "CESTO",
    "CETIM", "CHAMA", "CHAPA", "CHATO", "CHEFE", "CHEIA", "CHICOTE".slice(0,5), "CHORO", "CHAVE"
  ].map(p => p.toUpperCase()).filter(p => p.length === 5));

  const MAX_TENTATIVAS = 6;
  const TAMANHO_PALAVRA = 5;

  let palavraSecreta = "";
  let linhaAtual = 0;
  let colunaAtual = 0;
  let tentativas = [];
  let jogoEncerrado = false;
  let validandoPalavra = false;

  const gradeEl = document.getElementById('grade-termo');
  const statusEl = document.getElementById('mensagem-status');
  const btnNovo = document.getElementById('btn-novo');
  const botoesTeclado = document.querySelectorAll('.teclado button');

  function normalizar(texto) {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  function sortearPalavra() {
    const idx = Math.floor(Math.random() * PALAVRAS_COMUNS.length);
    return normalizar(PALAVRAS_COMUNS[idx]);
  }

  function criarGrade() {
    gradeEl.innerHTML = '';
    tentativas = Array.from({ length: MAX_TENTATIVAS }, () => Array(TAMANHO_PALAVRA).fill(''));

    for (let l = 0; l < MAX_TENTATIVAS; l++) {
      const linhaDiv = document.createElement('div');
      linhaDiv.className = 'linha-grade';
      linhaDiv.id = `linha-${l}`;

      for (let c = 0; c < TAMANHO_PALAVRA; c++) {
        const celulaDiv = document.createElement('div');
        celulaDiv.className = 'celula';
        celulaDiv.id = `celula-${l}-${c}`;
        linhaDiv.appendChild(celulaDiv);
      }
      gradeEl.appendChild(linhaDiv);
    }
    atualizarFocoVisual();
  }

  function atualizarFocoVisual() {
    document.querySelectorAll('.celula').forEach(el => el.classList.remove('ativa'));
    if (!jogoEncerrado && linhaAtual < MAX_TENTATIVAS && colunaAtual < TAMANHO_PALAVRA) {
      const el = document.getElementById(`celula-${linhaAtual}-${colunaAtual}`);
      if (el) el.classList.add('ativa');
    }
  }

  function mostrarMensagem(msg, tipo = '') {
    statusEl.textContent = msg;
    statusEl.className = 'aviso';
    if (tipo) statusEl.classList.add(tipo);
  }

  async function palavraExisteNoPortugues(palavra) {
    if (palavra.length !== 5) return false;
    if (DICIONARIO_LOCAL.has(palavra)) return true;
    if (/^(.)\1+$/.test(palavra)) return false;

    try {
      const resp = await fetch(`https://api.dicionario-aberto.net/near/${palavra.toLowerCase()}`);
      if (!resp.ok) return false;
      const lista = await resp.json();
      return lista.some(item => normalizar(item) === palavra);
    } catch (e) {
      return DICIONARIO_LOCAL.has(palavra);
    }
  }

  function inserirLetra(letra) {
    if (jogoEncerrado || validandoPalavra) return;
    if (colunaAtual >= TAMANHO_PALAVRA) return;

    tentativas[linhaAtual][colunaAtual] = letra;
    const celula = document.getElementById(`celula-${linhaAtual}-${colunaAtual}`);
    celula.textContent = letra;
    celula.classList.add('preenchida');

    colunaAtual++;
    atualizarFocoVisual();
  }

  function apagarLetra() {
    if (jogoEncerrado || validandoPalavra) return;
    if (colunaAtual <= 0) return;

    colunaAtual--;
    tentativas[linhaAtual][colunaAtual] = '';
    const celula = document.getElementById(`celula-${linhaAtual}-${colunaAtual}`);
    celula.textContent = '';
    celula.classList.remove('preenchida');

    atualizarFocoVisual();
  }

  async function confirmarPalavra() {
    if (jogoEncerrado || validandoPalavra) return;

    const palpite = tentativas[linhaAtual].join('');
    const linhaEl = document.getElementById(`linha-${linhaAtual}`);

    if (palpite.length < TAMANHO_PALAVRA) {
      mostrarMensagem('Digite as 5 letras antes de confirmar!', 'erro');
      linhaEl.classList.remove('tremer');
      void linhaEl.offsetWidth;
      linhaEl.classList.add('tremer');
      return;
    }

    validandoPalavra = true;
    mostrarMensagem('Verificando palavra...');

    const valida = await palavraExisteNoPortugues(palpite);
    validandoPalavra = false;

    if (!valida) {
      mostrarMensagem(`"${palpite}" não é uma palavra válida de 5 letras!`, 'erro');
      linhaEl.classList.remove('tremer');
      void linhaEl.offsetWidth;
      linhaEl.classList.add('tremer');
      return;
    }

    avaliarCores(palpite);
  }

  function avaliarCores(palpite) {
    const letrasSecretas = palavraSecreta.split('');
    const letrasPalpite = palpite.split('');
    const resultado = Array(TAMANHO_PALAVRA).fill('errada');
    for (let i = 0; i < TAMANHO_PALAVRA; i++) {
      if (letrasPalpite[i] === letrasSecretas[i]) {
        resultado[i] = 'certa';
        letrasSecretas[i] = null;
      }
    }
    for (let i = 0; i < TAMANHO_PALAVRA; i++) {
      if (resultado[i] === 'certa') continue;
      const indiceNaSecreta = letrasSecretas.indexOf(letrasPalpite[i]);
      if (indiceNaSecreta !== -1) {
        resultado[i] = 'lugar';
        letrasSecretas[indiceNaSecreta] = null;
      }
    }
    for (let i = 0; i < TAMANHO_PALAVRA; i++) {
      const celula = document.getElementById(`celula-${linhaAtual}-${i}`);
      celula.classList.add(resultado[i]);
      atualizarCorTecla(letrasPalpite[i], resultado[i]);
    }

    if (palpite === palavraSecreta) {
      jogoEncerrado = true;
      atualizarFocoVisual();
      mostrarMensagem(`PARABÉNS! Você descobriu a palavra "${palavraSecreta}"!`, 'sucesso');
      return;
    }

    linhaAtual++;
    colunaAtual = 0;

    if (linhaAtual >= MAX_TENTATIVAS) {
      jogoEncerrado = true;
      atualizarFocoVisual();
      mostrarMensagem(`Fim de jogo! A palavra era "${palavraSecreta}".`, 'erro');
    } else {
      mostrarMensagem(`Tentativa ${linhaAtual + 1} de ${MAX_TENTATIVAS}.`);
      atualizarFocoVisual();
    }
  }

  function atualizarCorTecla(letra, estadoNovo) {
    const botao = document.querySelector(`.teclado button[data-tecla="${letra}"]`);
    if (!botao) return;

    if (botao.classList.contains('certa')) return;
    if (botao.classList.contains('lugar') && estadoNovo === 'errada') return;

    botao.classList.remove('lugar', 'errada');
    botao.classList.add(estadoNovo);
  }

  function iniciarJogo() {
    palavraSecreta = sortearPalavra();
    linhaAtual = 0;
    colunaAtual = 0;
    jogoEncerrado = false;
    validandoPalavra = false;

    botoesTeclado.forEach(btn => btn.classList.remove('certa', 'lugar', 'errada'));
    mostrarMensagem('Digite uma palavra de 5 letras e aperte ENTER.');
    criarGrade();
  }

  botoesTeclado.forEach(botao => {
    botao.addEventListener('click', () => {
      const tecla = botao.getAttribute('data-tecla');
      if (tecla === 'ENTER') {
        confirmarPalavra();
      } else if (tecla === 'BACKSPACE') {
        apagarLetra();
      } else {
        inserirLetra(tecla);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      confirmarPalavra();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      apagarLetra();
    } else {
      const letra = normalizar(e.key);
      if (/^[A-Z]$/.test(letra)) {
        inserirLetra(letra);
      }
    }
  });

  btnNovo.addEventListener('click', iniciarJogo);

  iniciarJogo();
});