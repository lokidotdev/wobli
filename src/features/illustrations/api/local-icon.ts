// Kept apart from local-catalog so checking a URL doesn't pull the whole bundled catalogue into the entry chunk.

/** The `icon` URL prefix of a drawing that lives in this bundle rather than behind the API. */
export const LOCAL_ICON = 'wobli-local:'
export const isLocalIcon = (url: string) => url.startsWith(LOCAL_ICON)
