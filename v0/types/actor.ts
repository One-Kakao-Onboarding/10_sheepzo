export interface EmotionalSpectrum {
  cold_warm: number
  cold_warm_description: string
  active_passive: number
  active_passive_description: string
  intensity: number
  intensity_description: string
  extrovert_introvert: number
  extrovert_introvert_description: string
  comic_level: number
  comic_level_description: string
}

export interface NarrativeRole {
  work_title: string
  character_name: string
  role_type: string
  character_description: string
  emotional_experiences: string[]
}

export interface ActorData {
  name: string
  age_range: string
  gender: string
  height_build: string
  voice: string
  impression: string
  profile_image_url?: string
  personality_spectrum: string
  emotional_spectrum: EmotionalSpectrum
  narrative_roles: NarrativeRole[]
  recurring_pattern: string
  link?: string
  agency?: string
  status?: string
}
