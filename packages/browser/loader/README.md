# # @koph-npm/browser-loader

> Carregador dinâmico de arquivos JavaScript e CSS com cache, timeout e controle de status.

Este utilitário permite carregar scripts JS e folhas de estilo CSS dinamicamente no navegador com suporte a:

- Cache de carregamento (evita carregamentos repetidos)
- Timeout configurável para falhas
- Suporte a multiplos arquivos
- Uso com `async` ou `defer` no carregamento de scripts

---

## 📦 Instalação

```bash
npm install @koph-npm/browser-loader
```

---

## 🚀 Uso básico

### Carregar um script JS
```ts
import { Loader } from '@koph-npm/browser-loader';

Loader.js("/scripts/utils.js").then(() => {
  console.log("JS carregado com sucesso!");
}).catch(console.error);
```

### Carregar um CSS
```ts
Loader.css("/styles/theme.css").then(() => {
  console.log("CSS aplicado!");
}).catch(console.error);
```

### Múltiplos arquivos
```ts
await Loader.js(["/lib/a.js", "/lib/b.js"]);
await Loader.css(["/css/reset.css", "/css/main.css"]);
```

---

## 🧠 API

### `Loader.js(path: string | string[], async = true, timeoutMs = 10000): Promise<boolean | boolean[]>`
Carrega um ou mais arquivos JS. Usa `async` por padrão. Retorna `true` ou um array de `true` se bem-sucedido.

### `Loader.css(path: string | string[], async = true, timeoutMs = 10000): Promise<boolean | boolean[]>`
Carrega um ou mais arquivos CSS. Retorna `true` ou um array de `true` se bem-sucedido.

---

## ⚠️ Observações

- Recursos são carregados apenas uma vez por URL.
- Rejeita com erro em caso de falha ou timeout.
- Não depende de nenhuma biblioteca externa.

---

## 📄 Licença

MIT

---

## 👤 Autor

Koph <kophmail@gmail.com>

---

## 🔗 Repositório

[https://github.com/koph-git/ts-lib](https://github.com/koph-git/ts-lib)



