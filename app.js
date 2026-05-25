import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function importarExcel() {
  const fileInput = document.getElementById("excelFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Por favor, selecione um arquivo Excel.");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert("O arquivo Excel está vazio.");
        return;
      }

      let importados = 0;
      let erros = 0;

      const dataAtual = new Date();
      const mes = dataAtual.toLocaleString("pt-BR", { month: "long" });

      for (const row of jsonData) {
        try {
          const codigo = row["Código"] || row["codigo"] || row["CODIGO"] || "";
          const nome = row["Nome"] || row["nome"] || row["NOME"] || "";
          const solicitante = row["Solicitante"] || row["solicitante"] || row["SOLICITANTE"] || "";

          if (!codigo || !nome || !solicitante) {
            erros++;
            continue;
          }

          await addDoc(collection(db, "produtos"), {
            codigo,
            nome,
            solicitante,
            mes,
            dataCadastro: dataAtual
          });

          importados++;
        } catch (error) {
          console.error("Erro ao importar linha:", error);
          erros++;
        }
      }

      alert(`Importação concluída!\n\nImportados: ${importados}\nErros: ${erros}`);

      fileInput.value = "";
      listarProdutos();

    } catch (error) {
      console.error("Erro ao ler arquivo Excel:", error);
      alert("Erro ao ler arquivo Excel. Verifique se o formato está correto.");
    }
  };

  reader.readAsArrayBuffer(file);
}

window.importarExcel = importarExcel;

async function salvarProduto() {

  const codigo = document.getElementById("codigo").value;

  const nome = document.getElementById("nome").value;

  const solicitante =
    document.getElementById("solicitante").value;

  const data = new Date();

  const mes =
    data.toLocaleString("pt-BR", { month: "long" });

  await addDoc(collection(db, "produtos"), {

    codigo,
    nome,
    solicitante,
    mes,
    dataCadastro: data
  });

  alert("Produto cadastrado!");

  listarProdutos();
}

async function listarProdutos() {

  const tabela =
    document.getElementById("tabelaProdutos");

  tabela.innerHTML = "";

  const querySnapshot =
    await getDocs(collection(db, "produtos"));

  let relatorioMes = {};

  let relatorioSolicitante = {};

  let totalProdutos = 0;
  let uniqueSolicitantes = new Set();

  querySnapshot.forEach((doc) => {

    const produto = doc.data();

    tabela.innerHTML += `

      <tr>
        <td>${produto.codigo}</td>
        <td>${produto.nome}</td>
        <td>${produto.solicitante}</td>
        <td>${produto.mes}</td>
      </tr>

    `;

    if (!relatorioMes[produto.mes]) {
      relatorioMes[produto.mes] = 0;
    }

    relatorioMes[produto.mes]++;

    if (!relatorioSolicitante[produto.solicitante]) {
      relatorioSolicitante[produto.solicitante] = 0;
    }

    relatorioSolicitante[produto.solicitante]++;

    totalProdutos++;
    uniqueSolicitantes.add(produto.solicitante);
  });

  document.getElementById("totalProdutos").textContent = totalProdutos;
  document.getElementById("totalSolicitantes").textContent = uniqueSolicitantes.size;

  mostrarRelatorios(
    relatorioMes,
    relatorioSolicitante
  );
}

function mostrarRelatorios(relMes, relSolic) {

  const ctxMes = document.getElementById("chartMes").getContext("2d");
  const ctxSolic = document.getElementById("chartSolicitante").getContext("2d");

  const meses = Object.keys(relMes);
  const valoresMes = Object.values(relMes);

  const solicitantes = Object.keys(relSolic);
  const valoresSolic = Object.values(relSolic);

  if (window.chartMesInstance) {
    window.chartMesInstance.destroy();
  }

  if (window.chartSolicInstance) {
    window.chartSolicInstance.destroy();
  }

  window.chartMesInstance = new Chart(ctxMes, {
    type: "bar",
    data: {
      labels: meses,
      datasets: [{
        label: "Cadastros por Mês",
        data: valoresMes,
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(118, 75, 162, 0.8)",
          "rgba(240, 147, 251, 0.8)",
          "rgba(245, 87, 108, 0.8)",
          "rgba(246, 173, 85, 0.8)",
          "rgba(102, 126, 234, 0.8)",
          "rgba(118, 75, 162, 0.8)",
          "rgba(240, 147, 251, 0.8)",
          "rgba(245, 87, 108, 0.8)",
          "rgba(246, 173, 85, 0.8)",
          "rgba(102, 126, 234, 0.8)",
          "rgba(118, 75, 162, 0.8)"
        ],
        borderColor: [
          "rgba(102, 126, 234, 1)",
          "rgba(118, 75, 162, 1)",
          "rgba(240, 147, 251, 1)",
          "rgba(245, 87, 108, 1)",
          "rgba(246, 173, 85, 1)",
          "rgba(102, 126, 234, 1)",
          "rgba(118, 75, 162, 1)",
          "rgba(240, 147, 251, 1)",
          "rgba(245, 87, 108, 1)",
          "rgba(246, 173, 85, 1)",
          "rgba(102, 126, 234, 1)",
          "rgba(118, 75, 162, 1)"
        ],
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: "600"
          },
          bodyFont: {
            size: 13
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 12
            }
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)"
          }
        },
        x: {
          ticks: {
            font: {
              size: 12
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });

  window.chartSolicInstance = new Chart(ctxSolic, {
    type: "doughnut",
    data: {
      labels: solicitantes,
      datasets: [{
        label: "Cadastros por Solicitante",
        data: valoresSolic,
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(118, 75, 162, 0.8)",
          "rgba(240, 147, 251, 0.8)",
          "rgba(245, 87, 108, 0.8)",
          "rgba(246, 173, 85, 0.8)",
          "rgba(102, 126, 234, 0.8)",
          "rgba(118, 75, 162, 0.8)",
          "rgba(240, 147, 251, 0.8)",
          "rgba(245, 87, 108, 0.8)",
          "rgba(246, 173, 85, 0.8)"
        ],
        borderColor: [
          "rgba(102, 126, 234, 1)",
          "rgba(118, 75, 162, 1)",
          "rgba(240, 147, 251, 1)",
          "rgba(245, 87, 108, 1)",
          "rgba(246, 173, 85, 1)",
          "rgba(102, 126, 234, 1)",
          "rgba(118, 75, 162, 1)",
          "rgba(240, 147, 251, 1)",
          "rgba(245, 87, 108, 1)",
          "rgba(246, 173, 85, 1)"
        ],
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            font: {
              size: 12
            },
            usePointStyle: true,
            pointStyle: "circle"
          }
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: "600"
          },
          bodyFont: {
            size: 13
          }
        }
      },
      cutout: "60%"
    }
  });
}

listarProdutos();

window.salvarProduto = salvarProduto;