import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createController } from '../src/controller.ts'
import { type Fixture, newDoc, pageHtml, USAGE } from './fixtures.ts'

const FOOTER = '[data-testid="chat-footer-row"]'
const MODEL = '[data-testid="model-selector-dropdown"]'
const CRAB = '[data-crab-band="crab"]'
const LIMITS = '[data-crab-band="limits"]'

const setup = (f: Fixture, cookie = 'lastActiveOrg=0b7e9c2a-1111-4222-8333-444455556666') => {
  const doc = newDoc(f)
  let calls = 0
  const fake = (async () => { calls += 1; return new Response(JSON.stringify(USAGE)) }) as typeof fetch
  let t = 0
  const ctl = createController({ doc, fetch: fake, now: () => (t += 1000), cookie: () => cookie })
  return { doc, ctl, fetches: () => calls, setPage(g: Fixture) { doc.body.innerHTML = pageHtml(g) } }
}
const settle = () => new Promise(resolve => setTimeout(resolve, 0))
const svgOf = (doc: Document): string => doc.querySelector(CRAB)!.shadowRoot!.querySelector('.crab')!.innerHTML
const stepOf = (doc: Document) => doc.querySelector(CRAB)!.shadowRoot!.querySelector('.step') as HTMLElement

test('working: one crab in the footer row, dancing, with the step', () => {
  const { doc, ctl } = setup({ stop: true, steps: ['Run a 20-second demo computation loop'] })
  ctl.tick()
  const hosts = doc.querySelectorAll(CRAB)
  assert.equal(hosts.length, 1)
  assert.equal(hosts[0].parentElement, doc.querySelector(FOOTER))
  assert.match(hosts[0].shadowRoot!.innerHTML, /c-medium run/)
  assert.equal(hosts[0].shadowRoot!.querySelector('.step')!.textContent, 'Run a 20-second demo computation loop')
})
test('done: the crab stands still and the step goes', () => {
  const { doc, ctl, setPage } = setup({ stop: true, steps: ['Run a 20-second demo computation loop'] })
  ctl.tick()
  setPage({ stop: false, steps: ['Run a 20-second demo computation loop'] })
  ctl.tick()
  assert.equal(doc.querySelectorAll(CRAB).length, 1)
  assert.match(svgOf(doc), /class="c-medium"/)
  assert.doesNotMatch(svgOf(doc), / run"/)
  assert.equal(stepOf(doc).hidden, true)
})
test('no footer row: no crab, and a mounted crab is removed', () => {
  assert.equal((() => { const { doc, ctl } = setup({ footer: false }); ctl.tick(); return doc.querySelectorAll(CRAB).length })(), 0)
  const { doc, ctl } = setup({})
  ctl.tick()
  assert.equal(doc.querySelectorAll(CRAB).length, 1)
  doc.querySelector(FOOTER)!.removeAttribute('data-testid')
  ctl.tick()
  assert.equal(doc.querySelectorAll(CRAB).length, 0)
})
test('follows a re-rendered footer row', () => {
  const { doc, ctl } = setup({ stop: true })
  ctl.tick()
  const fresh = doc.createElement('div')
  fresh.setAttribute('data-testid', 'chat-footer-row')
  fresh.innerHTML = '<div data-testid="chat-footer-spark" data-state="hidden"></div>'
  doc.querySelector(FOOTER)!.replaceWith(fresh)
  ctl.tick()
  const hosts = doc.querySelectorAll(CRAB)
  assert.equal(hosts.length, 1)
  assert.equal(hosts[0].parentElement, fresh)
})
test('a tick with nothing new writes nothing', async () => {
  const { doc, ctl } = setup({ stop: true, steps: ['Run a 20-second demo computation loop'] })
  ctl.tick()
  const records: MutationRecord[] = []
  const observer = new (doc.defaultView as any).MutationObserver((rs: MutationRecord[]) => records.push(...rs))
  observer.observe(doc.body, { subtree: true, childList: true, attributes: true, characterData: true })
  ctl.tick()
  await Promise.resolve()
  records.push(...observer.takeRecords())
  observer.disconnect()
  assert.equal(records.length, 0)
})
test('the outfit follows the model picker', () => {
  const { doc, ctl } = setup({})
  ctl.tick()
  assert.match(svgOf(doc), /c-medium/)
  doc.querySelector(MODEL)!.setAttribute('aria-label', 'Model: Sonnet 5.5')
  ctl.tick()
  assert.match(svgOf(doc), /c-sonnet/)
})
test('limits sit just before the model button', async () => {
  const { doc, ctl } = setup({})
  await ctl.refreshLimits()
  const host = doc.querySelector(LIMITS) as HTMLElement
  assert.equal(host.nextElementSibling, doc.querySelector(MODEL))
  assert.equal(host.hidden, false)
  assert.equal(host.shadowRoot!.textContent!.trim(), '5h 6% · 7d 91%')
})
test('only the end of a reply refreshes the limits', async () => {
  const { ctl, fetches, setPage } = setup({ stop: true })
  ctl.tick(); ctl.tick()
  await settle()
  assert.equal(fetches(), 0)
  setPage({ stop: false })
  ctl.tick(); ctl.tick(); ctl.tick()
  await settle()
  assert.equal(fetches(), 1)
})
test('no cookie, no request, limits hidden', async () => {
  const { doc, ctl, fetches } = setup({}, '')
  ctl.tick()
  await ctl.refreshLimits()
  assert.equal(fetches(), 0)
  const host = doc.querySelector(LIMITS) as HTMLElement | null
  assert.ok(host === null || host.hidden)
})
test('a broken page never throws', () => {
  const doc = newDoc({}); (doc as any).querySelector = () => { throw new Error('boom') }
  assert.doesNotThrow(() => createController({ doc, fetch, now: () => 0, cookie: () => '' }).tick())
})
