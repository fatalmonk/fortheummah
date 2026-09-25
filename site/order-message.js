window.ForTheUmmahOrder = Object.freeze({
  buildWhatsAppUrl(product, variant, quantity, name, phone, area, frame, note = '') {
    const id = String(product.id);
    const title = String(product.title);
    const qty = Number(quantity);
    const customerName = String(name).trim();
    const mobile = String(phone).trim();
    const deliveryAddress = String(area).trim();
    const frameSelected = frame === true;
    const additionalNote = String(note).trim();
    if (!/^[A-Z]\d{2}$/.test(id)) throw new TypeError('Invalid product ID.');
    if (!title || !['500', '1000'].includes(String(variant)) || !Number.isInteger(qty) || qty < 1 || qty > 99) throw new TypeError('Invalid product variant or quantity.');
    if (!customerName || customerName.length > 100 || !/^\+?[0-9][0-9 -]{7,18}$/.test(mobile)) throw new TypeError('Enter a name and valid mobile number.');
    if (!deliveryAddress || deliveryAddress.length > 300) throw new TypeError('Enter a full delivery address of 1 to 300 characters.');
    if (additionalNote.length > 500) throw new TypeError('The note must be 500 characters or fewer.');
    const message = [
      'Assalamu alaikum! I would like to enquire about a For the Ummah puzzle design.',
      `Design: ${id} — ${title}`,
      `Puzzle: ${variant}-piece — BDT ${variant === '500' ? '3,000' : '4,000'}`,
      `Quantity: ${qty}`,
      `Optional wooden frame kit: ${frameSelected ? 'Yes (+BDT 3,000 each)' : 'No'}`,
      `Name: ${customerName}`,
      `Mobile: ${mobile}`,
      `Delivery address: ${deliveryAddress}`,
      additionalNote ? `Note: ${additionalNote}` : '',
      'Please confirm design/artwork status, availability, production lead time, applicable delivery fee and estimate, and payment arrangements. I understand this is an enquiry only; orders are not currently being accepted and this message does not confirm an order.',
    ].filter(Boolean).join('\n');
    return `https://wa.me/8801731944544?text=${encodeURIComponent(message)}`;
  },
});
