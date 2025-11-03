// Internationalization utilities

export function formatCurrency(amount: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string, locale = "en-US", options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

export function formatNumber(value: number, locale = "en-US", options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

export function formatRelativeTime(date: Date | string, locale = "en-US"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, "second")
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), "minute")
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), "hour")
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), "day")
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), "month")
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), "year")
  }
}

export function pluralize(count: number, singular: string, plural?: string, locale = "en-US"): string {
  const pluralForm = plural || `${singular}s`
  const pr = new Intl.PluralRules(locale)
  const rule = pr.select(count)

  return `${count} ${rule === "one" ? singular : pluralForm}`
}
