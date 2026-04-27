import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import type { HubConnection } from '@microsoft/signalr'
import type {
  EnrollmentPayload,
  VerificationPayload,
  DeviceStatusChangedPayload,
  BiometricStatus,
} from '../interfaces/interfaces'

type EventHandler = (...args: unknown[]) => void

interface SignalREventMap {
  EnrollmentStarted: EnrollmentPayload
  EnrollmentCompleted: EnrollmentPayload
  EnrollmentFailed: EnrollmentPayload
  VerificationStarted: VerificationPayload
  VerificationCompleted: VerificationPayload
  VerificationFailed: VerificationPayload
  DeviceStatusChanged: DeviceStatusChangedPayload
  OperationCancelled: { success: boolean; message: string }
  Error: { message: string }
}

type SignalREventName = keyof SignalREventMap

const eventHandlers: Record<SignalREventName, Set<EventHandler>> = {
  EnrollmentStarted: new Set(),
  EnrollmentCompleted: new Set(),
  EnrollmentFailed: new Set(),
  VerificationStarted: new Set(),
  VerificationCompleted: new Set(),
  VerificationFailed: new Set(),
  DeviceStatusChanged: new Set(),
  OperationCancelled: new Set(),
  Error: new Set(),
}

let connection: HubConnection | null = null

function getHubUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string
  if (!baseUrl) throw new Error('VITE_API_BASE_URL is not configured')
  return baseUrl.replace(/\/$/, '') + '/hubs/biometric'
}

export function getConnection(): HubConnection | null {
  return connection
}

export function getConnectionState(): HubConnectionState | null {
  return connection?.state ?? null
}

export async function startConnection(): Promise<void> {
  if (connection && connection.state === HubConnectionState.Connected) {
    return
  }

  if (connection && connection.state === HubConnectionState.Connecting) {
    return
  }

  const hubUrl = getHubUrl()

  connection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      withCredentials: true,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Information)
    .build()

  const eventNames = Object.keys(eventHandlers) as SignalREventName[]
  for (const eventName of eventNames) {
    connection.on(eventName, (...args: unknown[]) => {
      const handlers = eventHandlers[eventName]
      handlers.forEach((handler) => handler(...args))
    })
  }

  connection.onreconnected(() => {
    // Connection restored
  })

  connection.onreconnecting(() => {
    // Connection lost, attempting to reconnect
  })

  connection.onclose(() => {
    // Connection closed
  })

  await connection.start()
}

export async function stopConnection(): Promise<void> {
  if (connection) {
    await connection.stop()
    connection = null
  }
}

export function on(event: string, handler: EventHandler): void {
  const eventName = event as SignalREventName
  if (eventHandlers[eventName]) {
    eventHandlers[eventName].add(handler)
  }
}

export function off(event: string, handler: EventHandler): void {
  const eventName = event as SignalREventName
  if (eventHandlers[eventName]) {
    eventHandlers[eventName].delete(handler)
  }
}

export async function requestEnrollment(userId: number): Promise<void> {
  if (!connection || connection.state !== HubConnectionState.Connected) {
    throw new Error('SignalR connection not established')
  }
  await connection.invoke('RequestEnrollment', userId)
}

export async function requestVerification(userId: number, quizId?: number): Promise<void> {
  if (!connection || connection.state !== HubConnectionState.Connected) {
    throw new Error('SignalR connection not established')
  }
  await connection.invoke('RequestVerification', userId, quizId ?? null)
}

export async function cancelOperation(): Promise<void> {
  if (!connection || connection.state !== HubConnectionState.Connected) {
    throw new Error('SignalR connection not established')
  }
  await connection.invoke('CancelOperation')
}

export async function getDeviceStatusViaHub(): Promise<BiometricStatus> {
  if (!connection || connection.state !== HubConnectionState.Connected) {
    throw new Error('SignalR connection not established')
  }
  return await connection.invoke<BiometricStatus>('GetDeviceStatus')
}