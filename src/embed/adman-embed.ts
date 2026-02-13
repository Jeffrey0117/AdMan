;(function () {
  const scriptTag = document.currentScript as HTMLScriptElement | null

  function resolveBaseUrl(): string {
    const explicit = scriptTag?.getAttribute('data-base-url')
    if (explicit) return explicit.replace(/\/+$/, '')
    const src = scriptTag?.getAttribute('src') ?? ''
    try {
      const url = new URL(src, window.location.href)
      return url.origin
    } catch {
      return ''
    }
  }

  const BASE_URL = resolveBaseUrl()

  const containers = document.querySelectorAll<HTMLElement>('[data-adman-id]')

  containers.forEach(async (container) => {
    const adId = container.getAttribute('data-adman-id')
    if (!adId) return

    try {
      const res = await fetch(`${BASE_URL}/api/serve/${adId}`)
      if (!res.ok) return
      const ad = await res.json()

      const overrides = readOverrides(container)
      const mergedStyle = { ...ad.style, ...overrides }
      const mergedAd = { ...ad, style: mergedStyle }

      renderByType(container, mergedAd)
    } catch {
      // Silent fail - don't break the host page
    }
  })

  function readOverrides(container: HTMLElement): Record<string, string> {
    const map: Record<string, string | undefined> = {
      backgroundColor: container.getAttribute('data-bg-color') ?? undefined,
      textColor: container.getAttribute('data-text-color') ?? undefined,
      fontSize: container.getAttribute('data-font-size') ?? undefined,
      ctaBackgroundColor: container.getAttribute('data-cta-bg-color') ?? undefined,
      ctaTextColor: container.getAttribute('data-cta-text-color') ?? undefined,
      borderRadius: container.getAttribute('data-border-radius') ?? undefined,
      padding: container.getAttribute('data-padding') ?? undefined,
      maxWidth: container.getAttribute('data-max-width') ?? undefined,
      textAlign: container.getAttribute('data-text-align') ?? undefined,
    }
    return Object.fromEntries(
      Object.entries(map).filter(([, v]) => v !== undefined)
    ) as Record<string, string>
  }

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
    const styles: Record<string, string> = {
      backgroundColor: String(style.backgroundColor),
      color: String(style.textColor),
      borderRadius: String(style.borderRadius),
      padding: String(style.padding),
      maxWidth: String(style.maxWidth),
      fontSize: style.fontSize ? String(style.fontSize) : '16px',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      boxSizing: 'border-box',
      ...bgImageStyles(backgroundImageUrl),
    }
    if (style.textAlign) {
      styles.textAlign = String(style.textAlign)
    }
    return styles
  }

  function ctaHtml(ad: Record<string, unknown>): string {
    const style = ad.style as Record<string, string>
    return `<a href="${escapeHtml(ad.ctaUrl as string)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:${style.ctaBackgroundColor};color:${style.ctaTextColor};padding:8px 20px;border-radius:6px;text-decoration:none;font-size:0.875em;font-weight:500;white-space:nowrap">${escapeHtml(ad.ctaText as string)}</a>`
  }

  function dismissBtn(color: string): string {
    return `<button onclick="this.closest('[data-adman-wrapper]').remove()" style="background:none;border:none;cursor:pointer;font-size:1.125em;line-height:1;opacity:0.7;padding:4px 8px;color:${color}">&#10005;</button>`
  }

  function imageHtml(ad: Record<string, unknown>, maxHeight: string, extraStyle = ''): string {
    const imageUrl = ad.imageUrl as string | undefined
    if (!imageUrl) return ''
    return `<img src="${escapeHtml(resolveImageSrc(imageUrl))}" alt="" style="max-width:100%;border-radius:4px;margin-bottom:8px;object-fit:cover;max-height:${maxHeight};${extraStyle}" />`
  }

  function isMobile(): boolean {
    return window.innerWidth < 640
  }

  function renderByType(container: HTMLElement, ad: Record<string, unknown>): void {
    const category = (ad.category as string) || 'ad'

    if (category === 'login-form') {
      return renderLoginForm(container, ad)
    }
    if (category === 'feedback-form') {
      return renderFeedbackForm(container, ad)
    }

    const type = ad.type as string
    switch (type) {
      case 'bottom-banner':
        return renderBottomBanner(container, ad)
      case 'top-notification':
        return renderTopNotification(container, ad)
      case 'in-article-banner':
        return renderInArticleBanner(container, ad)
      case 'modal-popup':
        return renderModalPopup(container, ad)
      case 'sidebar-card':
        return renderSidebarCard(container, ad)
      default:
        return renderInArticleBanner(container, ad)
    }
  }

  function renderBottomBanner(_container: HTMLElement, ad: Record<string, unknown>): void {
    const style = ad.style as Record<string, string | number>
    const mobile = isMobile()
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
      flexDirection: mobile ? 'column' : 'row',
      alignItems: mobile ? 'stretch' : 'center',
      gap: mobile ? '12px' : '16px',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
    })

    let html = ''
    const imageUrl = ad.imageUrl as string | undefined
    // Hide image on mobile to save space
    if (imageUrl && !mobile) {
      html += `<img src="${escapeHtml(resolveImageSrc(imageUrl))}" alt="" style="width:80px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0" />`
    }
    html += `<div style="flex:1;min-width:0">`
    html += `<h3 style="margin:0 0 4px;font-size:1em;font-weight:600">${escapeHtml(ad.headline as string)}</h3>`
    const bodyText = ad.bodyText as string
    if (bodyText) {
      html += `<p style="margin:0;font-size:0.8125em;opacity:0.85;line-height:1.4">${escapeHtml(bodyText)}</p>`
    }
    html += `</div>`
    // Full-width CTA on mobile
    if (mobile) {
      html += ctaHtml(ad).replace('display:inline-block', 'display:block;text-align:center;width:100%')
    } else {
      html += ctaHtml(ad)
    }

    wrapper.innerHTML = html
    document.body.appendChild(wrapper)
  }

  function renderTopNotification(_container: HTMLElement, ad: Record<string, unknown>): void {
    const style = ad.style as Record<string, string | number>
    const mobile = isMobile()
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
      flexDirection: mobile ? 'column' : 'row',
      alignItems: mobile ? 'stretch' : 'center',
      gap: mobile ? '8px' : '12px',
      padding: mobile ? '12px 16px' : '10px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    })

    let html = ''
    if (mobile) {
      // Mobile: headline row with dismiss, then CTA below
      html += `<div style="display:flex;align-items:center;gap:8px">`
      html += `<span style="flex:1;font-size:0.875em;font-weight:500">${escapeHtml(ad.headline as string)}</span>`
      html += dismissBtn(String(style.textColor))
      html += `</div>`
      html += ctaHtml(ad).replace('display:inline-block', 'display:block;text-align:center;width:100%').replace('padding:8px 20px', 'padding:8px 16px')
    } else {
      html += `<span style="flex:1;font-size:0.875em;font-weight:500">${escapeHtml(ad.headline as string)}</span>`
      html += ctaHtml(ad).replace('padding:8px 20px', 'padding:6px 16px').replace('font-size:0.875em', 'font-size:0.8125em')
      html += dismissBtn(String(style.textColor))
    }

    wrapper.innerHTML = html
    document.body.appendChild(wrapper)
  }

  function renderInArticleBanner(container: HTMLElement, ad: Record<string, unknown>): void {
    const style = ad.style as Record<string, string | number>
    const mobile = isMobile()
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-adman-wrapper', '')

    Object.assign(wrapper.style, {
      ...baseStyles(style, ad.backgroundImageUrl as string | undefined),
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    })

    let html = imageHtml(ad, mobile ? '150px' : '200px', 'width:100%')
    html += `<h3 style="margin:0 0 6px;font-size:1.125em;font-weight:600">${escapeHtml(ad.headline as string)}</h3>`
    const bodyText = ad.bodyText as string
    if (bodyText) {
      html += `<p style="margin:0 0 12px;font-size:0.875em;opacity:0.85;line-height:1.5">${escapeHtml(bodyText)}</p>`
    }
    if (mobile) {
      html += ctaHtml(ad).replace('display:inline-block', 'display:block;text-align:center;width:100%')
    } else {
      html += ctaHtml(ad)
    }

    wrapper.innerHTML = html
    container.appendChild(wrapper)
  }

  function renderModalPopup(_container: HTMLElement, ad: Record<string, unknown>): void {
    const style = ad.style as Record<string, string | number>
    const mobile = isMobile()
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
      padding: mobile ? '16px' : '0',
    })

    const card = document.createElement('div')
    const cardStyles = baseStyles(style, ad.backgroundImageUrl as string | undefined)
    if (mobile) {
      cardStyles.padding = '16px'
    }
    Object.assign(card.style, {
      ...cardStyles,
      maxWidth: '400px',
      width: mobile ? '100%' : '90%',
      position: 'relative',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    })

    let html = `<div style="position:absolute;top:8px;right:8px">${dismissBtn(String(style.textColor))}</div>`
    html += imageHtml(ad, mobile ? '140px' : '180px', 'width:100%')
    html += `<h3 style="margin:0 0 8px;font-size:${mobile ? '1.125em' : '1.25em'};font-weight:600">${escapeHtml(ad.headline as string)}</h3>`
    const bodyText = ad.bodyText as string
    if (bodyText) {
      html += `<p style="margin:0 0 16px;font-size:0.875em;opacity:0.85;line-height:1.5">${escapeHtml(bodyText)}</p>`
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
    const mobile = isMobile()
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-adman-wrapper', '')

    Object.assign(wrapper.style, {
      ...baseStyles(style, ad.backgroundImageUrl as string | undefined),
      maxWidth: mobile ? '100%' : '280px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    })

    let html = imageHtml(ad, mobile ? '120px' : '160px', 'width:100%')
    html += `<h3 style="margin:0 0 6px;font-size:1em;font-weight:600">${escapeHtml(ad.headline as string)}</h3>`
    const bodyText = ad.bodyText as string
    if (bodyText) {
      html += `<p style="margin:0 0 12px;font-size:0.8125em;opacity:0.85;line-height:1.4">${escapeHtml(bodyText)}</p>`
    }
    html += ctaHtml(ad).replace('display:inline-block', 'display:block;text-align:center;width:100%;font-size:0.8125em')

    wrapper.innerHTML = html
    container.appendChild(wrapper)
  }

  // ── Widget Renderers ─────────────────────────────────────

  function inputStyles(textColor: string): string {
    return `width:100%;padding:10px 12px;border:1px solid ${textColor}20;border-radius:6px;font-size:14px;background:transparent;color:${textColor};box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`
  }

  function submitBtnStyles(bgColor: string, txtColor: string): string {
    return `display:block;width:100%;padding:10px;margin-top:16px;background:${bgColor};color:${txtColor};border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`
  }

  function renderLoginForm(container: HTMLElement, ad: Record<string, unknown>): void {
    const style = ad.style as Record<string, string | number>
    const config = (ad.widgetConfig || {}) as Record<string, unknown>
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-adman-wrapper', '')

    Object.assign(wrapper.style, {
      ...baseStyles(style),
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    })

    const title = escapeHtml((config.title as string) || 'Login')
    const subtitle = config.subtitle as string
    const submitText = escapeHtml((config.submitText as string) || 'Sign In')
    const submitUrl = (config.submitUrl as string) || ''
    const successRedirect = (config.successRedirect as string) || ''
    const fields = (config.fields as Array<Record<string, unknown>>) || [
      { name: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
      { name: 'password', type: 'password', label: 'Password', placeholder: '', required: true },
    ]
    const showSocialLogins = config.showSocialLogins as boolean
    const socialLogins = (config.socialLogins as string[]) || []
    const showRegisterLink = config.showRegisterLink as boolean
    const registerUrl = (config.registerUrl as string) || '#'
    const showForgotPassword = config.showForgotPassword as boolean
    const forgotPasswordUrl = (config.forgotPasswordUrl as string) || '#'
    const tc = String(style.textColor)

    let html = `<h3 style="margin:0 0 4px;font-size:20px;font-weight:600">${title}</h3>`
    if (subtitle) {
      html += `<p style="margin:0 0 16px;font-size:14px;opacity:0.7">${escapeHtml(subtitle)}</p>`
    }

    html += `<form data-adman-form action="${escapeHtml(submitUrl)}" data-redirect="${escapeHtml(successRedirect)}" style="display:flex;flex-direction:column;gap:12px">`
    for (const field of fields) {
      const label = escapeHtml(field.label as string)
      const req = field.required ? '<span style="color:#ef4444;margin-left:2px">*</span>' : ''
      html += `<div>`
      html += `<label style="display:block;font-size:13px;font-weight:500;margin-bottom:4px">${label}${req}</label>`
      html += `<input type="${field.type}" name="${field.name}" placeholder="${escapeHtml((field.placeholder as string) || '')}" ${field.required ? 'required' : ''} style="${inputStyles(tc)}" />`
      html += `</div>`
    }
    html += `<button type="submit" style="${submitBtnStyles(String(style.ctaBackgroundColor), String(style.ctaTextColor))}">${submitText}</button>`
    html += `</form>`

    if (showSocialLogins && socialLogins.length > 0) {
      html += `<div style="margin-top:16px;padding-top:16px;border-top:1px solid ${tc}15;display:flex;flex-direction:column;gap:8px">`
      const socialLabels: Record<string, string> = { google: 'Google', github: 'GitHub', facebook: 'Facebook' }
      const socialColors: Record<string, string> = { google: '#ea4335', github: '#333', facebook: '#1877f2' }
      for (const provider of socialLogins) {
        const label = socialLabels[provider] || provider
        const color = socialColors[provider] || '#666'
        html += `<button type="button" style="display:block;width:100%;padding:10px;background:transparent;border:1px solid ${tc}20;border-radius:6px;font-size:13px;cursor:pointer;color:${tc};font-family:-apple-system,BlinkMacSystemFont,sans-serif"><span style="color:${color};font-weight:600">${escapeHtml(label)}</span></button>`
      }
      html += `</div>`
    }

    if (showRegisterLink || showForgotPassword) {
      html += `<div style="margin-top:12px;display:flex;justify-content:space-between;font-size:12px">`
      if (showRegisterLink) {
        html += `<a href="${escapeHtml(registerUrl)}" style="color:${style.ctaBackgroundColor};text-decoration:none">Create account</a>`
      }
      if (showForgotPassword) {
        html += `<a href="${escapeHtml(forgotPasswordUrl)}" style="color:${tc};opacity:0.6;text-decoration:none">Forgot password?</a>`
      }
      html += `</div>`
    }

    wrapper.innerHTML = html
    container.appendChild(wrapper)

    // Form submission handler
    const form = wrapper.querySelector('[data-adman-form]') as HTMLFormElement | null
    if (form && submitUrl) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(form))
        try {
          const res = await fetch(submitUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (res.ok && successRedirect) {
            window.location.href = successRedirect
          }
        } catch {
          // silent fail
        }
      })
    }
  }

  function renderFeedbackForm(container: HTMLElement, ad: Record<string, unknown>): void {
    const style = ad.style as Record<string, string | number>
    const config = (ad.widgetConfig || {}) as Record<string, unknown>
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-adman-wrapper', '')

    Object.assign(wrapper.style, {
      ...baseStyles(style),
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    })

    const title = escapeHtml((config.title as string) || 'Feedback')
    const subtitle = config.subtitle as string
    const submitText = escapeHtml((config.submitText as string) || 'Send Feedback')
    const submitUrl = (config.submitUrl as string) || ''
    const successMessage = escapeHtml((config.successMessage as string) || 'Thank you for your feedback!')
    const fields = (config.fields as Array<Record<string, unknown>>) || [
      { name: 'name', type: 'text', label: 'Name', placeholder: 'Your name', required: true },
      { name: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
      { name: 'message', type: 'textarea', label: 'Message', placeholder: 'Your feedback...', required: true },
    ]
    const tc = String(style.textColor)

    let html = `<h3 style="margin:0 0 4px;font-size:20px;font-weight:600">${title}</h3>`
    if (subtitle) {
      html += `<p style="margin:0 0 16px;font-size:14px;opacity:0.7">${escapeHtml(subtitle)}</p>`
    }

    html += `<form data-adman-form action="${escapeHtml(submitUrl)}" data-success="${successMessage}" style="display:flex;flex-direction:column;gap:12px">`
    for (const field of fields) {
      const label = escapeHtml(field.label as string)
      const req = field.required ? '<span style="color:#ef4444;margin-left:2px">*</span>' : ''
      html += `<div>`
      html += `<label style="display:block;font-size:13px;font-weight:500;margin-bottom:4px">${label}${req}</label>`

      if (field.type === 'rating') {
        html += `<div data-adman-rating="${field.name}" style="display:flex;gap:4px">`
        for (let i = 1; i <= 5; i++) {
          html += `<span data-star="${i}" style="font-size:24px;cursor:pointer;opacity:0.3;color:#f59e0b">&#9733;</span>`
        }
        html += `<input type="hidden" name="${field.name}" value="0" />`
        html += `</div>`
      } else if (field.type === 'textarea') {
        html += `<textarea name="${field.name}" placeholder="${escapeHtml((field.placeholder as string) || '')}" ${field.required ? 'required' : ''} rows="3" style="${inputStyles(tc)};resize:vertical;font-family:-apple-system,BlinkMacSystemFont,sans-serif"></textarea>`
      } else {
        html += `<input type="${field.type}" name="${field.name}" placeholder="${escapeHtml((field.placeholder as string) || '')}" ${field.required ? 'required' : ''} style="${inputStyles(tc)}" />`
      }
      html += `</div>`
    }
    html += `<button type="submit" style="${submitBtnStyles(String(style.ctaBackgroundColor), String(style.ctaTextColor))}">${submitText}</button>`
    html += `</form>`

    wrapper.innerHTML = html
    container.appendChild(wrapper)

    // Star rating interaction
    const ratingContainers = wrapper.querySelectorAll<HTMLElement>('[data-adman-rating]')
    ratingContainers.forEach((rc) => {
      const stars = rc.querySelectorAll<HTMLElement>('[data-star]')
      const hidden = rc.querySelector('input[type="hidden"]') as HTMLInputElement
      stars.forEach((star) => {
        star.addEventListener('click', () => {
          const val = Number(star.getAttribute('data-star'))
          if (hidden) hidden.value = String(val)
          stars.forEach((s) => {
            const sv = Number(s.getAttribute('data-star'))
            s.style.opacity = sv <= val ? '1' : '0.3'
          })
        })
      })
    })

    // Form submission handler
    const form = wrapper.querySelector('[data-adman-form]') as HTMLFormElement | null
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(form))
        if (submitUrl) {
          try {
            await fetch(submitUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            })
          } catch {
            // silent fail
          }
        }
        // Show success message
        const formEl = wrapper.querySelector('[data-adman-form]')
        if (formEl) {
          formEl.innerHTML = `<div style="text-align:center;padding:24px 0"><p style="font-size:1.25em;font-weight:600;margin:0 0 8px">&#10003;</p><p style="margin:0;font-size:14px;opacity:0.85">${successMessage}</p></div>`
        }
      })
    }
  }
})()
