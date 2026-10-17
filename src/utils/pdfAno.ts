import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Directory, File, Paths } from "expo-file-system";

type Registro = {
  id: string;
  data: string;
  total: number;
  produto?: string;
  quantidade?: number;
  categoria?: string;
  resumo?: string;
  itens?: string;
  descricao?: string;
  origem: "Compras" | "Historico";
};

export const gerarPDFAno = async (ano: string, dados: Registro[]) => {
  const dadosAno = dados.filter(item => {
    const [,, a] = item.data.split("/");
    return a === ano;
  });

  const compras = dadosAno.filter(item => item.origem === "Compras");
  const historico = dadosAno.filter(item => item.origem === "Historico");

  const tabelaCompras = compras.map(item => {
    let descricao = "-";
    try {
      const itens = JSON.parse(item.itens ?? "[]");
      descricao = itens
        .map((i: any) => `${i.qtd} ${i.item} = R$ ${parseFloat(i.preco).toFixed(2)}`)
        .join("<br>");
    } catch (e) {
      console.warn("Erro ao interpretar itens de compra:", e);
    }

    return `
      <tr>
        <td style="text-align: center">${item.data}</td>
        <td>${descricao}</td>
        <td>R$ ${item.total.toFixed(2)}</td>
      </tr>`;
  }).join("");

  const tabelaHistorico = historico.map(item => {
    let descricao = "-";
    try {
      const linhas = JSON.parse(item.resumo ?? "[]");
      descricao = linhas.join("<br>");
    } catch (e) {
      console.warn("Erro ao interpretar resumo do histórico:", e);
    }

    return `
      <tr>
        <td style="text-align: center">${item.data}</td>
        <td>${descricao}</td>
        <td>R$ ${item.total.toFixed(2)}</td>
      </tr>`;
  }).join("");

  const totalCompras = compras.reduce((acc, item) => acc + item.total, 0);
  const totalHistorico = historico.reduce((acc, item) => acc + item.total, 0);
  const lucro = totalHistorico - totalCompras;

  const resumo = `
    <tr><td style="text-align: center">Total gasto em compras</td><td>R$ ${totalCompras.toFixed(2)}</td></tr>
    <tr><td style="text-align: center">Total feito com as vendas</td><td>R$ ${totalHistorico.toFixed(2)}</td></tr>
    <tr><td style="text-align: center">Lucro total (vendas - compra)</td><td>R$ ${lucro.toFixed(2)}</td></tr>
  `;

  const html = `
    <html>
      <body>
        <center><h1>Relatório de ${ano}</h1></center>

        <center><h2>Compras</h2></center>
        <table border="1" cellspacing="0" cellpadding="5" style="margin: auto; width: 80%">
          <tr><th>Data</th><th>Descrição</th><th>Valor</th></tr>
          ${tabelaCompras}
        </table>

        <center><h2>Vendas</h2></center>
        <table border="1" cellspacing="0" cellpadding="5" style="margin: auto; width: 80%">
          <tr><th>Data</th><th>Descrição</th><th>Valor</th></tr>
          ${tabelaHistorico}
        </table>

        <center><h2>Resumo</h2></center>
        <table border="1" cellspacing="0" cellpadding="5" style="margin: auto; width: 80%">
          <tr><th>Tipo</th><th>Total</th></tr>
          ${resumo}
        </table>
      </body>
    </html>
  `;

  // Gera PDF
  const { uri } = await Print.printToFileAsync({ html });

  // Cria referência ao arquivo originário
  const tempFile = new File(uri);

  // Define caminho final: documentos do app
  const destDir = Paths.document;
  const novoNome = `RelatorioSalgados-${ano}(${Date.now()}).pdf`;

  // Move o arquivo
  await tempFile.move(new File(destDir, novoNome));

  const novoUri = tempFile.uri;

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(novoUri);
  } else {
    console.log("Compartilhamento não disponível");
  }
};
