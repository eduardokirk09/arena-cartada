const fichasElemento = document.getElementById("fichas");
const apostaElemento = document.getElementById("aposta");
const recordeElemento = document.getElementById("recorde");

const pontosBancaElemento = document.getElementById("pontos-banca");
const pontosJogadorElemento = document.getElementById("pontos-jogador");

const cartasBancaElemento = document.getElementById("cartas-banca");
const cartasJogadorElemento = document.getElementById("cartas-jogador");

const mensagemElemento = document.getElementById("mensagem");

const pedirBotao = document.getElementById("btn-pedir");
const pararBotao = document.getElementById("btn-parar");
const novoBotao = document.getElementById("btn-novo");
const musicaBotao = document.getElementById("btn-musica");
const naipes = ["♠", "♥", "♦", "♣"];
const valores = [
    "A", "2", "3", "4", "5", "6", "7",
    "8", "9", "10", "J", "Q", "K"
];

const aposta = 10;

let fichas = 100;
let recorde = 100;

let baralho = [];
let maoBanca = [];
let maoJogador = [];
let rodadaAtiva = false;
try {
    const recordeSalvo = Number(
        localStorage.getItem("recordeBlackjack")
    );

    if (recordeSalvo > 100) {
        recorde = recordeSalvo;
    }
} catch (erro) {
    console.log("Recorde salvo apenas nesta sessão.");
}
function atualizarRecorde() {
    if (fichas > recorde) {
        recorde = fichas;

        try {
            localStorage.setItem("recordeBlackjack", recorde);
        } catch (erro) {
            console.log("Não foi possível salvar o recorde.");
        }
    }

    recordeElemento.textContent = recorde;
}
function criarBaralho() {
    const cartas = [];

    for (let naipe of naipes) {
        for (let valor of valores) {
            cartas.push({ valor, naipe });
        }
    }

    for (let i = cartas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        const auxiliar = cartas[i];
        cartas[i] = cartas[j];
        cartas[j] = auxiliar;
    }

    return cartas;
}
function comprarCarta() {
    return baralho.pop();
}
function calcularPontos(mao) {
    let pontos = 0;
    let quantidadeAses = 0;

    for (let carta of mao) {
        if (carta.valor === "A") {
            pontos += 11;
            quantidadeAses++;
        } else if (["J", "Q", "K"].includes(carta.valor)) {
            pontos += 10;
        } else {
            pontos += Number(carta.valor);
        }
    }
    while (pontos > 21 && quantidadeAses > 0) {
        pontos -= 10;
        quantidadeAses--;
    }

    return pontos;
}
function criarCartaElemento(carta, escondida = false) {
    const elemento = document.createElement("div");

    elemento.className = "carta";

    if (escondida) {
        elemento.classList.add("verso");
        elemento.setAttribute("aria-label", "Carta escondida");
        return elemento;
    }

    if (carta.naipe === "♥" || carta.naipe === "♦") {
        elemento.classList.add("carta-vermelha");
    }

    const valorElemento = document.createElement("span");
    valorElemento.className = "valor";
    valorElemento.textContent = carta.valor;

    const naipeElemento = document.createElement("span");
    naipeElemento.className = "naipe";
    naipeElemento.textContent = carta.naipe;

    elemento.appendChild(valorElemento);
    elemento.appendChild(naipeElemento);

    return elemento;
}
function mostrarMao(elemento, mao, esconderSegunda = false) {
    elemento.innerHTML = "";

    mao.forEach(function (carta, indice) {
        const escondida = esconderSegunda && indice === 1;

        elemento.appendChild(
            criarCartaElemento(carta, escondida)
        );
    });
}
function atualizarMesa(esconderCartaBanca = false) {
    fichasElemento.textContent = fichas;
    apostaElemento.textContent = aposta;

    atualizarRecorde();

    mostrarMao(
        cartasBancaElemento,
        maoBanca,
        esconderCartaBanca
    );

    mostrarMao(
        cartasJogadorElemento,
        maoJogador
    );

    pontosJogadorElemento.textContent =
        calcularPontos(maoJogador);

    if (esconderCartaBanca && maoBanca.length > 0) {
        pontosBancaElemento.textContent =
            calcularPontos([maoBanca[0]]);
    } else {
        pontosBancaElemento.textContent =
            calcularPontos(maoBanca);
    }
}
function encerrarRodada(resultado) {
    rodadaAtiva = false;

    pedirBotao.disabled = true;
    pararBotao.disabled = true;
    novoBotao.disabled = false;

    if (resultado === "ganhou") {
        fichas += aposta * 2;

        mensagemElemento.textContent =
            "Você ganhou! Recebeu " +
            (aposta * 2) + " fichas.";

        somVitoria();

    } else if (resultado === "empate") {
        fichas += aposta;

        mensagemElemento.textContent =
            "Empate! Sua aposta foi devolvida.";

    } else {
        mensagemElemento.textContent =
            "A banca ganhou. Tente outra rodada!";

        somDerrota();
    }
    atualizarMesa(false);

    if (fichas < aposta) {
        novoBotao.textContent = "Recomeçar com 100 fichas";

        mensagemElemento.textContent +=
            " Suas fichas acabaram!";
    } else {
        novoBotao.textContent = "Nova rodada";
    }
}
function parar() {
    if (!rodadaAtiva) {
        return;
    }

    while (calcularPontos(maoBanca) < 17) {
        maoBanca.push(comprarCarta());
        somCarta();
    }

    const jogador = calcularPontos(maoJogador);
    const banca = calcularPontos(maoBanca);

    if (banca > 21 || jogador > banca) {
        encerrarRodada("ganhou");
    } else if (jogador === banca) {
        encerrarRodada("empate");
    } else {
        encerrarRodada("perdeu");
    }
}
function novaRodada() {
    if (rodadaAtiva) {
        return;
    }
    if (fichas < aposta) {
        fichas = 100;
    }

    fichas -= aposta;

    baralho = criarBaralho();
    maoBanca = [];
    maoJogador = [];
    maoJogador.push(comprarCarta());
    maoBanca.push(comprarCarta());

    maoJogador.push(comprarCarta());
    maoBanca.push(comprarCarta());

    rodadaAtiva = true;

    pedirBotao.disabled = false;
    pararBotao.disabled = false;
    novoBotao.disabled = true;

    mensagemElemento.textContent =
        "Sua vez! Peça uma carta ou clique em Parar.";

    somCarta();
    atualizarMesa(true);
    const jogador = calcularPontos(maoJogador);
    const banca = calcularPontos(maoBanca);

    if (jogador === 21 && banca === 21) {
        encerrarRodada("empate");
    } else if (jogador === 21) {
        encerrarRodada("ganhou");
    } else if (banca === 21) {
        encerrarRodada("perdeu");
    }
}
pedirBotao.addEventListener("click", function () {
    if (!rodadaAtiva) {
        return;
    }

    maoJogador.push(comprarCarta());

    somCarta();
    atualizarMesa(true);

    const pontos = calcularPontos(maoJogador);

    if (pontos > 21) {
        encerrarRodada("perdeu");
    } else if (pontos === 21) {
        parar();
    }
});
pararBotao.addEventListener("click", parar);
novoBotao.addEventListener("click", novaRodada);

