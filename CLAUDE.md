# CLAUDE.md

> **THIS FILE IS FOR INSTRUCTIONS ONLY.**
>
> This file contains rules, workflows, and constraints that govern AI behavior.
> It does NOT contain project-specific details, status, or configuration values.
>
> For all project details, refer to **`docs/AI-CONTEXT.md`** which is the single source of truth for:
> - Current project status and state
> - Environment variables and their values
> - Database schema and connection details
> - API keys and service configurations
> - What's working, what's broken, what's pending
> - HANDOFF information for session continuity
>
> **IMPORTANT:** Keep `docs/AI-CONTEXT.md` updated after EVERY meaningful change.

---

## 📄 PROJECT KICKOFF PROTOCOL (START HERE)

Every new project begins with this sequence. Do not skip steps.

---

### Step 1: Plan Intake

User will share a project plan as a **docx/pdf file**.

Actions:
1. Read and understand the entire plan
2. Save/copy the plan to `docs/PROJECT-PLAN.md` (convert to markdown)
3. Acknowledge receipt and summarize key points

---

### Step 2: Plan Verification (Critical Review)

**Search the internet** to verify the plan's technical feasibility:

- Check if proposed tech stack is appropriate
- Verify APIs/services mentioned actually exist and work as described
- Look for known issues or gotchas with the approach
- Validate architectural decisions against best practices

**Rules:**
- ✅ **DO** point out errors, contradictions, or technical impossibilities
- ✅ **DO** flag deprecated APIs or discontinued services
- ✅ **DO** warn about security vulnerabilities in the approach
- ❌ **DO NOT** suggest improvements or alternatives if no errors found
- ❌ **DO NOT** propose "better" ways to do things—the plan is finalized

The plan has been brainstormed multiple times. Your job is error-checking, not redesigning.

---

### Step 3: Logistics Setup

After plan verification, establish all required infrastructure:

1. **GitHub Repository**
   - Create/link repo
   - Set up branch strategy
   - Configure .gitignore

2. **External Services** (as identified in plan)
   - Supabase / Database
   - Authentication provider
   - Hosting (Vercel)
   - Payment processing
   - Email/SMS services
   - Any APIs mentioned in plan

3. **For each service:**
   - Set up account/project
   - Get API keys
   - Add to `.env.local`
   - Create connectivity test page
   - Verify connection works
   - Update Tool Logistics table

4. **Update `docs/AI-CONTEXT.md`** with all credentials and configs

---

### Step 4: SCRUM Document Creation

**Only after ALL logistics are verified working**, create `docs/SCRUM.md`:

- Break the plan into sprints
- Define user stories from plan requirements
- Set sprint goals
- Create initial backlog
- Mark Sprint 1 items

The SCRUM doc drives all subsequent development work.

---

### Kickoff Checklist

```
- [ ] Plan file received and saved to docs/PROJECT-PLAN.md
- [ ] Plan verified (no errors found OR errors flagged and resolved)
- [ ] GitHub repo set up
- [ ] All external services configured
- [ ] All test pages passing (green)
- [ ] AI-CONTEXT.md fully populated
- [ ] SCRUM.md created with Sprint 1 ready
- [ ] Ready to begin Sprint 1
```

---

## 🔧 PROJECT TOOL LOGISTICS (keep this updated)

This section tracks tools, MCP servers, skills, and integrations specific to THIS project. **Update immediately when adding or removing any tool.**

### MCP Servers (Global + Project)
| Server | Purpose | Key Tools |
|--------|---------|-----------|
| `puppeteer` | Browser automation & testing | `puppeteer_navigate`, `puppeteer_screenshot`, `puppeteer_click`, `puppeteer_fill`, `puppeteer_evaluate` |
| `context7` | Library documentation lookup | `resolve-library-id`, `query-docs` |
| `Neon` | Serverless Postgres database | `list_projects`, `run_sql`, `create_branch`, `get_connection_string` |

