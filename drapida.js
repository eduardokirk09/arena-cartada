
const dificuldadeElemento = document.getElementById("dificuldade");
const descricaoModo = document.getElementById("descricao-modo");

const textoDesafio = document.getElementById("texto-desafio");
const campoDigitacao = document.getElementById("campo-digitacao");
const mensagem = document.getElementById("mensagem");

const tempoElemento = document.getElementById("tempo");
const ppmElemento = document.getElementById("ppm");
const precisaoElemento = document.getElementById("precisao");
const progressoElemento = document.getElementById("progresso");
const contadorCaracteres = document.getElementById("contador-caracteres");

const iniciarBotao = document.getElementById("btn-iniciar");
const reiniciarBotao = document.getElementById("btn-reiniciar");

const frases = [
    "Em uma tarde ensolarada, um grupo de amigos decidiu organizar uma competição de velocidade no computador. Cada participante precisava manter a concentração, observar cuidadosamente as palavras e digitar sem cometer erros. A disputa começou tranquila, mas logo todos perceberam que alguns segundos poderiam fazer uma grande diferença no resultado final.",

    "A tecnologia está presente em praticamente todos os momentos da nossa rotina, desde a hora em que acordamos até o instante em que vamos dormir. Aprender a utilizar o teclado com rapidez e precisão pode facilitar diversas tarefas, melhorar a produtividade nos estudos e tornar a comunicação muito mais eficiente no dia a dia.",

    "Durante uma viagem inesperada, quatro amigos encontraram uma pequena cidade cercada por montanhas, rios e árvores antigas. Eles decidiram explorar as ruas, conversar com os moradores e descobrir as histórias daquele lugar. No final do passeio, perceberam que as melhores aventuras muitas vezes acontecem quando ninguém está esperando por elas.",

    "O grande campeonato estava prestes a começar e os competidores aguardavam ansiosamente o sinal de largada. Todos haviam treinado durante várias semanas para melhorar a velocidade, diminuir a quantidade de erros e desenvolver uma boa estratégia. Quando o cronômetro começou a correr, cada palavra digitada passou a representar um pequeno avanço em direção à vitória.",

    "Desenvolver um jogo exige criatividade, paciência e atenção aos detalhes. Primeiro surge uma ideia, depois aparecem os desenhos, as regras e os desafios que tornam a experiência interessante. Com o tempo, os programadores testam diferentes possibilidades, corrigem problemas e acrescentam novas funcionalidades até transformar um projeto simples em algo divertido."
];

const modos = {
    facil: {
        nome: "Fácil",
        descricao: "Adversários mais lentos. Ideal para começar.",
        velocidades: [2.0, 2.5, 3.0]
    },

    medio: {
        nome: "Médio",
        descricao: "A corrida ficou mais disputada. Digite com atenção!",
        velocidades: [3.5, 4.2, 5.0]
    },

    dificil: {
        nome: "Difícil",
        descricao: "Os adversários são rápidos. Cada segundo importa!",
        velocidades: [5.5, 6.5, 7.5]
    },

    expert: {
        nome: "Expert",
        descricao: "Quase impossível! Os adversários digitam absurdamente rápido.",
        velocidades: [10.0, 12.0, 15.0]
    }
};

let fraseAtual = "";
let corridaAtiva = false;
let corridaTerminada = false;

let inicioCorrida = 0;
let tempoDecorrido = 0;
let intervaloCorrida = null;

let quantidadeErros = 0;
let totalTeclas = 0;

let adversarios = [];

function escolherFrase() {
    const indice = Math.floor(Math.random() * frases.length);
    fraseAtual = frases[indice];
}

function mostrarFrase() {
    textoDesafio.innerHTML = "";

    for (let letra of fraseAtual) {
        const span = document.createElement("span");
        span.textContent = letra;
        textoDesafio.appendChild(span);
    }

    contadorCaracteres.textContent =
        "0 / " + fraseAtual.length + " caracteres";
}

function atualizarDescricao() {
    const modo = modos[dificuldadeElemento.value];
    descricaoModo.textContent = modo.descricao;
}

function atualizarCorredor(tipo, porcentagem) {
    const valor = Math.max(0, Math.min(100, porcentagem));

    const barra = document.getElementById("barra-" + tipo);
    const icone = document.getElementById("icone-" + tipo);
    const texto = document.getElementById("porcentagem-" + tipo);

    barra.style.width = valor + "%";
    icone.style.left = valor + "%";
    texto.textContent = Math.floor(valor) + "%";
}

