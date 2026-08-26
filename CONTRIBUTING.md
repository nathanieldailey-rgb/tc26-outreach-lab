# Contributing to TC26 Outreach Lab

Thank you for helping test this co-chair-led prototype. The fastest way to contribute is to choose the lane that matches your idea:

- [Article pitch](https://github.com/nathanieldailey-rgb/tc26-outreach-lab/issues/new?template=article_pitch.yml) for a new public-facing story.
- [Feature request](https://github.com/nathanieldailey-rgb/tc26-outreach-lab/issues/new?template=feature_request.yml) for an interface, accessibility, editorial-workflow, or Ask improvement.
- A pull request for a scoped change that is ready for review.

Participation in this repository does not make a proposal an official committee position. Maintainers may request subject-matter, editorial, accessibility, rights, or technical review before accepting it.

## Article pitches

An article pitch should identify:

1. the intended audience;
2. the central question a reader should be able to answer;
3. the proposed author and any co-contributors;
4. the relevant DOI links and the exact source version used;
5. the license or written permission supporting every non-original element;
6. what is factual evidence, what is the author's interpretation, and what still needs committee review; and
7. whether and how AI assistance was used.

Do not paste publisher abstracts, full papers, subscription text, copied figures, or scraped content into an issue. Bibliographic metadata, DOI links, and your own short source descriptions are welcome.

## Feature requests

Describe the reader problem before proposing a solution. Include the affected audience, expected outcome, accessibility considerations, and any privacy, AI, hosting, or recurring-cost implications. Small, testable changes are easier to evaluate and collaborate on.

## Pull requests

1. Create a focused branch.
2. Install dependencies with `npm ci`.
3. Add or update tests before implementation when behavior changes.
4. Run `npm test -- --run`, `npm run test:coverage`, and `npm run build`.
5. Complete every relevant section of the pull-request template.

Do not commit `.env.local`, keys, tokens, private hostnames, personal filesystem paths, journal files, publisher-owned copy, or unapproved logos and marks.

## Evidence, rights, and AI disclosure

For each editorial addition, list the DOI, source version, and license or permission status. Mark project-original language clearly. If AI assistance influenced research, drafting, code, images, audio, or translation, name the tool category, describe the human review performed, and confirm that no restricted or subscription content was supplied to it.

By submitting editorial or media content, you confirm that you control the necessary rights and accept the **contribution grant** in [CONTENT_POLICY.md](CONTENT_POLICY.md). Code contributions are submitted under the repository's MIT License. These are separate grants.

## Review standard

Reviewers look for plain-language usefulness, traceable claims, precise source boundaries, accessibility, privacy, security, maintainability, and a clear route to the full publication. A merged contribution may still be labeled a prototype until the committee makes an adoption decision.
