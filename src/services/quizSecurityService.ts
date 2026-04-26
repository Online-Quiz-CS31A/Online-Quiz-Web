export interface SecurityViolation {
  type: 'tab_switch' | 'copy' | 'paste' | 'right_click'
  timestamp: string
  count: number
}

export interface SecurityConfig {
  maxTabSwitches: number
  autoSubmitOnMaxViolations: boolean
  blockCopyPaste: boolean
  blockRightClick: boolean
}

class QuizSecurityService {
  private violations: SecurityViolation[] = []
  private tabSwitchCount = 0
  private isActive = false
  private lastViolationTime = 0
  private violationDebounceMs = 1000 // Prevent double-counting within 1 second
  private blurStartTime = 0
  private blurThresholdMs = 500 // Only count blur if window loses focus for 500ms+
  private config: SecurityConfig = {
    maxTabSwitches: 2,
    autoSubmitOnMaxViolations: true,
    blockCopyPaste: true,
    blockRightClick: true
  }

  private onViolationCallback?: (violation: SecurityViolation) => void
  private onMaxViolationsCallback?: () => void

  configure(config: Partial<SecurityConfig>) {
    this.config = { ...this.config, ...config }
  }

  setCallbacks(
    onViolation?: (violation: SecurityViolation) => void,
    onMaxViolations?: () => void
  ) {
    this.onViolationCallback = onViolation
    this.onMaxViolationsCallback = onMaxViolations
  }

  start() {
    if (this.isActive) return
    this.isActive = true
    this.violations = []
    this.tabSwitchCount = 0
    this.lastViolationTime = 0
    this.blurStartTime = 0

    // Tab/Window switching detection
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    window.addEventListener('blur', this.handleWindowBlur)
    window.addEventListener('focus', this.handleWindowFocus)

    // Copy/Paste prevention
    if (this.config.blockCopyPaste) {
      document.addEventListener('copy', this.handleCopy)
      document.addEventListener('paste', this.handlePaste)
      document.addEventListener('cut', this.handleCut)
      document.addEventListener('keydown', this.handleKeyDown)
    }

    // Right-click prevention
    if (this.config.blockRightClick) {
      document.addEventListener('contextmenu', this.handleContextMenu)
    }
  }

  stop() {
    if (!this.isActive) return
    this.isActive = false

    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    window.removeEventListener('blur', this.handleWindowBlur)
    window.removeEventListener('focus', this.handleWindowFocus)
    document.removeEventListener('copy', this.handleCopy)
    document.removeEventListener('paste', this.handlePaste)
    document.removeEventListener('cut', this.handleCut)
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('contextmenu', this.handleContextMenu)
  }

  private handleVisibilityChange = () => {
    // Only count when tab becomes hidden, not when it becomes visible again
    if (document.hidden) {
      this.recordViolation('tab_switch')
    }
  }

  private handleWindowBlur = () => {
    // Record when blur started
    this.blurStartTime = Date.now()
  }

  private handleWindowFocus = () => {
    // Check how long the window was blurred
    if (this.blurStartTime > 0) {
      const blurDuration = Date.now() - this.blurStartTime

      // Only count as violation if blur lasted longer than threshold
      // This filters out quick clicks on notifications, screenshot tools, etc.
      if (blurDuration >= this.blurThresholdMs && !document.hidden && this.isActive) {
        this.recordViolation('tab_switch')
      }

      this.blurStartTime = 0
    }
  }

  private handleCopy = (e: Event) => {
    e.preventDefault()
    this.recordViolation('copy')
  }

  private handlePaste = (e: Event) => {
    e.preventDefault()
    this.recordViolation('paste')
  }

  private handleCut = (e: Event) => {
    e.preventDefault()
    this.recordViolation('copy')
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Block Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
      e.preventDefault()
      const type = e.key.toLowerCase() === 'v' ? 'paste' : 'copy'
      this.recordViolation(type)
    }
  }

  private handleContextMenu = (e: Event) => {
    e.preventDefault()
    this.recordViolation('right_click')
  }

  private recordViolation(type: SecurityViolation['type']) {
    // Debounce to prevent double-counting when both visibilitychange and blur fire
    const now = Date.now()
    if (type === 'tab_switch') {
      const timeSinceLastViolation = now - this.lastViolationTime

      if (timeSinceLastViolation < this.violationDebounceMs) {
        return
      }
    }

    const violation: SecurityViolation = {
      type,
      timestamp: new Date().toISOString(),
      count: 1
    }

    if (type === 'tab_switch') {
      this.tabSwitchCount++
      violation.count = this.tabSwitchCount
      this.lastViolationTime = now
    }

    this.violations.push(violation)

    // Notify callback
    if (this.onViolationCallback) {
      this.onViolationCallback(violation)
    }

    // Check if max violations reached
    if (
      type === 'tab_switch' &&
      this.config.autoSubmitOnMaxViolations &&
      this.tabSwitchCount >= this.config.maxTabSwitches
    ) {
      if (this.onMaxViolationsCallback) {
        this.onMaxViolationsCallback()
      }
    }
  }

  getViolations(): SecurityViolation[] {
    return [...this.violations]
  }

  getTabSwitchCount(): number {
    return this.tabSwitchCount
  }

  reset() {
    this.violations = []
    this.tabSwitchCount = 0
    this.lastViolationTime = 0
  }
}

export const quizSecurityService = new QuizSecurityService()
