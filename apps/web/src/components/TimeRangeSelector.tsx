"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type TimeRange = "7d" | "30d" | "all" | "custom"

interface TimeRangeSelectorProps {
  value: { start: Date | undefined; end: Date | undefined }
  onChange: (range: { start: Date | undefined; end: Date | undefined }) => void
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const [preset, setPreset] = React.useState<TimeRange>("7d")
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePresetChange = (newPreset: TimeRange) => {
    setPreset(newPreset)
    const now = new Date()
    if (newPreset === "7d") {
      onChange({ start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now })
    } else if (newPreset === "30d") {
      onChange({ start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now })
    } else if (newPreset === "all") {
      onChange({ start: undefined, end: undefined })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-md">
        <Button
          variant={preset === "7d" ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePresetChange("7d")}
        >
          近 7 天
        </Button>
        <Button
          variant={preset === "30d" ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePresetChange("30d")}
        >
          近 30 天
        </Button>
        <Button
          variant={preset === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePresetChange("all")}
        >
          全部
        </Button>
      </div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("w-[240px] justify-start text-left font-normal")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value.start ? (
              value.end ? (
                <>
                  {format(value.start, "yyyy-MM-dd")} - {format(value.end, "yyyy-MM-dd")}
                </>
              ) : (
                format(value.start, "yyyy-MM-dd")
              )
            ) : (
              "选择日期范围"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: value.start, to: value.end }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setPreset("custom")
                onChange({ start: range.from, end: range.to })
                setIsOpen(false)
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