let audioContexto = null;
let somLigado = false;
let intervaloMusica = null;
let notaAtual = 0;

const melodia = [
    261.63, 329.63, 392, 329.63,
    293.66, 349.23, 440, 349.23,
    261.63, 329.63, 392, 523.25
];
function tocarNota(
    frequencia,
    duracao,
    volume = 0.02,
    tipo = "sine"
) {
    if (!somLigado || !audioContexto) {
        return;
    }

    const oscilador = audioContexto.createOscillator();
    const ganho = audioContexto.createGain();

    const agora = audioContexto.currentTime;

    oscilador.type = tipo;
    oscilador.frequency.setValueAtTime(
        frequencia,
        agora
    );

    ganho.gain.setValueAtTime(0.0001, agora);
    ganho.gain.linearRampToValueAtTime(
        volume,
        agora + 0.02
    );

    ganho.gain.exponentialRampToValueAtTime(
        0.0001,
        agora + duracao
    );

    oscilador.connect(ganho);
    ganho.connect(audioContexto.destination);

    oscilador.start(agora);
    oscilador.stop(agora + duracao);
}
function somCarta() {
    tocarNota(350, 0.1, 0.035, "triangle");
}
function somVitoria() {
    tocarNota(523.25, 0.25, 0.06);

    setTimeout(function () {
        tocarNota(659.25, 0.25, 0.06);
    }, 150);

    setTimeout(function () {
        tocarNota(783.99, 0.4, 0.06);
    }, 300);
}
function somDerrota() {
    tocarNota(392, 0.3, 0.05);

    setTimeout(function () {
        tocarNota(329.63, 0.3, 0.05);
    }, 200);

    setTimeout(function () {
        tocarNota(261.63, 0.4, 0.05);
    }, 400);
}
function tocarMusica() {
    if (!somLigado) {
        return;
    }

    tocarNota(melodia[notaAtual], 0.65, 0.012);

    notaAtual = (notaAtual + 1) % melodia.length;
}
async function alternarSom() {
    if (somLigado) {
        somLigado = false;

        clearInterval(intervaloMusica);
        intervaloMusica = null;

        musicaBotao.classList.remove("ligado");
        musicaBotao.setAttribute("aria-pressed", "false");
        musicaBotao.setAttribute("aria-label", "Ligar som");
        musicaBotao.title = "Ligar som";

        return;
    }

    const AudioContexto =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContexto) {
        alert("Seu navegador não suporta áudio.");
        return;
    }

    try {
        if (!audioContexto) {
            audioContexto = new AudioContexto();
        }

        if (audioContexto.state === "suspended") {
            await audioContexto.resume();
        }

        somLigado = true;

        musicaBotao.classList.add("ligado");
        musicaBotao.setAttribute("aria-pressed", "true");
        musicaBotao.setAttribute("aria-label", "Desligar som");
        musicaBotao.title = "Desligar som";

        tocarMusica();

        clearInterval(intervaloMusica);
        intervaloMusica = setInterval(tocarMusica, 800);

    } catch (erro) {
        console.error("Erro ao ligar o som:", erro);
        alert("Não foi possível iniciar o som.");
    }
}
musicaBotao.addEventListener("click", alternarSom);
atualizarMesa(false);
