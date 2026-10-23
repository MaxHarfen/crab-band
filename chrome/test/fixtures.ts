// Synthetic claude.ai pages, built from the recon table in the design (claude.ai build 6f837c723e).
// No text here comes from a real chat.
import { Window } from 'happy-dom'

export type Fixture = { stop?: boolean; streaming?: boolean; steps?: string[]; model?: string | null; footer?: boolean }

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const pageHtml = (f: Fixture): string => {
  const { stop = false, streaming = false, steps = [], footer = true } = f
  const model = f.model === undefined ? 'Opus 5.5 Medium' : f.model
  const turns = steps
    .map(s => `<div data-cds="TurnStatus" data-state="done"><span role="status" data-morph-key="done|${esc(s)}">${esc(s)}</span></div>`)
    .join('')
  return [
    `<div data-testid="assistant-message" data-is-streaming="${streaming}">${turns}<p>A synthetic reply.</p></div>`,
    // claude.ai keeps the footer row inside an `invisible` wrapper while its spark is hidden (live check, 2026-10-23).
    footer
      ? '<div data-testid="transcript-trailing"><div class="flow-root"><div class="invisible" style="visibility:hidden">' +
        '<div data-testid="chat-footer-row"><div data-testid="chat-footer-spark" data-state="hidden"></div></div></div></div></div>'
      : '',
    stop
      ? '<button data-testid="chat-input-stop" aria-label="Stop response"></button>'
      : '<button data-testid="chat-input-send" aria-label="Send message"></button>',
    model === null ? '' : `<button data-testid="model-selector-dropdown" aria-label="Model: ${esc(model)}">${esc(model)}</button>`,
  ].join('')
}

export const newDoc = (f: Fixture): Document => {
  const window = new Window({ url: 'https://claude.ai/chat/demo' })
  window.document.body.innerHTML = pageHtml(f)
  return window.document as unknown as Document
}

// The usage endpoint's reply, in the shape seen on 2026-10-22, with made-up numbers.
export const USAGE = {
  five_hour: { utilization: 6, resets_at: '2026-10-22T13:40:00.788961+00:00' },
  seven_day: { utilization: 91, resets_at: '2026-10-23T23:00:00.788980+00:00' },
  extra_usage: { is_enabled: false },
}
