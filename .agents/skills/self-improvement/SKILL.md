---
name: self-improvement
description: Formal Self-Improvement Loop to learn from corrections and prevent recurring mistakes
---

# Self-Improvement Loop (SIL)

## Overview

Continuous improvement by capturing corrections and formalizing them into rules.

## The Loop

After ANY correction from the user or discovering a pattern that should be avoided:

1. **Capture**: Record the mistake in `tasks/lessons.md`.
2. **Formalize**: Write a concrete rule that prevents the same mistake.
3. **Persist**: Add the rule to the `LEARNED` section of `.agents/rules.md` (and relevant skill files if applicable).
4. **Review**: Scan lessons at the start of every session.

## Lessons Format

Use the following template in `tasks/lessons.md`:

```markdown
## [Date] - [Category]

**Mistake**: What went wrong
**Pattern**: The underlying cause or anti-pattern
**Rule**: Concrete rule to prevent recurrence
**Applied**: Where this rule applies (specific files, patterns, situations)
```

## Categories

- **Architecture**: System design decisions
- **Testing**: Test coverage, edge cases
- **Performance**: Speed, memory, efficiency
- **Security**: Vulnerabilities, auth issues
- **API**: Interface design, contracts
- **Tooling**: Build, deploy, CI/CD
- **Communication**: Misunderstandings, unclear specs
- **UX/UI**: Consistency, accessibility, aesthetics

## Best Practices

- **Write immediately**: Capture lessons right after the correction.
- **Be specific**: Vague lessons don't prevent mistakes.
- **Include context**: Explain why it matters.
- **Make rules actionable**: "Be more careful" is not a rule.
- **Review regularly**: Scan lessons at session start via `/session-start`.
