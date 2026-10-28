# Project Rules

- Use TypeScript, React Native, and Expo (SDK 58). Follow the existing architecture and `@/*` alias paths in `src/`.
- Inspect only the files needed for the task. Follow related imports and dependencies when necessary.
- Do not scan the entire project, compare Git history, or run Python by default.
- Use Python, shell scripts, and other tools only when they provide a clear benefit.
- For complex tasks, identify the root cause and make a short plan before editing. For simple tasks, proceed directly.
- Prefer minimal, focused changes. Avoid unrelated refactoring, new dependencies, and unnecessary file modifications.
- Preserve existing user changes. Never discard or overwrite unrelated work.
- Respect mobile platforms: consider iOS, Android (edge-to-edge), tablet layouts, and performance.
- Store sensitive credentials (tokens, auth secrets) strictly in `expo-secure-store`, not plain `AsyncStorage`.
- Run the smallest relevant verification first (e.g. `npx tsc --noEmit`). Do not claim tests or builds passed unless they actually ran.
- Ask questions only when missing information materially affects the solution.

## Final Response

After completing the task, report briefly:

- **Changed:** What was implemented.
- **Files:** Main files modified.
- **Checks:** Tests or verification performed.
- **Remaining:** Any unresolved issues, if applicable.

Keep the final report concise. Do not include unnecessary explanations.
