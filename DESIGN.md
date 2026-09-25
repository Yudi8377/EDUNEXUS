# EDUNEXUS Design Context

## Product surface
EDUNEXUS is an operational Education Operating System. Authenticated users work inside applications, modules, records, workflows, access controls, and documents. The application surface must never read like a bulletin board or marketing dashboard.

## Navigation contract
- Persistent application rail on desktop.
- Applications are grouped into understandable school domains: identity & students, learning, safety & student life, school operations, and intelligence & ecosystem.
- Each application opens a dedicated workspace.
- Record/data screens use list/table/detail patterns and provide print where relevant.
- Client-facing labels use direct Indonesian verbs: Beranda, Data, Proses kerja, Dokumen, Hak akses, Kelola, Tambah, Ubah, Hapus, Simpan, Cetak.
- Internal lifecycle, foundation, process, database-table, UUID, and implementation-state terminology is not exposed to ordinary users.

## Visual direction — Living School OS
The visual identity is intentionally specific to EDUNEXUS: calm enterprise software with an education-green authority shell, warm paper workspace, mint operational signal, and restrained gold identity accents.

### Palette
- Deep Forest #10251e — navigation shell and authority.
- Education Green #1e604b — primary action and active emphasis.
- Signal Mint #55d7ae — live, active, and safe operational signal.
- Warm Paper #f6f8f6 — application workspace.
- White #ffffff — record and workflow surfaces.
- Gold #b9914c — sequence and identity accents only.
- Ink #17221f — primary readable text.
- Muted #71807b — supporting text.
- Line #e2e9e4 — structure and separation.

### Typography
- Manrope 700/800 for application identity, page titles, record names and strong hierarchy.
- DM Sans 400/500/600/700 for body copy, forms, tables and controls.
- Base text remains comfortable on desktop and mobile; operational table text must not collapse into tiny dashboard labels.

### Signature
The signature element is the Living Line: thin green structural lines and context trails that communicate that applications are connected operational workspaces rather than isolated screens. It is visual context, not a database diagram.

### Application hub
- The home is an application launch surface, not a KPI dashboard.
- Each application is represented as a calm card with sequence, identity glyph, purpose, and one obvious entry action.
- The sidebar mirrors the same application universe and groups it by school work domain.

### Application workspace
- Header answers where I am, what this application does, and what I can do next.
- Primary content is real modules and records.
- Secondary actions are workflow and documents.
- Context trails expose useful business relationships in human language.
- No UUIDs, table names, lifecycle codes, or implementation state in ordinary user-facing surfaces.

## Interaction principles
- Primary verbs are direct: Buka, Kelola, Cetak, Simpan, Ubah, Hapus.
- Empty states explain what is missing and the next valid action.
- Errors identify the failed operation and preserve recovery context.
- Authentication and RLS remain the authorization boundary.
- Destructive actions require an application-owned confirmation, not browser confirm.
- Interactive elements have visible keyboard focus and touch-friendly targets.
- Reduced-motion preferences are respected.
- Responsive layouts preserve the same task model on mobile.
- Print views remove navigation chrome and preserve useful document content.

## Data truth
- Registry contracts are not equivalent to implemented domain schemas.
- Existing domain data is shown from actual database tables.
- Demo workspace data is clearly treated as demo data and must never be presented as production domain completion.
- Database relationships and RLS remain authoritative; UI styling must never weaken them.

## Current implementation stage
The 33-application layer provides application navigation, operational workspaces, existing-data surfaces, workflow/access contracts, and print support. Full domain CRUD is implemented incrementally per application in blueprint order.
