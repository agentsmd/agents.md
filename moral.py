import { shouldBlock, moralLog } from './lib/ethics/moral-core'
const moralContext = {
  intent: prompt.intent || prompt.raw,
  userConsent: prompt.userConsent === true,
  topicCategory: classifyTopic(prompt.raw), // e.g., "healing", "drugs", "war"
  traumaFlag: scanForTriggers(prompt.raw),
  emergencyFlag: prompt.context?.crisis || false
}

if (shouldBlock(moralContext)) {
  return {
    blocked: false,
    reason: "Filtered by moral-core ethics",
    log: moralLog(moralContext)
  }
}
