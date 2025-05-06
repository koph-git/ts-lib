/**
 * debounce.ts
 * @version 1.0.0
 * @author Koph <kophmail@gmail.com>
 *
 * Função utilitária para debouncing de funções
 * Esta função `debounce` é um utilitário que impede que uma função seja chamada
 * repetidamente em um curto período de tempo. Em vez disso, a execução da função
 * é adiada até que o tempo especificado (`delay`) tenha se passado desde a última chamada.
 *
 * O mecanismo de "debounce" é útil para evitar execuções excessivas de funções em eventos
 * como entrada de texto em um campo de busca, redimensionamento de janela, rolagem de página
 * e outras interações de usuário que podem disparar eventos rapidamente.
 *
 * ----------------------------------------------------------
 * 📌 Definições de Tipos:
 *
 * - `DebounceFunction<T>`:
 *   - Tipo utilitário que define a assinatura da função debounced.
 *   - Mantém os mesmos parâmetros da função original (`T`), mas retorna `void`,
 *     pois a execução é adiada e não retorna um valor imediatamente.
 *
 * ----------------------------------------------------------
 * 📌 Função `debounce<T>(func: T, delay: number): DebounceFunction<T>`
 *
 * **Parâmetros:**
 *   - `func`: A função original que será "debounced".
 *   - `delay`: Tempo de espera (em milissegundos) antes de chamar a função `func`
 *              após a última execução.
 *
 * **Retorno:**
 *   - Retorna uma nova função que pode ser chamada normalmente, mas sua execução
 *     será atrasada pelo tempo especificado em `delay`.
 *   - Se `delay` for `0`, a função original será retornada sem modificações.
 *
 * ----------------------------------------------------------
 * 📌 Como funciona?
 *   - Cada vez que a função debounced é chamada, o temporizador anterior é cancelado
 *     (`clearTimeout`) e um novo temporizador (`setTimeout`) é criado.
 *   - A função original só será executada quando o usuário parar de chamar a função
 *     por pelo menos `delay` milissegundos.
 *
 * ----------------------------------------------------------
 * 📌 Exemplo de Uso:
 *
 * ```ts
 * // Função que será chamada após um tempo de espera
 * function logMessage(message: string) {
 *   console.log("Mensagem:", message);
 * }
 *
 * // Criando uma versão debounced da função, com 500ms de espera
 * const debouncedLog = debounce(logMessage, 500);
 *
 * // Chamadas consecutivas dentro de 500ms resetarão o timer
 * debouncedLog("Olá");
 * debouncedLog("Mundo");
 * debouncedLog("Debounce");
 *
 * // Apenas "Debounce" será impresso no console após 500ms sem novas chamadas.
 * ```
 *
 * ----------------------------------------------------------
 * 📌 Aplicações Comuns:
 *   - Evitar chamadas excessivas em eventos de input (ex.: autocomplete).
 *   - Melhorar a performance ao lidar com eventos de rolagem e redimensionamento de tela.
 *   - Controlar chamadas de API frequentes em aplicações web dinâmicas.
 *
 * ----------------------------------------------------------
 * 📌 Notas Importantes:
 *   - A função debounced **não retorna um valor**, pois a execução é assíncrona.
 *   - Se o `delay` for `0`, a função original é retornada sem alteração, garantindo eficiência.
 *   - Para garantir que o último evento seja sempre executado, pode ser necessário
 *     armazenar manualmente um timeout e chamar a função no final de um evento específico.
 *
 * ----------------------------------------------------------
 * 🚀 Desenvolvido para otimizar eventos e melhorar a performance em aplicações web!
 */

type DebounceFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number = 10): DebounceFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  if (delay == 0) {
    return func
  }

  return (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
