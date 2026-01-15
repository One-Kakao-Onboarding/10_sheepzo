"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActorData } from "@/types/actor"

interface ActorCardProps {
  actor: ActorData
  onRemove?: () => void
}

export function ActorCard({ actor, onRemove }: ActorCardProps) {
  const getWorkTitles = () => {
    if (!actor.narrative_roles || !Array.isArray(actor.narrative_roles)) return []
    return actor.narrative_roles
      .slice(0, 2)
      .map((role) => (typeof role === "string" ? role : role.work_title || role.character_name))
      .filter(Boolean)
  }

  const workTitles = getWorkTitles()
  const remainingCount = (actor.narrative_roles?.length || 0) - 2

  return (
    <Card className="relative overflow-hidden p-3 flex gap-3">
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-foreground z-10"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="flex-shrink-0">
        {actor.profile_image_url ? (
          <img
            src={actor.profile_image_url || "/placeholder.svg"}
            alt={actor.name}
            className="rounded-md object-cover w-20 h-24"
            onError={(e) => {
              e.currentTarget.style.display = "none"
              e.currentTarget.nextElementSibling?.classList.remove("hidden")
            }}
          />
        ) : null}
        <div
          className={`w-20 h-24 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs ${actor.profile_image_url ? "hidden" : ""}`}
        >
          No Image
        </div>
      </div>

      {/* Actor Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <h4 className="font-semibold text-sm truncate pr-6">{actor.name}</h4>

        <div className="flex flex-wrap gap-1">
          {actor.gender && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {actor.gender}
            </Badge>
          )}
          {actor.age_range && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {actor.age_range}
            </Badge>
          )}
        </div>

        {actor.impression && <p className="text-xs text-muted-foreground line-clamp-2">{actor.impression}</p>}

        {workTitles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {workTitles.map((title, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0">
                {title}
              </Badge>
            ))}
            {remainingCount > 0 && <span className="text-xs text-muted-foreground">+{remainingCount}</span>}
          </div>
        )}
      </div>
    </Card>
  )
}
