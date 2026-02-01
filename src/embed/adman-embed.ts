;(function () {
  const scriptTag = document.currentScript as HTMLScriptElement | null
  const BASE_URL = scriptTag?.getAttribute('data-base-url') ?? ''

  const containers = document.querySelectorAll<HTMLElement>('[data-adman-id]')

  containers.forEach(async (container) => {
    const adId = container.getAttribute('data-adman-id')
    if (!adId) return

    try {
      const res = await fetch(`${BASE_URL}/api/serve/${adId}`)
      if (!res.ok) return
      const ad = await res.json()
      renderByType(container, ad)
    } catch {
      // Silent fail - don't break the host page
    }
  })

  function escapeHtml(str: string): string {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  function resolveImageSrc(url: string): string {
    return url.startsWith('http') ? url : `${BASE_URL}${url}`
  }

  function bgImageStyles(url?: string): Record<string, string> {
    if (!url) return {}
    const src = url.startsWith('http') ? url : `${BASE_URL}${url}`
    return {
      backgroundImage: `url(${src})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }

  function baseStyles(style: Record<string, string | number>, backgroundImageUrl?: string): Record<string, string> {
    return {
      backgroundColor: String(style.backgroundColor),
      color: String(style.textColor),
      borderRadius: String(style.borderRadius),
      padding: String(style.padding),
      maxWidth: String(style.maxWidth),
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      boxSizing: 'border-box',
      ...bgImageStyles(backgroundImageUrl),
    }
  }

  function ctaHtml(ad: Record<string, unknown>): string {
    const style = ad.style as Record<string, string>
    return `<a href="${escapeHtml(ad.ctaUrl as string)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:${style.ctaBackgroundColor};color:${style.ctaTextColor};padding:8px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;white-space:nowrap">${escapeHtml(ad.ctaText as string)}</a>`
  }

  function dismissBtn(color: string): string {
    return `<button onclick="this.closest('[data-adman-wrapper]').remove()" style="background:none;border:none;cursor:pointer;font-size:18px;line-height:1;opacity:0.7;padding:4px 8px;color:${color}">✕</button>`
  }

  function imageHtml(ad: Record<string, unknown>, maxHeight: string, extraStyle = ''): string {
    const imageUrl = ad.imageUrl as string | undefined
    if (!imageUrl) return ''
    return `<img src="${escapeHtml(resolveImageSrc(imageUrl))}" alt="" style="max-width:100%;border-radius:4px;margin-bottom:8px;object-fit:cover;max-height:${maxHeight};${extraStyle}" />`
  }

  function renderByType(container: HTMLElement, ad: Record<string, unknown>): void {
    const type = ad.type as string
    switch (type) {
      case 'bottom-banner':
        return renderBottomBanner(container, ad)
      case 'top-notification':
        return renderTopNotification(ad)
      case 'in-article-banner':
        return renderInArticleBanner(container, ad)
      case 'modal-popup':
        return renderModalPopup(ad)
      case 'sidebar-card':
        return renderSidebarCard(container, ad)
      default:
        return renderInArticleBanner(container, ad)
    }
  }

  function renderBottomBanner(_container: HTMLElement, ad: Record<string, unknown>): void {
    const style = ad.style as Record<string, string | number>
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-adman-wrapper', '')

    Object.assign(wrapper.style, {
      ...baseStyles(style, ad.backgroundImageUrl as string | undefined),
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      zIndex: String(style.zIndex),
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
    })

    let html = ''
    const imageUrl = ad.imageUrl as string | undefined
    if (imageUrl) {
      html += `<img src="${escapeHtml(resolveImageSrc(imageUrl))}" alt="" style="width:80px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0" />`
    }
    html += `<div style="flex:1;min-width:0">`
    html += `<h3 style="margin:0 0 4px;font-size:16px;font-weight:600">${escapeHtml(ad.headline as string)}</h3>`
    const bodyText = ad.bodyText as string
    if (bodyText) {
      html += `<p style="margin:0;font-size:13px;opacity:0.85;line-height:1.4">${escapeHtml(bodyText)}</p>`
    }
    html += `</div>`
    html += ctaHtml(ad)

    wrapper.innerHTML = html
    document.body.appendChild(wrapper)
  }

  function renderTopNotification(ad: Record<string, unknown>): void {
    const style = ad.style as Record<string, string | number>
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-adman-wrapper', '')

    Object.assign(wrapper.style, {
      ...baseStyles(style, ad.backgroundImageUrl as string | undefined),
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      zIndex: String(style.zIndex),
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    })

    let html = `<span style="flex:1;font-size:14px;font-weight:500">${escapeHtml(ad.headline as string)}</span>`
    html += ctaHtml(ad).replace('padding:8px 20px', 'padding:6px 16px').replace('font-size:14px', 'font-size:13px')
    html += dismissBtn(String(style.textColor))

    wrapper.innerHTML = html
    document.body.appendChild(wrapper)
  }

  function renderInArticleBanner(container: HTMLElement, ad: Record<string, unknown>): void {
    const style = ad.style as Record<string, string | number>
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-adman-wrapper', '')

    Object.assign(wrapper.style, {
      ...baseStyles(style, ad.backgroundImageUrl as string | undefined),
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    })

    let html = imageHtml(ad, '200px', 'width:100%')
    html += `<h3 style="margin:0 0 6px;font-size:18px;font-weight:600">${escapeHtml(ad.headline as string)}</h3>`
    const bodyText = ad.bodyText as string
    if (bodyText) {
      html += `<p style="margin:0 0 12px;font-size:14px;opacity:0.85;line-height:1.5">${escapeHtml(bodyText)}</p>`
    }
    html += ctaHtml(ad)

    wrapper.innerHTML = html
    container.appendChild(wrapper)
  }

  function renderModalPopup(ad: Record<string, unknown>): void {
    const style = ad.style as Record<string, string | number>
    const backdrop = document.createElement('div')
    backdrop.setAttribute('data-adman-wrapper', '')

    Object.assign(backdrop.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: String(style.zIndex),
    })

    const card = document.createElement('div')
    Object.assign(card.style, {
      ...baseStyles(style, ad.backgroundImageUrl as string | undefined),
      maxWidth: '400px',
      width: '90%',
      position: 'relative',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    })

    let html = `<div style="position:absolute;top:8px;right:8px">${dismissBtn(String(style.textColor))}</div>`
    html += imageHtml(ad, '180px', 'width:100%')
    html += `<h3 style="margin:0 0 8px;font-size:20px;font-weight:600">${escapeHtml(ad.headline as string)}</h3>`
    const bodyText = ad.bodyText as string
    if (bodyText) {
      html += `<p style="margin:0 0 16px;font-size:14px;opacity:0.85;line-height:1.5">${escapeHtml(bodyText)}</p>`
    }
    html += ctaHtml(ad).replace('display:inline-block', 'display:block;text-align:center;width:100%')

    card.innerHTML = html
    backdrop.appendChild(card)

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.remove()
    })

    document.body.appendChild(backdrop)
  }

  function renderSidebarCard(container: HTMLElement, ad: Record<string, unknown>): void {
    const style = ad.style as Record<string, string | number>
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-adman-wrapper', '')

    Object.assign(wrapper.style, {
      ...baseStyles(style, ad.backgroundImageUrl as string | undefined),
      maxWidth: '280px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    })

    let html = imageHtml(ad, '160px', 'width:100%')
    html += `<h3 style="margin:0 0 6px;font-size:16px;font-weight:600">${escapeHtml(ad.headline as string)}</h3>`
    const bodyText = ad.bodyText as string
    if (bodyText) {
      html += `<p style="margin:0 0 12px;font-size:13px;opacity:0.85;line-height:1.4">${escapeHtml(bodyText)}</p>`
    }
    html += ctaHtml(ad).replace('display:inline-block', 'display:block;text-align:center;width:100%;font-size:13px')

    wrapper.innerHTML = html
    container.appendChild(wrapper)
  }
})()
