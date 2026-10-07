# Architecture Decision Records

An Architecture Decision Record (ADR) captures one significant decision: the forces that shaped it, what we decided, and what it costs us. Code shows _what_ the system does; ADRs keep the _why_ after the conversation that produced it is gone.

This log follows Michael Nygard's format ([Documenting Architecture Decisions, 2011](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)): Title, Status, Context, Decision, Consequences.

## When to write one

Write an ADR when a decision is:

- **costly to reverse**, such as a module boundary, a storage format, or a dependency the app is built around, or
- **likely to be "fixed" by a newcomer** who doesn't know why it is the way it is.

Smaller choices belong in a pull request description or a code comment. Changes to product or business rules belong in the design doc's revision history; an ADR records the structural decision that follows from them.

## How to add one

1. Copy [`000-template.md`](000-template.md) to `NNN-kebab-case-title.md` using the next unused number.
2. Open a pull request with status **Proposed**. Set it to **Accepted** (with the date) when the PR merges.
3. Add a row to the index below in the same PR.

## Rules

- **Numbers are never reused.** A rejected ADR keeps its number and its file.
- **Accepted ADRs are not rewritten.** Typos and broken links can be fixed. To change a decision, write a new ADR, mark the old one `Superseded by ADR-NNN`, and update both rows here.
- **Backfilled ADRs are dated honestly.** If a decision was made before it was recorded, the Status gives both dates and says where it was originally made.

## Index

| ADR                                               | Title                                        | Status   | Date                                      |
| ------------------------------------------------- | -------------------------------------------- | -------- | ----------------------------------------- |
| [001](001-allocation-rule-behind-one-function.md) | The allocation rule sits behind one function | Accepted | 2026-10-06, originally decided 2026-09-26 |
