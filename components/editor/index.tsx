"use client"

import MDEditor from "@uiw/react-md-editor"
import { useState } from "react"

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export function Editor({ value, onChange }: EditorProps) {
  const [preview, setPreview] = useState<"edit" | "preview">("edit")

  return (
    <div className="w-full" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview={preview}
        height={400}
      />
    </div>
  )
} 