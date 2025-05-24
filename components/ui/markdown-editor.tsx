'use client'

import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps {
  value: string
  onChange: (value?: string) => void
  className?: string
}

export function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  return (
    <div className={`${className} w-full`} data-color-mode="light">
      <MDEditor
        value={value}
        onChange={onChange}
        preview="edit"
        height={400}
        hideToolbar={false}
        enableScroll={true}
      />
    </div>
  )
}