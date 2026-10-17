<p align="center">
  <img
    alt="Logo do aplicativo Salgados da Márcia"
    width="220"
    src="assets/images/LogoAdaptada.png"
  />
</p>

# 🥟 Salgados da Márcia

Aplicativo feito para ajudar no controle das vendas e das compras de um negócio de salgados. Com ele, é possível calcular pedidos, manter os preços atualizados e consultar registros para acompanhar a movimentação.

---

## 🌱 Origem do projeto

Este aplicativo é a evolução de uma primeira versão do projeto, criada como um site enquanto eu aprendia desenvolvimento web. Você pode conhecer essa versão inicial no repositório [Calculadora-valor](https://github.com/jessicacristinass/Calculadora-valor).

---

## 📱 Sobre o aplicativo

O app foi desenvolvido com React Native e Expo. Os dados são armazenados localmente no dispositivo, usando SQLite; por isso, não são sincronizados automaticamente entre aparelhos.

### O que é possível fazer

- Calcular o valor de pedidos a partir dos salgados e das bebidas cadastrados.
- Cadastrar, editar e remover produtos e preços.
- Consultar e editar o histórico diário de pedidos.
- Registrar compras, consultar os gastos por mês e editar ou remover registros.
- Criar e compartilhar uma imagem do cardápio, escolhendo quais itens serão exibidos.
- Gerar relatórios em PDF por mês ou por ano, reunindo compras, vendas e a diferença entre os totais registrados.
- Exportar os dados em um arquivo JSON de backup e importar esse arquivo para restaurá-los.

> O resultado do relatório considera somente as compras e vendas registradas no aplicativo. Ele não representa necessariamente o lucro líquido do negócio, pois não inclui outros custos.

---

## 🛠️ Tecnologias utilizadas

- **React Native** — construção da interface para dispositivos móveis.
- **Expo (SDK 54)** — execução e integração com recursos nativos do aparelho.
- **TypeScript** — tipagem do código.
- **Expo Router** — navegação baseada nos arquivos da pasta `app/`.
- **TinyBase e Expo SQLite** — gerenciamento e persistência local dos dados.
- **Expo Print e Expo Sharing** — criação e compartilhamento de relatórios em PDF.
- **Expo Document Picker e Expo File System** — seleção e leitura do arquivo de backup.

---

## 📂 Estrutura do projeto

```text
app/
  index.tsx          # Calculadora de pedidos
  tabelas.tsx        # Cadastro e edição de produtos e preços
  historico.tsx      # Histórico de pedidos
  compras.tsx        # Registro e consulta de compras
  cardapio.tsx       # Montagem e compartilhamento do cardápio
  download.tsx       # Relatórios mensais e anuais em PDF
components/          # Componentes reutilizáveis da interface
src/
  modals/            # Janelas de edição
  utils/             # Rotinas de backup e geração de arquivos
  store.ts           # Dados e tabelas do aplicativo
  styles.ts          # Estilos compartilhados
assets/images/       # Logo e imagens usadas no app
app.json             # Configuração do Expo
```

---

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) e npm.
- Para testar em um celular, o aplicativo **Expo Go** instalado. Também é possível usar um emulador Android; para iOS, é necessário macOS com Xcode.

### Passos

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:

   ```bash
   npx expo start
   ```

3. Abra o projeto no Expo Go lendo o QR code exibido no terminal ou na página aberta pelo Expo. Se preferir um emulador, use `npm run android` ou `npm run ios`.

Para abrir a versão web de desenvolvimento, o projeto também inclui:

```bash
npm run web
```

Alguns recursos que dependem de APIs do aparelho podem ter suporte diferente na web.

### Verificar o código

Para executar o linter configurado no projeto:

```bash
npm run lint
```

---

## 💾 Dados e backups

Os registros ficam no armazenamento local do app. Use **Fazer backup** para compartilhar/salvar uma cópia JSON e **Importar backup** para restaurar os dados. A importação substitui os dados atualmente armazenados no aplicativo; guarde uma cópia antes de importar.
