# @koph-npm/browser-device

> Identificador exclusivo e persistente do dispositivo (navegador), com redundância em múltiplos armazenamentos.

Este módulo gera um ID único para o navegador do usuário e o armazena de forma redundante em `localStorage`, `IndexedDB` e cookies. Isso garante persistência entre sessões e mesmo após atualizações da página.

---

## 📦 Instalação

```bash
npm install @koph-npm/browser-device
```

---

## 🚀 Uso básico

```ts
import { Device } from '@koph-npm/browser-device';

async function init() {
  const id = await Device.id();
  console.log("ID único do dispositivo:", id);
}

init();
```

> Exemplo de saída: `'f7c93089-4a7e-4a9c-8c52-1b2b4b1f00a1'`

---

## ⚙️ API

### `Device.id(): Promise<string>`

Retorna o ID persistente do dispositivo. Gera um novo se necessário e salva em todos os meios disponíveis.

---

## ⚠️ Observações

- Utiliza `crypto.randomUUID()` se disponível; caso contrário, gera UUID manualmente.
- Ideal para rastrear dispositivos em SPAs e apps offline.
- Funciona apenas em ambientes de navegador.

---

## 📄 Licença

MIT

---

## 👤 Autor

Koph <kophmail@gmail.com>

---

## 🔗 Repositório

[https://github.com/koph-git/ts-lib](https://github.com/koph-git/ts-lib)

