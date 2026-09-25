# EDUNEXUS Design Context

## Product surface
EDUNEXUS is an operational Education Operating System. Authenticated users work inside applications, modules, records, workflows, access controls, and documents. The application surface must never read like a bulletin board or marketing dashboard.

## Navigation contract
- Persistent application rail on desktop.
- Each application opens a dedicated workspace.
- Within an application, navigation is organized around real domain modules and workflows.
- Record/data screens use list/table/detail patterns and provide print where relevant.
- Planned modules are explicitly marked as planned; no placeholder data is presented as real.

## Visual language
- Deep education-green shell for navigation and authority.
- Warm off-white workspace background.
- Compact data typography using DM Sans and Manrope.
- Low-radius controls, thin borders, dense but readable tables.
- Gold is reserved for sequence/identity accents; mint is used for active state and safe operational emphasis.

## Interaction principles
- Primary verbs are direct: Buka, Kelola, Cetak, Simpan, Ubah, Hapus.
- Empty states explain what is missing and the next valid action.
- Errors identify the failed operation and preserve recovery context.
- Authentication and RLS remain the authorization boundary.
- Do not manufacture domain completion: registry contracts are not equivalent to implemented domain schema.

## Current implementation stage
The 33-application layer provides application navigation, operational workspaces, existing-data surfaces, workflow/access contracts, and print support. Full domain CRUD is implemented incrementally per application in blueprint order.

## Public School Website
- Public school websites are a distinct marketing/content register from the authenticated EDUNEXUS operational workspace.
- The school site is tenant-branded and reads published content from Supabase; it must not expose student, guardian, staff, audit, or other private operational data.
- Visual direction: editorial education, warm paper surfaces, deep forest green authority, restrained gold accents, large Manrope display type, DM Sans body copy, real-content-first cards, and a strong photographic campus hero.
- Primary navigation uses plain public terms: Tentang, Program, Fasilitas, Berita, Agenda, Penerimaan. Authenticated access is labeled Portal EDUNEXUS.
- The public site is a presentation layer over school data; future admin editing should reuse the existing EDUNEXUS operational CRUD primitives rather than creating a second content-management system.
- Demo school content is explicitly tied to SNM-DEMO and must be replaced by tenant content before a real school domain is published.
