# Workflow

## Principle

**Structural changes start with a conversation.** Fix the pattern, not the symptom.

## Rationale

File splits and architectural changes have wide blast radius and are expensive to revert. Agreeing on direction first eliminates wasted round trips. Discovering "the direction was wrong" mid-implementation is stressful for both the reviewer and the implementer.

Fix the pattern, not the symptom. The reviewer points at one instance — the visible one — but the real concern is the pattern behind it. When a single mistake is pointed out, grep the codebase for the same mistake before committing.

The same philosophy applies to dependencies. First check whether the standard library is enough; if you do add a dependency, state the reason. A dependency once added becomes maintenance surface, and removing it is harder than adding it.

## Applying

- Large changes (file split policy, architecture, new dependencies) follow propose → agree → implement.
- Apply fixes across the same pattern, not just the line pointed out — grep, then commit.
- State the reason for any new dependency. Check whether the standard library or a built-in API would do first.
