import { Workbook, BorderStyle } from 'exceljs';
import { File, Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type Registro = {
  id: string;
  data: string;
  total: number;
  itens?: string;
  resumo?: string;
  origem: 'Compras' | 'Historico';
};

export const gerarPlanilhaMes = async (mes: string, ano: string, dados: Registro[]) => {
  const dadosMes = dados.filter(item => {
    const [_, m, a] = item.data.split('/');
    return m === mes && a === ano;
  });

  function nomeDoMes(numeroMes: string): string {
    const nomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const index = parseInt(numeroMes, 10) - 1;
    return nomes[index] || numeroMes;
  }

  const nomeMes = nomeDoMes(mes);
  const compras = dadosMes.filter(item => item.origem === 'Compras');
  const historico = dadosMes.filter(item => item.origem === 'Historico');

  const totalCompras = compras.reduce((acc, item) => acc + item.total, 0);
  const totalHistorico = historico.reduce((acc, item) => acc + item.total, 0);
  const lucro = totalHistorico - totalCompras;

  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Relatório');

  function linhaAtual(sheet: typeof workbook.worksheets[0]): number {
    return sheet.lastRow?.number ?? sheet.rowCount;
  }

  const estilo: BorderStyle = 'thin';
  const bordaPadrao = {
    top: { style: estilo },
    left: { style: estilo },
    bottom: { style: estilo },
    right: { style: estilo },
  };

  // Título principal
  sheet.addRow(['Relatório']);
  sheet.mergeCells('A1:C1');
  const titulo = sheet.getRow(1);
  titulo.alignment = { horizontal: 'center' };
  titulo.font = { bold: true, size: 16 };

  sheet.addRow([`${nomeMes}/${ano}`]);
  sheet.mergeCells('A2:C2');
  const subtitulo = sheet.getRow(2);
  subtitulo.alignment = { horizontal: 'center' };
  subtitulo.font = { italic: true };

  sheet.addRow([]);

  // 🛒 Compras
  sheet.addRow(['Compras']);
  sheet.mergeCells(`A${linhaAtual(sheet)}:C${linhaAtual(sheet)}`);
  const tituloCompras = sheet.getRow(linhaAtual(sheet));
  tituloCompras.alignment = { horizontal: 'center' };
  tituloCompras.font = { bold: true };
  tituloCompras.eachCell(cell => cell.border = bordaPadrao);

  const cabecalhoCompras = sheet.addRow(['Data', 'Descrição', 'Valor']);
  ['A', 'B', 'C'].forEach(col => {
    const cell = sheet.getCell(`${col}${cabecalhoCompras.number}`);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF2CC' },
    };
    cell.border = bordaPadrao;
  });

  const inicioTabelaCompras = linhaAtual(sheet) + 1;

  compras.forEach(item => {
    let linhas: string[] = [];
    try {
      const itens = JSON.parse(item.itens ?? '[]');
      linhas = itens.map((i: any) => `${i.qtd} ${i.item} = R$ ${parseFloat(i.preco).toFixed(2)}`);
    } catch (e) {
      linhas = ['-'];
    }

    const inicio = linhaAtual(sheet) + 1;
    const primeira = sheet.addRow([item.data, linhas[0], item.total]);
    sheet.getCell(`C${primeira.number}`).numFmt = '"R$"#,##0.00';
    sheet.getCell(`A${primeira.number}`).alignment = { horizontal: 'center' };
    sheet.getCell(`C${primeira.number}`).alignment = { horizontal: 'center' };

    if (linhas.length === 1) {
      primeira.eachCell(cell => cell.border = bordaPadrao);
    } else {
      primeira.eachCell(cell => {
        cell.border = {
          top: bordaPadrao.top,
          left: bordaPadrao.left,
          right: bordaPadrao.right,
        };
      });

      for (let i = 1; i < linhas.length; i++) {
        const extra = sheet.addRow(['', linhas[i], '']);
        if (i === linhas.length - 1) {
          extra.eachCell(cell => {
            cell.border = {
              top: undefined,
              left: bordaPadrao.left,
              right: bordaPadrao.right,
              bottom: bordaPadrao.bottom,
            };
          });
        }
      }

      const fim = linhaAtual(sheet);
      sheet.mergeCells(`A${inicio}:A${fim}`);
      sheet.mergeCells(`C${inicio}:C${fim}`);
      sheet.getCell(`A${inicio}`).alignment = { vertical: 'middle', horizontal: 'center' };
      sheet.getCell(`C${inicio}`).alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  const fimTabelaCompras = sheet.lastRow?.number ?? sheet.rowCount;
  for (let i = inicioTabelaCompras; i <= fimTabelaCompras; i++) {
    ['A', 'B', 'C'].forEach(col => {
      const cell = sheet.getCell(`${col}${i}`);
      cell.border = {
        top: cell.border?.top,
        bottom: cell.border?.bottom,
        left: cell.border?.left,
        right: cell.border?.right,
      };
    });
  }

  sheet.addRow([]);

  // 📄 Vendas
  sheet.addRow(['Vendas']);
  sheet.mergeCells(`A${linhaAtual(sheet)}:C${linhaAtual(sheet)}`);
  const tituloVendas = sheet.getRow(linhaAtual(sheet));
  tituloVendas.alignment = { horizontal: 'center' };
  tituloVendas.font = { bold: true };
  tituloVendas.eachCell(cell => cell.border = bordaPadrao);

  const cabecalhoVendas = sheet.addRow(['Data', 'Descrição', 'Valor']);
  ['A', 'B', 'C'].forEach(col => {
    const cell = sheet.getCell(`${col}${cabecalhoVendas.number}`);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF2CC' },
    };
    cell.border = bordaPadrao;
  });

  const inicioTabelaVendas = linhaAtual(sheet) + 1;

  historico.forEach(item => {
    let linhas: string[] = [];
    try {
      linhas = JSON.parse(item.resumo ?? '[]');
    } catch (e) {
      linhas = ['-'];
    }

    const inicio = linhaAtual(sheet) + 1;
    const primeira = sheet.addRow([item.data, linhas[0], item.total]);
    sheet.getCell(`C${primeira.number}`).numFmt = '"R$"#,##0.00';
    sheet.getCell(`A${primeira.number}`).alignment = { horizontal: 'center' };
    sheet.getCell(`C${primeira.number}`).alignment = { horizontal: 'center' };

    if (linhas.length === 1) {
      primeira.eachCell(cell => cell.border = bordaPadrao);
    } else {
      primeira.eachCell(cell => {
        cell.border = {
          top: bordaPadrao.top,
          left: bordaPadrao.left,
          right: bordaPadrao.right,
        };
      });

      for (let i = 1; i < linhas.length; i++) {
        const extra = sheet.addRow(['', linhas[i], '']);
        if (i === linhas.length - 1) {
          extra.eachCell(cell => {
            cell.border = {
              top: undefined,
              left: bordaPadrao.left,
              right: bordaPadrao.right,
              bottom: bordaPadrao.bottom,
            };
          });
        }
      }

      const fim = linhaAtual(sheet);
      sheet.mergeCells(`A${inicio}:A${fim}`);
      sheet.mergeCells(`C${inicio}:C${fim}`);
      sheet.getCell(`A${inicio}`).border = {
        ...sheet.getCell(`A${inicio}`).border,
        bottom: bordaPadrao.bottom,
      };
      sheet.getCell(`C${inicio}`).border = {
        ...sheet.getCell(`C${inicio}`).border,
        bottom: bordaPadrao.bottom,
      };
      sheet.getCell(`A${inicio}`).alignment = { vertical: 'middle', horizontal: 'center' };
      sheet.getCell(`C${inicio}`).alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  const fimTabelaVendas = sheet.lastRow?.number ?? sheet.rowCount;
  for (let i = inicioTabelaVendas; i <= fimTabelaVendas; i++) {
    ['A', 'B', 'C'].forEach(col => {
      const cell = sheet.getCell(`${col}${i}`);
      cell.border = {
        top: cell.border?.top,
        bottom: cell.border?.bottom,
        left: cell.border?.left,
        right: cell.border?.right,
      };
    });
  }

  sheet.addRow([]);

  // 📊 Resumo
  sheet.addRow(['Resumo']);
  sheet.mergeCells(`A${linhaAtual(sheet)}:C${linhaAtual(sheet)}`);
  const tituloResumo = sheet.getRow(linhaAtual(sheet));
  tituloResumo.alignment = { horizontal: 'center' };
  tituloResumo.font = { bold: true };
  tituloResumo.eachCell(cell => cell.border = bordaPadrao);

  const cabecalhoResumo = sheet.addRow(['Tipo', '', 'Total']);
  sheet.mergeCells(`A${cabecalhoResumo.number}:B${cabecalhoResumo.number}`);
  sheet.getCell(`A${cabecalhoResumo.number}`).alignment = { horizontal: 'center' };
  sheet.getCell(`C${cabecalhoResumo.number}`).alignment = { horizontal: 'left' };
  ['A', 'B', 'C'].forEach(col => {
    const cell = sheet.getCell(`${col}${cabecalhoResumo.number}`);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF2CC' },
    };
    cell.border = bordaPadrao;
  });

  const resumo = [
    ['Total gasto em compras', totalCompras],
    ['Total feito com as vendas', totalHistorico],
    ['Lucro total (vendas - compra)', lucro],
  ];

  resumo.forEach(([tipo, total]) => {
    const row = sheet.addRow([tipo, '', total]);
    sheet.mergeCells(`A${row.number}:B${row.number}`);
    sheet.getCell(`A${row.number}`).alignment = { horizontal: 'center' };
    sheet.getCell(`C${row.number}`).alignment = { horizontal: 'center' };
    sheet.getCell(`C${row.number}`).numFmt = '"R$"#,##0.00';
    row.eachCell(cell => cell.border = bordaPadrao);
  });

  // Ajuste de largura das colunas
  sheet.columns = [
    { key: 'data', width: 15 },
    { key: 'descricao', width: 50 },
    { key: 'valor', width: 15 },
  ];

  // Salvar e compartilhar
  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  /* @ts-ignore */
  const file = new File(`${Directory.documentDirectory}PlanilhaSalgados-${nomeMes}-${ano}.xlsx`);
  await file.write(base64, { encoding: 'base64' });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri);
  } else {
    console.log('Compartilhamento não disponível');
  }
};