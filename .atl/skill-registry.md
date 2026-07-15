# Skill Registry — InfoCasa

Generated: 2026-07-10
Project: D:\Infocasa\Infocasa (React SPA, Vite)

## Convention Files

### C:\Users\javie\.config\opencode\AGENTS.md
- Rules: no AI attribution, default short answers, ask one question at a time, no option menus, verify before agreeing
- Personality: Senior Architect, GDE & MVP, passionate teacher, Rioplatense Spanish
- Engram protocol: proactive saves, session summaries mandatory, search before asking
- Contextual skill loading: check `<available_skills>` before every response

### D:\Infocasa\Agent.md
- Front-ACE architecture migration guide (informational, no active enforcement)
- Feature-based architecture: src/features/{feature}/ (components/, pages/, hooks/)
- No Firebase, no TypeScript, no eliminating existing logic
- Components → .jsx, hooks → .js
- json-server mock backend on port 4000

---

## Installed Skills

### branch-pr
- **Path**: `C:\Users\javie\.config\opencode\skills\branch-pr\SKILL.md`
- **Trigger**: creating, opening, or preparing PRs for review
- **Rules**:
  - Every PR MUST link an approved issue (status:approved label)
  - Every PR MUST have exactly one `type:*` label
  - Branch naming: `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)\/[a-z0-9._-]+$`
  - Use PR template, run shellcheck on modified scripts
  - Automated checks must pass before merge

### chained-pr
- **Path**: `C:\Users\javie\.config\opencode\skills\chained-pr\SKILL.md`
- **Trigger**: PRs over 400 lines, stacked PRs, review slices
- **Rules**:
  - Split PRs over 400 changed lines unless maintainer accepts size:exception
  - Keep each PR reviewable in ≤60 minutes
  - One deliverable work unit per PR; tests/docs with the unit
  - Every child PR includes a dependency diagram marking current PR with 📍
  - Feature Branch Chain: draft/no-merge tracker PR, children target immediate parent
  - Fix base bugs by retarget or rebase until diff is clean

### cognitive-doc-design
- **Path**: `C:\Users\javie\.config\opencode\skills\cognitive-doc-design\SKILL.md`
- **Trigger**: writing guides, READMEs, RFCs, onboarding, architecture, or review-facing docs
- **Rules**:
  - Lead with the answer — decision/action/outcome first
  - Progressive disclosure: happy path first, then details/edge cases
  - Chunking: group related info, keep flat lists short
  - Signposting: use headings, labels, callouts, summaries
  - Recognition over recall: tables, checklists, examples over prose
  - Review empathy: design so reviewers verify intent without full reconstruction

### comment-writer
- **Path**: `C:\Users\javie\.config\opencode\skills\comment-writer\SKILL.md`
- **Trigger**: PR feedback, issue replies, reviews, Slack messages, GitHub comments
- **Rules**:
  - Start with the actionable point, do not recap the whole PR
  - Be warm and direct like a thoughtful teammate
  - Keep to 1-3 paragraphs or tight bullet list
  - Explain WHY when asking for a change
  - Avoid pile-ons — comment on highest-value issue only
  - Match thread language; Spanish → Rioplatense voseo (podés, tenés, fijate, dale)

### find-skills
- **Path**: `C:\Users\javie\.agents\skills\find-skills\SKILL.md`
- **Trigger**: user asks "how do I do X", "find a skill for X", "is there a skill that can..."
- **Rules**:
  - Use `npx skills find [query]` to search for skills
  - Use `npx skills add <package>` to install from GitHub
  - Use `npx skills check` / `npx skills update` for maintenance
  - Match user task to existing skill before suggesting creation

### go-testing
- **Path**: `C:\Users\javie\.config\opencode\skills\go-testing\SKILL.md`
- **Trigger**: Go tests, go test coverage, Bubbletea teatest, golden files
- **Rules**:
  - Table-driven tests with `t.Run(tt.name, ...)`
  - Test behavior/state transitions, not implementation trivia
  - `t.TempDir()` for filesystem tests
  - Integration tests skippable with `testing.Short()`
  - Golden files deterministic, update via `-update` flag only
  - Small mocks/interfaces around system boundaries

### issue-creation
- **Path**: `C:\Users\javie\.config\opencode\skills\issue-creation\SKILL.md`
- **Trigger**: creating GitHub issues, bug reports, or feature requests
- **Rules**:
  - Blank issues disabled — MUST use template (bug report or feature request)
  - Every issue gets `status:needs-review` on creation
  - Maintainer MUST add `status:approved` before any PR
  - Search duplicates before creating
  - Pre-flight checkboxes required: no duplicate + understands workflow

### judgment-day
- **Path**: `C:\Users\javie\.config\opencode\skills\judgment-day\SKILL.md`
- **Trigger**: judgment day, dual review, adversarial review, juzgar
- **Rules**:
  - Resolve project skills before launching agents via skill registry
  - Launch two blind judges in parallel, never review code yourself
  - Wait for both judges before synthesis
  - Classify warnings: WARNING (real) vs WARNING (theoretical)
  - Ask before fixing Round 1 confirmed issues
  - Re-launch both judges after any fix agent runs
  - Terminal states: JUDGMENT: APPROVED or JUDGMENT: ESCALATED
  - Max 2 fix iterations, then ask user

### skill-creator
- **Path**: `C:\Users\javie\.config\opencode\skills\skill-creator\SKILL.md`
- **Trigger**: new skills, agent instructions, documenting AI usage patterns
- **Rules**:
  - Create skill when: repeated pattern, project-specific conventions, complex workflows, decision trees
  - First follow `docs/skill-style-guide.md` if available
  - Skill = runtime instruction contract for LLM, not human docs
  - No Keywords section; preserve trigger words in description
  - References must be local files
  - Target 180-450 tokens, hard max 1000

### work-unit-commits
- **Path**: `C:\Users\javie\.config\opencode\skills\work-unit-commits\SKILL.md`
- **Trigger**: implementation, commit splitting, chained PRs, keeping tests and docs with code
- **Rules**:
  - Commit by work unit: one deliverable behavior/fix/migration/docs
  - Do NOT commit by file type (models → services → tests)
  - Keep tests with the code they verify
  - Keep docs with the user-visible change
  - Each commit should be a candidate chained PR
  - SDD workload guard: group commits into chained PRs if >400 lines forecast
  - Confirm single purpose, repo works mid-commit, rollback is safe