function prepararAdversarios() {
    const modo = modos[dificuldadeElemento.value];

    adversarios = modo.velocidades.map(function (velocidade, indice) {
        return {
            id: "bot" + (indice + 1),
            nome: ["Turbo", "Flash", "Relâmpago"][indice],
            velocidade: velocidade,
            progresso: 0
        };
    });
}

function contarAcertosConsecutivos() {
    const digitado = campoDigitacao.value;

    let acertos = 0;

    for (let i = 0; i < digitado.length; i++) {
        if (digitado[i] !== fraseAtual[i]) {
            break;
        }

        acertos++;
    }

    return acertos;
}

function contarCaracteresCorretos() {
    const digitado = campoDigitacao.value;
    let corretos = 0;

    for (let i = 0; i < digitado.length; i++) {
        if (digitado[i] === fraseAtual[i]) {
            corretos++;
        }
    }

    return corretos;
}

function atualizarEstatisticas() {
    const digitado = campoDigitacao.value;

    const acertos = contarAcertosConsecutivos();
    const corretos = contarCaracteresCorretos();

    const porcentagem = (acertos / fraseAtual.length) * 100;

    progressoElemento.textContent = Math.floor(porcentagem) + "%";

    contadorCaracteres.textContent =
        acertos + " / " + fraseAtual.length + " caracteres";

    atualizarCorredor("jogador", porcentagem);
    let ppm = 0;

    if (tempoDecorrido > 0) {
        ppm = Math.round(
            (corretos / 5) / (tempoDecorrido / 60)
        );
    }

    ppmElemento.textContent = ppm + " PPM";

    let precisao = 100;

    if (totalTeclas > 0) {
        precisao = Math.round(
            ((totalTeclas - quantidadeErros) / totalTeclas) * 100
        );
    }

    precisaoElemento.textContent =
        Math.max(0, precisao) + "%";
}

function colorirTexto() {
    const digitado = campoDigitacao.value;
    const letras = textoDesafio.querySelectorAll("span");

    letras.forEach(function (span, indice) {
        span.className = "";

        if (indice < digitado.length) {
            if (digitado[indice] === fraseAtual[indice]) {
                span.classList.add("correto");
            } else {
                span.classList.add("errado");
            }
        } else if (indice === digitado.length) {
            span.classList.add("atual");
        }
    });
}

function atualizarCorrida() {
    if (!corridaAtiva) {
        return;
    }

    tempoDecorrido = (performance.now() - inicioCorrida) / 1000;

    tempoElemento.textContent =
        tempoDecorrido.toFixed(1) + "s";

    atualizarEstatisticas();
    for (let adversario of adversarios) {
        const caracteresDigitados =
            adversario.velocidade * tempoDecorrido;

        adversario.progresso = Math.min(
            100,
            (caracteresDigitados / fraseAtual.length) * 100
        );

        atualizarCorredor(
            adversario.id,
            adversario.progresso
        );
    }
    const vencedor = adversarios.find(function (adversario) {
        return adversario.progresso >= 100;
    });

    if (vencedor) {
        finalizarCorrida(false, vencedor.nome);
    }
}

function iniciarCorrida() {
    if (corridaAtiva) {
        return;
    }

    escolherFrase();
    mostrarFrase();
    prepararAdversarios();

    corridaAtiva = true;
    corridaTerminada = false;

    tempoDecorrido = 0;
    quantidadeErros = 0;
    totalTeclas = 0;

    campoDigitacao.value = "";
    campoDigitacao.disabled = false;
    campoDigitacao.maxLength = fraseAtual.length;

    dificuldadeElemento.disabled = true;
    iniciarBotao.disabled = true;

    mensagem.className = "mensagem";
    mensagem.textContent =
        "A corrida começou! Digite o texto o mais rápido possível!";

    tempoElemento.textContent = "0.0s";
    ppmElemento.textContent = "0 PPM";
    precisaoElemento.textContent = "100%";
    progressoElemento.textContent = "0%";

    atualizarCorredor("jogador", 0);

    for (let adversario of adversarios) {
        atualizarCorredor(adversario.id, 0);
    }

    colorirTexto();

    inicioCorrida = performance.now();

    clearInterval(intervaloCorrida);
    intervaloCorrida = setInterval(atualizarCorrida, 50);

    campoDigitacao.focus();
}

