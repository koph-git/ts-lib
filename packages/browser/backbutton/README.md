# @koph-npm/browser-backbutton

> Gerencie ações personalizadas ao pressionar o botão "voltar" do navegador.

Este módulo fornece uma API simples e poderosa para interceptar e controlar o comportamento do botão de "voltar" no navegador. Ideal para SPAs, modais, formulários ou fluxos com navegação controlada.

---

## 📦 Instalação

```bash
npm install @koph-npm/browser-backbutton
```

---

## 🚀 Uso básico

### 1. Registrar ação personalizada ao voltar

```ts
import { BackButton } from '@koph-npm/browser-backbutton';

BackButton.onNextAction(() => {
  console.log('Fechando modal...');
  fecharModal();
});
```

> Isso adiciona um estado ao `history` e executa a função registrada se o usuário clicar em "voltar".

---

### 2. Cancelar a próxima ação (sem executá-la)

```ts
BackButton.cancelNextAction(true); // cancela e impede que a função seja executada
```

---

### 3. Limpar todas as ações registradas

```ts
await BackButton.clear(); // desfaz todos os estados e executa os callbacks (se aplicável)
```

---

## 🧠 API

### `BackButton.onNextAction(callback: () => void): Promise<void>`

Registra uma nova ação para ser executada ao voltar no histórico.

### `BackButton.cancelNextAction(cancel?: boolean): Promise<void>`

Cancela a próxima ação registrada. Se `cancel = true`, o callback não será executado.

### `BackButton.clear(): Promise<void>`

Remove todas as ações registradas e reverte o histórico.

---

## ⚠️ Observações

- Este módulo só funciona em **ambientes de navegador**.
- Evite múltiplas instâncias do módulo na mesma aplicação.
- Use com cuidado em apps que já manipulam `window.history`.

---

## 📄 Licença

MIT

---

## 👤 Autor

Koph <kophmail@gmail.com>

---

## 🔗 Repositório

[https://github.com/koph-git/ts-lib](https://github.com/koph-git/ts-lib)

