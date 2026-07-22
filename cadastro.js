import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyC4NYw4bewHQ4M_TctHVQzq1BkJFWJb9W4",
    authDomain: "dm-financeira.firebaseapp.com",
    projectId: "dm-financeira",
    storageBucket: "dm-financeira.firebasestorage.app",
    messagingSenderId: "167583421460",
    appId: "1:167583421460:web:1a34d6d2b8f90973ae8301",
    measurementId: "G-Q4NEDP6435"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// CONVERTER E COMPACTAR IMAGEM PARA BASE64
function converterImagemParaBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve("");
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", 0.6));
            };
        };
        reader.onerror = (error) => reject(error);
    });
}

// EVENTO DE ENVIO DO FORMULÁRIO
document.getElementById("formCadastro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.innerText = "Enviando dados e fotos...";

    try {
        let nome = document.getElementById("nome").value;
        let cpf = document.getElementById("cpf").value;
        let telefone = document.getElementById("telefone").value;
        let chavePix = document.getElementById("chavePix").value;
        let endereco = document.getElementById("endereco").value;
        let linkLocalizacao = document.getElementById("linkLocalizacao").value;
        let placaVeiculo = document.getElementById("placaVeiculo").value;
        let valor = Number(document.getElementById("valor").value);

        let ref1 = document.getElementById("ref1").value;
        let ref2 = document.getElementById("ref2").value;
        let ref3 = document.getElementById("ref3").value;

        let fotoPerfilFile = document.getElementById("fotoCliente").files[0];
        let docFrenteVersoFile = document.getElementById("docFrenteVerso").files[0];
        let fotoResidenciaFile = document.getElementById("fotoResidencia").files[0];
        let printGanhosFile = document.getElementById("printGanhos").files[0];

        // Converte as fotos
        let fotoBase64 = await converterImagemParaBase64(fotoPerfilFile);
        let docBase64 = await converterImagemParaBase64(docFrenteVersoFile);
        let resBase64 = await converterImagemParaBase64(fotoResidenciaFile);
        let printBase64 = await converterImagemParaBase64(printGanhosFile);

        const tabelaParcelas = {
            300: 17,
            400: 22,
            500: 28,
            600: 33,
            700: 39,
            800: 44,
            900: 50,
            1000: 56
        };

        let parcela = tabelaParcelas[valor] || Math.round((valor * 1.35) / 24);

        // Salva na coleção "solicitacoes_pendentes"
        await addDoc(collection(db, "solicitacoes_pendentes"), {
            nome,
            cpf,
            telefone,
            chavePix,
            endereco,
            linkLocalizacao,
            placaVeiculo,
            referencias: [ref1, ref2, ref3],
            valor,
            parcela,
            totalParcelas: 24,
            dataSolicitacao: new Date().toISOString(),
            foto: fotoBase64,
            docFoto: docBase64,
            resFoto: resBase64,
            printFoto: printBase64
        });

        // Oculta o formulário e exibe mensagem
        document.getElementById("formCadastro").classList.add("escondido");
        document.getElementById("mensagemSucesso").classList.remove("escondido");

    } catch (error) {
        console.error("Erro ao enviar:", error);
        alert("Erro ao enviar solicitação: " + error.message);
        btn.disabled = false;
        btn.innerText = "Enviar Ficha para Análise";
    }
});

// SERVICE WORKER
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw-cadastro.js').catch(err => console.error(err));
}