campoDigitacao.addEventListener("keydown", function (evento) {
    if (!corridaAtiva) {
        return;
    }
    if (
        (evento.ctrlKey || evento.metaKey) &&
        ["v", "x"].includes(evento.key.toLowerCase())
    ) {
        evento.preventDefault();
    }
    if (evento.key === "Enter") {
        evento.preventDefault();
    }
});

campoDigitacao.addEventListener("paste", function (evento) {
    evento.preventDefault();
});

campoDigitacao.addEventListener("drop", function (evento) {
    evento.preventDefault();
});

campoDigitacao.addEventListener("beforeinput", function (evento) {
    if (!corridaAtiva) {
        return;
    }

    if (
        evento.inputType === "insertFromPaste" ||
        evento.inputType === "insertFromDrop" ||
        evento.inputType === "insertLineBreak"
    ) {
        evento.preventDefault();
    }
});

campoDigitacao.addEventListener("input", function (evento) {
    if (!corridaAtiva) {
        return;
    }

    const digitado = campoDigitacao.value;
    if (evento.inputType &&
        evento.inputType.startsWith("insert")) {

        const quantidade = evento.data
            ? evento.data.length
            : 1;

        totalTeclas += quantidade;
        const inicio = digitado.length - quantidade;

        for (let i = Math.max(0, inicio); i < digitado.length; i++) {
            if (digitado[i] !== fraseAtual[i]) {
                quantidadeErros++;
            }
        }
    }

    colorirTexto();
    atualizarCorrida();

    if (!corridaAtiva) {
        return;
    }
    if (digitado === fraseAtual) {
        finalizarCorrida(true);
    }
});

function finalizarCorrida(venceu, nomeAdversario = "") {
    if (corridaTerminada) {
        return;
    }

    corridaAtiva = false;
    corridaTerminada = true;

    clearInterval(intervaloCorrida);
    intervaloCorrida = null;

    tempoDecorrido = (performance.now() - inicioCorrida) / 1000;

    tempoElemento.textContent =
        tempoDecorrido.toFixed(1) + "s";

    campoDigitacao.disabled = true;
    dificuldadeElemento.disabled = false;
    iniciarBotao.disabled = true;

    atualizarEstatisticas();

    if (venceu) {
        atualizarCorredor("jogador", 100);

        mensagem.className = "mensagem vitoria";
        mensagem.textContent =
            "🏆 VOCÊ VENCEU! Primeiro lugar em " +
            tempoDecorrido.toFixed(1) +
            " segundos! Sua velocidade foi " +
            ppmElemento.textContent + ".";

    } else {
        atualizarCorredor(
            adversarios.find(a => a.nome === nomeAdversario).id,
            100
        );

        mensagem.className = "mensagem derrota";
        mensagem.textContent =
            "🏁 " + nomeAdversario +
            " chegou primeiro! Você perdeu a corrida. " +
            "Tente novamente para melhorar sua velocidade!";
    }
}

function reiniciarCorrida() {
    corridaAtiva = false;
    corridaTerminada = false;

    clearInterval(intervaloCorrida);
    intervaloCorrida = null;

    tempoDecorrido = 0;
    quantidadeErros = 0;
    totalTeclas = 0;

    campoDigitacao.value = "";
    campoDigitacao.disabled = true;

    dificuldadeElemento.disabled = false;
    iniciarBotao.disabled = false;

    escolherFrase();
    mostrarFrase();

    tempoElemento.textContent = "0.0s";
    ppmElemento.textContent = "0 PPM";
    precisaoElemento.textContent = "100%";
    progressoElemento.textContent = "0%";

    atualizarCorredor("jogador", 0);
    atualizarCorredor("bot1", 0);
    atualizarCorredor("bot2", 0);
    atualizarCorredor("bot3", 0);

    mensagem.className = "mensagem";
    mensagem.textContent =
        "Tudo pronto! Clique em Iniciar corrida.";

    atualizarDescricao();
    colorirTexto();
}

iniciarBotao.addEventListener("click", iniciarCorrida);

reiniciarBotao.addEventListener("click", reiniciarCorrida);

dificuldadeElemento.addEventListener("change", function () {
    atualizarDescricao();
});
reiniciarCorrida();
