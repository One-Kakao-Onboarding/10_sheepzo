// Actor dataset as TypeScript to avoid JSON parsing issues
import type { ActorData } from "@/types/actor"

// This will be loaded from the JSON file via fetch instead of import
export async function loadActorDataset(): Promise<ActorData[]> {
  // For now, return empty array - data will be fetched from external source
  return []
}

// Placeholder for static data - will be populated by the component
export const ACTOR_DATASET: ActorData[] = []