### Available Skills
| Skill | Trigger | Purpose |
|-------|---------|---------|
| `frontend-design` | Building web UIs | Production-grade frontend interfaces |
| `vercel:deploy` | "deploy", "go live" | Deploy to Vercel |
| `vercel:logs` | "show logs", "check logs" | View deployment logs |
| `vercel:setup` | "set up Vercel", "link to Vercel" | Configure Vercel CLI |
| `code-review` | PR review requests | Review pull requests |
| `find-skills` | "find a skill for X" | Discover installable skills |
| `skill-creator` | "create a skill" | Guide for creating new skills |
| `nextjs-supabase-auth` | Auth setup | Supabase Auth + Next.js integration |
| `supabase-cli` | Supabase CLI usage | Database migrations, type generation |
| `supabase-postgres-best-practices` | Postgres optimization | Query and schema optimization |
| `vercel-react-best-practices` | React/Next.js perf | Performance optimization patterns |
| `web-design-guidelines` | UI review | Check accessibility/UX compliance |

### Project-Specific Integrations
| Integration | Status | Test Page | Notes |
|-------------|--------|-----------|-------|
| GitHub Repo | ✅ Connected | - | MythyaVerse/clawid |
| npm Registry | ✅ Connected | `/test/npm` | Auth as: binarycache-mv |
| Vercel Hosting | ✅ Live | `/test/env` | https://clawid.dev |
| GitHub API | ⬜ Optional | `/test/github` | For publisher gist verification |
| npm Org | ✅ Created | - | @clawid |
| Neon DB | ✅ Connected | `/test/neon` | wild-fire-23032082 (clawid) |

### Tool Update Rules
- **New MCP server**: Add to MCP Servers table with purpose and key tools
- **New skill installed**: Add to Available Skills table with trigger phrases
- **New project integration**: Add to Project-Specific Integrations with status and test page
- **Integration verified**: Update status to ✅ and add notes
- **Tool removed**: Delete entry and note in `docs/AI-CONTEXT.md` under Recent Changes

---

## 🚀 PROJECT INITIALIZATION AND CONNECTIVITY (MANDATORY)

Before writing any feature code, establish and verify all external dependencies.

---

### 1) Logistics Inventory (Do This First)

At project start, identify and document ALL required services:

| Category | Examples |
|----------|----------|
| **Version Control** | GitHub repo, branch strategy, CI/CD |
| **Database** | Supabase, PostgreSQL, Redis, etc. |
| **Authentication** | Supabase Auth, NextAuth, Clerk, Auth0 |
| **Hosting/Deployment** | Vercel, Railway, Fly.io |
| **External APIs** | Stripe, OpenAI, SendGrid, Twilio |
| **Storage** | Supabase Storage, S3, Cloudinary |
| **Monitoring** | Sentry, LogRocket, analytics |

Record all services in `docs/AI-CONTEXT.md` under Environment & Configuration.

---

### 2) Connectivity Test Pages (Non-Negotiable)

For EVERY external dependency, create a test page before using it in features.

**Location**: `app/test/` or `pages/test/` directory

**Required test pages**:
```
app/test/
├── page.tsx              # Index listing all test pages
├── supabase/page.tsx     # DB connection + basic CRUD
├── auth/page.tsx         # Login/logout flow
├── storage/page.tsx      # File upload/download
├── [api-name]/page.tsx   # Each external API
└── env/page.tsx          # Environment variables check
```

**Each test page must**:
- Display connection status (connected/error)
- Show relevant config (non-secret)
- Perform a simple read/write operation
- Display clear error messages if failing
- Be visually obvious (green = working, red = broken)

---

### 3) Dependency Addition Protocol

When adding ANY new external service or API:

1. **Stop feature work**
2. **Add credentials** to `.env.local` and document in `docs/AI-CONTEXT.md`
3. **Create test page** in `app/test/[service-name]/page.tsx`
4. **Verify connectivity** by visiting the test page
5. **Confirm working** before proceeding with feature code
6. **Update logistics inventory** in AI-CONTEXT.md

A dependency without a passing test page is not ready for use.

---

### 4) Environment Variables Checklist

Before any deployment:

```bash
# Run this check (or create a test page that does it)
- [ ] All required env vars are set in Vercel/hosting
- [ ] No secrets committed to repo
- [ ] .env.example is up to date
- [ ] Test pages pass on deployed environment
```

---

### 5) Quick Connectivity Test Template

Use this pattern for test pages:

