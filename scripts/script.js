/* Elementos do HTML */
const relogio = document.getElementById("relogio");
const mensagem = document.getElementById("mensagem");

const modoFoco = document.getElementById("modoFoco");
const modoDescanso = document.getElementById("modoDescanso");

const botaoIniciar = document.getElementById("iniciar");
const botaoReiniciar = document.getElementById("reiniciar");

const anotacoes = document.getElementById("anotacoes");
const statusSalvamento = document.getElementById("statusSalvamento");
const botaoLimparNotas = document.getElementById("limparNotas");


/* Configurações do cronômetro */
const TEMPO_FOCO = 25 * 60;
const TEMPO_DESCANSO = 5 * 60;

let modoAtual = "foco";
let tempoRestante = TEMPO_FOCO;
let intervalo = null;


/* Mostra o tempo no formato MM:SS */
function atualizarRelogio() {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;

    const minutosFormatados = String(minutos).padStart(2, "0");
    const segundosFormatados = String(segundos).padStart(2, "0");

    relogio.textContent =
        `${minutosFormatados}:${segundosFormatados}`;

    document.title = `${relogio.textContent} - Pomodoro`;
}


/* Inicia o cronômetro */
function iniciarCronometro() {
    // Evita iniciar vários intervalos ao mesmo tempo.
    if (intervalo !== null) {
        return;
    }

    mensagem.textContent = modoAtual === "foco"
        ? "Mantenha o foco na sua tarefa!"
        : "Relaxe um pouco e recarregue as energias.";

    botaoIniciar.textContent = "Pausar";

    intervalo = setInterval(() => {
        tempoRestante--;

        atualizarRelogio();

        if (tempoRestante <= 0) {
            finalizarCronometro();
        }
    }, 1000);
}


/* Pausa o cronômetro */
function pausarCronometro() {
    clearInterval(intervalo);
    intervalo = null;

    botaoIniciar.textContent = "Continuar";
    mensagem.textContent = "Cronômetro pausado.";
}


/* Decide se inicia ou pausa */
function alternarCronometro() {
    if (intervalo !== null) {
        pausarCronometro();
    } else {
        iniciarCronometro();
    }
}


/* Finaliza uma sessão */
function finalizarCronometro() {
    clearInterval(intervalo);
    intervalo = null;

    tempoRestante = 0;
    atualizarRelogio();

    botaoIniciar.textContent = "Iniciar";

    mensagem.textContent = modoAtual === "foco"
        ? "Sessão concluída! Hora de descansar."
        : "Descanso concluído! Hora de focar.";

    // Tenta avisar o usuário com um som simples.
    tocarAlerta();
}


/* Som de aviso opcional */
function tocarAlerta() {
    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        const contexto = new AudioContextClass();
        const oscilador = contexto.createOscillator();
        const volume = contexto.createGain();

        oscilador.frequency.value = 660;
        volume.gain.value = 0.08;

        oscilador.connect(volume);
        volume.connect(contexto.destination);

        oscilador.start();
        oscilador.stop(contexto.currentTime + 0.3);

        oscilador.onended = () => contexto.close();
    } catch (erro) {
        // O cronômetro continua funcionando mesmo sem som.
    }
}


/* Troca entre foco e descanso */
function mudarModo(novoModo) {
    clearInterval(intervalo);
    intervalo = null;

    modoAtual = novoModo;

    if (modoAtual === "foco") {
        tempoRestante = TEMPO_FOCO;

        modoFoco.classList.add("ativo");
        modoDescanso.classList.remove("ativo");

        mensagem.textContent = "Pronto para se concentrar?";
    } else {
        tempoRestante = TEMPO_DESCANSO;

        modoDescanso.classList.add("ativo");
        modoFoco.classList.remove("ativo");

        mensagem.textContent = "Hora de fazer uma pausa.";
    }

    botaoIniciar.textContent = "Iniciar";

    atualizarRelogio();
}


/* Reinicia o tempo do modo selecionado */
function reiniciarCronometro() {
    clearInterval(intervalo);
    intervalo = null;

    tempoRestante = modoAtual === "foco"
        ? TEMPO_FOCO
        : TEMPO_DESCANSO;

    botaoIniciar.textContent = "Iniciar";
    mensagem.textContent = "Cronômetro reiniciado.";

    atualizarRelogio();
}


/* Eventos dos botões do cronômetro */
botaoIniciar.addEventListener("click", alternarCronometro);
botaoReiniciar.addEventListener("click", reiniciarCronometro);

modoFoco.addEventListener("click", () => {
    mudarModo("foco");
});

modoDescanso.addEventListener("click", () => {
    mudarModo("descanso");
});


/* Bloco de notas: carrega o texto salvo */
function carregarAnotacoes() {
    try {
        const textoSalvo = localStorage.getItem("pomodoro-anotacoes");

        if (textoSalvo !== null) {
            anotacoes.value = textoSalvo;
        }

        statusSalvamento.textContent = "Notas carregadas.";
    } catch (erro) {
        statusSalvamento.textContent =
            "O navegador não permitiu acessar as notas salvas.";
    }
}


/* Salva as anotações automaticamente */
function salvarAnotacoes() {
    try {
        localStorage.setItem("pomodoro-anotacoes", anotacoes.value);

        statusSalvamento.textContent = "Notas salvas automaticamente.";
    } catch (erro) {
        statusSalvamento.textContent =
            "Não foi possível salvar as notas.";
    }
}


/* Limpa as anotações */
function limparAnotacoes() {
    const confirmou = confirm(
        "Tem certeza de que deseja apagar todas as anotações?"
    );

    if (!confirmou) return;

    anotacoes.value = "";
    salvarAnotacoes();
}


/* Eventos do bloco de notas */
anotacoes.addEventListener("input", salvarAnotacoes);
botaoLimparNotas.addEventListener("click", limparAnotacoes);


/* Inicialização */
carregarAnotacoes();
atualizarRelogio();