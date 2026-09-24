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