```tsx
// app/test/[service]/page.tsx
export default async function TestPage() {
  let status = { connected: false, error: null, data: null };

  try {
    // Attempt connection/operation
    const result = await someService.ping();
    status = { connected: true, error: null, data: result };
  } catch (e) {
    status = { connected: false, error: e.message, data: null };
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>[Service] Connectivity Test</h1>
      <div style={{
        padding: 20,
        background: status.connected ? '#d4edda' : '#f8d7da',
        borderRadius: 8
      }}>
        <strong>Status:</strong> {status.connected ? '✅ Connected' : '❌ Failed'}
        {status.error && <p>Error: {status.error}</p>}
        {status.data && <pre>{JSON.stringify(status.data, null, 2)}</pre>}
      </div>
    </div>
  );
}
```

---

## 📋 AI EXECUTION AND WORKFLOW ORCHESTRATION (MANDATORY)

These rules govern how work is planned, executed, verified, and finalized.

---

### 1) Plan Mode Is the Default

Any task involving:

* More than 3 steps
* Architectural decisions
* Refactors
* Cross-file changes

must begin with a written plan that includes verification.

If execution diverges, STOP and re-plan immediately.

---

### 2) Task Decomposition and Subagent Discipline

* Use subagents liberally
* Offload research, exploration, and parallel analysis
* One task per subagent
* Main thread focuses on synthesis and decisions

---

### 3) Self-Improvement and Error Elimination Loop

After ANY correction:

* Update `tasks/lessons.md`
* Record root cause
* Write a preventative rule
* Apply it going forward

Mistakes are allowed once. Repeats are not.

---

### 4) Verification Before Completion

Never mark work complete without proof.

Required:

* Tests run
* Logs checked
* Outputs validated
* Behavior compared before and after changes

Ask:
"Would a staff engineer approve this without hesitation?"

If unsure, it is not done.

---

### 5) Elegance Check (Balanced)

For non-trivial changes:

* Ask if a more elegant solution exists
* Replace hacky fixes with proper ones
* Do not over-engineer simple changes

---

### 6) Bug Handling and Fixing Protocol (CRITICAL)

When **you report a bug**, the workflow is mandatory and ordered:

1. **Do NOT start by fixing the bug**
2. First, write a failing test that reliably reproduces the bug
3. Confirm the test fails for the correct reason
4. Use subagents to attempt fixes independently
5. Apply the best fix
6. Prove correctness with a passing test
7. Ensure no regressions are introduced

A bug without a reproducing test is not fully understood.

---

### 7) Execution Tracking Lifecycle

For non-trivial work:

1. Write plan to `tasks/todo.md`
2. Verify plan before implementation
3. Track progress with checkable items
4. Summarize changes at each step
5. Add review section to `tasks/todo.md`
6. Update `tasks/lessons.md` after corrections

---

### 8) Core Engineering Principles

* Simplicity first
* No hacky fixes
* Minimal impact only

Touch only what is necessary.

---

## 📁 Documentation Contract

This repository has exactly six documentation files:

| File                 | Purpose                           |
| -------------------- | --------------------------------- |
| CLAUDE.md            | AI rules and constraints          |
| docs/AI-CONTEXT.md   | Single source of truth for status |
| docs/ARCHITECTURE.md | Technical design                  |
| docs/AUDIT-REPORT.md | Verification                      |
| docs/SCRUM.md        | Sprint tracking                   |
| docs/TESTING.md      | Testing strategy                  |

Do not create additional documentation files.

Note: Project plans are kept locally and NOT committed to git.

---

## AI-CONTEXT.md IS AUTHORITATIVE

Before starting any task:

* Read `docs/AI-CONTEXT.md`
* Treat it as ground truth
* Update it after every meaningful change

A HANDOFF section is mandatory.

---

## Feature Completion Definition (CRITICAL)

A feature is complete only when:

1. Code builds locally
2. Changes are committed and pushed
3. Deployed to production
4. Tested on live deployment
5. All tests pass in production

---

## Production Testing Workflow

After every deployment:

1. Deploy
2. Wait
3. Run browser tests
4. Fix issues
5. Repeat until clean

---

## Bash Command Rules

* Do not pipe output through head, tail, less, or more
* Avoid buffering issues
* Prefer command flags
* Read files directly

---

## Final Principle

**Accuracy beats speed.
Verification beats confidence.
Silence beats fake certainty.**

If something is unknown, stop and say so.


