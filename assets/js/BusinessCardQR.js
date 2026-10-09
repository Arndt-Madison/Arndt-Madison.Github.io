// QR feature for Madison's business-card page.
// There are no branches: only the site origin and /BizCard.
export function getBusinessCardURL(){
    return new URL('/BizCard', window.location.origin).href;
}

// QR background must be an opaque hex color, so phone cameras can scan it.
function validColor(value, fallback){
    return typeof value === 'string' && /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value)
        ? value : fallback;
}

export async function renderCardQR(settings){
    const wrap = document.querySelector('[data-card-qr]');
    const link = document.querySelector('[data-card-qr-link]');
    if(!wrap) return;

    const url = getBusinessCardURL();
    const colors = settings?.brand?.colors || {};
    wrap.style.setProperty('--qr-accent', validColor(colors.accent, '#ffffff'));

    if(link){
        link.href = url;
        link.textContent = url;
    }

    try{
        // Local QR library is loaded only on the business-card page.
        const QR = await import('/assets/js/vendor/qrcode.min.js');
        const svg = QR.generateSVG(url, {
            margin: 4,
            color: '#000000',
            background: validColor(colors.qrBackground, '#ffffff')
        });
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', `QR code linking to ${url}`);
        svg.setAttribute('width', '220');
        svg.setAttribute('height', '220');
        wrap.replaceChildren(svg);
    }catch(error){
        console.error('Business card QR failed:', error);
        const message = document.createElement('p');
        message.textContent = 'QR code unavailable. Use the link below.';
        wrap.replaceChildren(message);
    }
}
