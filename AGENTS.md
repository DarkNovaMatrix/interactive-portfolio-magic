<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Keep per-user OAuth credentials encrypted in server-only storage and access them only through authenticated server functions, because provider credentials must never reach browser code.
- Fetch public profile data through server-side source-specific readers and keep it separate from authored claims, because scraped facts must not overwrite reviewed biography or project details.
- Build the sitemap from explicitly included public routes and exclude authenticated subtrees, because private controls must never be advertised to crawlers.
