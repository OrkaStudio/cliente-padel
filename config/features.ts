export const features = {
  hasTorneos: true,
  hasFixtureIA: true,
  hasEnVivo: true,
  hasBracket: true,
  hasInterclub: false, // pendiente respuestas de Cristián
} as const

export type Features = typeof features
