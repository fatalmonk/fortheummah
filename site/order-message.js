window.ForTheUmmahOrder = Object.freeze({
  buildWhatsAppUrl(product, quantity, area, note = '') {
    const id = String(product.id);
    const title = String(product.title);
    const qty = Number(quantity);
    const deliveryArea = String(area).trim();
    const additionalNote = String(note).trim();
    if (!/^[A-Z]\d{2}$/.test(id)) throw new TypeError('Invalid product ID.');
    if (!title || !Number.isInteger(qty) || qty < 1 || qty > 99) throw new TypeError('Invalid quantity or product.');
    if (!deliveryArea || deliveryArea.length > 100) throw new TypeError('Enter a delivery area of 1 to 100 characters.');
    if (additionalNote.length > 500) throw new TypeError('The note must be 500 characters or fewer.');
    const message = [
      'Assalamu alaikum! I would like to enquire about a For the Ummah puzzle concept.',
      `Design: ${id} — ${title}`,
      `Quantity: ${qty}`,
      'Indicative price range: BDT 3,000–4,000 each (please confirm exact price).',
      `Delivery area: ${deliveryArea}`,
      additionalNote ? `Note: ${additionalNote}` : '',
      'Please confirm final artwork, availability, exact price, delivery charge, delivery time and payment arrangements. I understand this is an enquiry, not a confirmed order.',
    ].filter(Boolean).join('\n');
    return `https://wa.me/8801731944544?text=${encodeURIComponent(message)}`;
  },
});
