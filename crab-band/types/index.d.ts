export type RunStatus = 'running' | 'done' | 'failed'

export type Run = {
  id: string
  agentId?: string
  description: string
  /** The subagent type (Explore, general-purpose, savvy-light...): picks the crab's costume. */
  type?: string
  model: string
  /** The effort its model requests ran at, once one reported it. */
  effort?: string
  status: RunStatus
  startedAt: number
  endedAt?: number
  /** The last model request's prompt plus reply: how full the agent's window is. */
  contextTokens: number
}

export type PlanStatus = 'pending' | 'in_progress' | 'completed'

export type PlanItem = { title: string; status: PlanStatus }

/** The main session: the row that always leads the band. */
export type Main = {
  /** The main loop's model, '' until known. */
  model: string
  effort?: string
  isWorking: boolean
  /** When the turn in progress (or the last one) began; 0 before the first. */
  turnStartedAt: number
  /** Tokens of its last model request, the fallback when no measurement has come. */
  contextTokens: number
  /** The engine's own measurement of the context window's fill, when it has one. */
  contextPercent?: number
  /** Its task list, as the model last set it. */
  plan: PlanItem[]
}

declare module 'claude-code' {
  interface PluginState {
    'crab-band': {
      runs: Run[]
      now: number
      main: Main
      /** Whether the agents pane is on screen (open, placed and the shown tab): the band steps aside. */
      paneShown: boolean
    }
  }
}
