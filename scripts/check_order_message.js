// Exercise the exact browser helper without opening a browser or sending a message.
import fs from 'node:fs';
import vm from 'node:vm';
const context = { window: {} };
vm.runInNewContext(fs.readFileSync('site/order-message.js', 'utf8'), context);
const build = context.window.ForTheUmmahOrder.buildWhatsAppUrl;
const url = build({ id: 'C05', title: 'Dua Qunoot — opening excerpt' }, 2, 'Uttara, Dhaka', 'Please confirm artwork & delivery');
const parsed = new URL(url);
const message = parsed.searchParams.get('text');
const expected = [
  'Design: C05 — Dua Qunoot — opening excerpt',
  'Quantity: 2',
  'Delivery area: Uttara, Dhaka',
  'Note: Please confirm artwork & delivery',
];
if (parsed.origin !== 'https://wa.me' || parsed.pathname !== '/8801731944544') throw new Error('Unexpected WhatsApp destination.');
for (const line of expected) if (!message.includes(line)) throw new Error(`Missing encoded message field: ${line}`);
for (const [product, quantity, area, note] of [
  [{ id: 'INVALID', title: 'Bad' }, 1, 'Dhaka', ''],
  [{ id: 'A01', title: 'Kaaba' }, 0, 'Dhaka', ''],
  [{ id: 'A01', title: 'Kaaba' }, 100, 'Dhaka', ''],
  [{ id: 'A01', title: 'Kaaba' }, 1, '  ', ''],
  [{ id: 'A01', title: 'Kaaba' }, 1, 'Dhaka', 'x'.repeat(501)],
]) {
  let rejected = false;
  try { build(product, quantity, area, note); } catch { rejected = true; }
  if (!rejected) throw new Error('An invalid enquiry was accepted.');
}
console.log('PASS: destination and decoded enquiry fields are correct; invalid IDs, quantities and form fields are rejected. No message was sent.');
