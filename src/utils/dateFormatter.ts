/**
 * Date formatting utilities
 */

/**
 * Formats a date string into a human-readable format
 * @param dateString - ISO date string or any valid date string
 * @param options - Optional Intl.DateTimeFormatOptions to customize the format
 * @returns Formatted date string (e.g., "Apr 30, 2026 at 2:29 AM")
 */
export function formatDueDate(dateString: string | null | undefined): string {
  if (!dateString) return 'No due date'

  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) return dateString

    // Format: "Apr 30, 2026 at 2:29 AM"
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }

    return date.toLocaleString('en-US', options).replace(',', ' at')
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

/**
 * Formats a date string into a short date format
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string (e.g., "Apr 30, 2026")
 */
export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) return 'No date'

  try {
    const date = new Date(dateString)

    if (isNaN(date.getTime())) return dateString

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }

    return date.toLocaleDateString('en-US', options)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

/**
 * Formats a date string into a relative time format
 * @param dateString - ISO date string or any valid date string
 * @returns Relative time string (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'No date'

  try {
    const date = new Date(dateString)

    if (isNaN(date.getTime())) return dateString

    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (Math.abs(diffDay) > 7) {
      return formatShortDate(dateString)
    }

    if (diffDay > 0) return `in ${diffDay} day${diffDay > 1 ? 's' : ''}`
    if (diffDay < 0) return `${Math.abs(diffDay)} day${Math.abs(diffDay) > 1 ? 's' : ''} ago`
    if (diffHour > 0) return `in ${diffHour} hour${diffHour > 1 ? 's' : ''}`
    if (diffHour < 0) return `${Math.abs(diffHour)} hour${Math.abs(diffHour) > 1 ? 's' : ''} ago`
    if (diffMin > 0) return `in ${diffMin} minute${diffMin > 1 ? 's' : ''}`
    if (diffMin < 0) return `${Math.abs(diffMin)} minute${Math.abs(diffMin) > 1 ? 's' : ''} ago`

    return 'just now'
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return dateString
  }
}

/**
 * Formats a date string into time only
 * @param dateString - ISO date string or any valid date string
 * @returns Time string (e.g., "2:29 AM")
 */
export function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return 'No time'

  try {
    const date = new Date(dateString)

    if (isNaN(date.getTime())) return dateString

    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }

    return date.toLocaleTimeString('en-US', options)
  } catch (error) {
    console.error('Error formatting time:', error)
    return dateString
  }
}
