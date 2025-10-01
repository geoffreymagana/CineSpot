
export const changelogData = {
  version: '1.3.0',
  date: '2025-10-08',
  title: "Better Sharing & Bug Fixes",
  changes: [
    {
      category: 'New',
      items: [
        '<strong>Individual Title Selection</strong>: You can now select individual titles from a shared collection to add to your library.',
        '<strong>Import Full Collection</strong>: Added a one-click button to import an entire shared collection as a new, independent copy in your own library.',
      ],
    },
    {
      category: 'Improved',
      items: [
        '<strong>Public Collection Viewing</strong>: Unauthenticated users can now view shared collections and title details without being forced to log in.',
        '<strong>Sharer Attribution</strong>: The name of the person who shared a collection is now clearly displayed on the public page.',
        '<strong>Contextual UI</strong>: "Import" and "Add" buttons on public collection pages are now only visible to logged-in users.',
        '<strong>Graceful Deletion</strong>: Deleting a title or collection now redirects you appropriately instead of leaving you on an empty page.',
      ],
    },
    {
      category: 'Fixed',
      items: [
        '<strong>Collection Import</strong>: Fixed a critical bug where importing a collection would create an empty copy without any titles.',
        '<strong>Duplicate Headers</strong>: Resolved an issue where logged-in users would see two headers on public collection pages.',
        '<strong>Public Page Stability</strong>: Fixed multiple `ReferenceError` crashes and rendering bugs on public collection and title pages.',
        '<strong>Sharing Security</strong>: Rearchitected the collection sharing mechanism to be more secure and reliable, resolving "Collection Not Found" errors.',
        '<strong>Development Environment</strong>: Corrected a CORS issue that was preventing the PWA manifest from loading in some development setups.',
      ],
    },
  ],
};
