// Exercise the exact browser helper without opening a browser or sending a message.
import fs from 'node:fs';
import vm from 'node:vm';
const context = { window: {} };
vm.runInNewContext(fs.readFileSync('site/order-message.js', 'utf8'), context);
const build = context.window.ForTheUmmahOrder.buildWhatsAppUrl;
const url = build({ id: 'C05', title: 'Dua Qunoot — opening excerpt' }, '1000', 2, 'Amina Rahman', '+880 1712-345678', 'House 8, Road 2, Uttara, Dhaka', true, 'Please confirm artwork & delivery');
const parsed = new URL(url);
const message = parsed.searchParams.get('text');
const expected = [
  'Design: C05 — Dua Qunoot — opening excerpt',
  'Puzzle: 1000-piece — BDT 4,000',
  'Quantity: 2',
  'Optional wooden frame kit: Yes (+BDT 3,000 each)',
  'Name: Amina Rahman',
  'Mobile: +880 1712-345678',
  'Delivery address: House 8, Road 2, Uttara, Dhaka',
  'Note: Please confirm artwork & delivery',
  'orders are not currently being accepted',
];
if (parsed.origin !== 'https://wa.me' || parsed.pathname !== '/8801731944544') throw new Error('Unexpected WhatsApp destination.');
for (const line of expected) if (!message.includes(line)) throw new Error(`Missing encoded message field: ${line}`);
for (const args of [
  [{ id: 'INVALID', title: 'Bad' }, '500', 1, 'A', '01712345678', 'Dhaka', false, ''],
  [{ id: 'A01', title: 'Kaaba' }, '250', 1, 'Amina', '01712345678', 'Dhaka', false, ''],
  [{ id: 'A01', title: 'Kaaba' }, '500', 0, 'Amina', '01712345678', 'Dhaka', false, ''],
  [{ id: 'A01', title: 'Kaaba' }, '500', 100, 'Amina', '01712345678', 'Dhaka', false, ''],
  [{ id: 'A01', title: 'Kaaba' }, '500', 1, '', '01712345678', 'Dhaka', false, ''],
  [{ id: 'A01', title: 'Kaaba' }, '500', 1, 'Amina', 'abc', 'Dhaka', false, ''],
  [{ id: 'A01', title: 'Kaaba' }, '500', 1, 'Amina', '01712345678', '  ', false, ''],
  [{ id: 'A01', title: 'Kaaba' }, '500', 1, 'Amina', '01712345678', 'Dhaka', false, 'x'.repeat(501)],
  [{ id: 'A01', title: 'Kaaba' }, '500', 1, 'Amina', '01712345678', 'x'.repeat(301), false, ''],
]) {
  let rejected = false;
  try { build(...args); } catch { rejected = true; }
  if (!rejected) throw new Error('An invalid enquiry was accepted.');
}
console.log('PASS: destination and decoded enquiry fields are correct; invalid IDs, quantities and form fields are rejected. No message was sent.');
