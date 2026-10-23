import {useState} from 'react'
import {useClient, type DocumentActionComponent} from 'sanity'
import {legacyContent, type ContentRecord} from '../lib/lessonContent'

export const SyncLessonContent: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: '2026-01-01'})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const draft = props.draft
  return {
    label: error ? 'Retry sync legacy content' : 'Sync legacy content',
    title: error ?? 'Create compatible content for older app versions. This saves the draft only.',
    disabled: busy || !draft,
    onHandle: async () => {
      if (!draft) return
      setBusy(true)
      setError(null)
      try {
        const pages = (draft.pages as ContentRecord[] | undefined)?.map((page) =>
          page.contentVersion === 2 && Array.isArray(page.sections)
            ? {...page, content: legacyContent(page.sections)}
            : page,
        )
        if (pages) await client.patch(draft._id).ifRevisionId(draft._rev).set({pages}).commit()
        props.onComplete()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Sync failed')
      } finally {
        setBusy(false)
      }
    },
  }
}
