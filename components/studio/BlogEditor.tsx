'use client'

import { useCallback, useRef } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { toast } from 'sonner'
import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaLink,
  FaLinkSlash,
  FaImage,
  FaCode,
} from 'react-icons/fa6'

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors ${
        active ? 'bg-mainPurple text-white' : 'text-grey2 hover:bg-grey5'
      }`}
    >
      {children}
    </button>
  )
}

export function BlogEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl' } }),
      Placeholder.configure({ placeholder: 'Write your article…' }),
    ],
    content: value,
    editorProps: {
      attributes: { class: 'prose-blog min-h-[360px] px-4 py-4 focus:outline-none' },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  const setLink = useCallback(
    (ed: Editor) => {
      const prev = ed.getAttributes('link').href as string | undefined
      const url = window.prompt('Link URL', prev ?? 'https://')
      if (url === null) return
      if (url === '') {
        ed.chain().focus().extendMarkRange('link').unsetLink().run()
        return
      }
      ed.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    },
    [],
  )

  const handleFile = useCallback(
    async (file: File) => {
      if (!editor) return
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/studio/blog/upload-image', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        editor.chain().focus().setImage({ src: data.publicUrl }).run()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Image upload failed')
      }
    },
    [editor],
  )

  if (!editor) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-grey4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-mainPurple border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-grey4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-grey4 bg-grey6 px-2 py-1.5">
        <ToolbarButton
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <span className="font-satoshi text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <span className="font-satoshi text-xs font-bold">H3</span>
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-grey4" />
        <ToolbarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FaBold className="h-3 w-3" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FaItalic className="h-3 w-3" />
        </ToolbarButton>
        <ToolbarButton
          title="Inline code"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <FaCode className="h-3 w-3" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-grey4" />
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FaListUl className="h-3 w-3" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FaListOl className="h-3 w-3" />
        </ToolbarButton>
        <ToolbarButton
          title="Quote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <FaQuoteRight className="h-3 w-3" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-grey4" />
        <ToolbarButton title="Add link" active={editor.isActive('link')} onClick={() => setLink(editor)}>
          <FaLink className="h-3 w-3" />
        </ToolbarButton>
        <ToolbarButton
          title="Remove link"
          onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
        >
          <FaLinkSlash className="h-3 w-3" />
        </ToolbarButton>
        <ToolbarButton title="Insert image" onClick={() => fileInputRef.current?.click()}>
          <FaImage className="h-3 w-3" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
