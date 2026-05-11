# AGENTS.md

## Working agreements

- Use pnpm as the package manager for this project. Do not use npm or yarn.
- Always write unit tests for new features and components.
- When fixing a bug, write a test that reproduces the bug before fixing it. This ensures that the bug is properly fixed and prevents regressions in the future.
- When implementing a new feature, write tests that cover the expected behavior of the feature.

## PR instructions

- Actions can be: feat (for new features), fix (for bug fixes).
- Branch naming format: <action>/<jira issue number>-<short description>
- Title format: <action>(<jira issue number>): <short description>
- Use PR template provided in the repository (.github/PULL_REQUEST_TEMPLATE.md). Keep the description concise and to the point, but provide enough information for reviewers to understand the changes made.
- Always run `pnpm lint` and `pnpm test` and `pnpm build` before committing.
- Ask UNIwise/frontend team for review
- If the PR is related to a Jira issue, link the PR to the issue and move the issue to the review column in the Jira board.
