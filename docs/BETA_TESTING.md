# Beta testing kit (needs 2+ external developers)

The competition requires at least 2 developers outside the core team to test the toolkit. Only real testers
and their real feedback may be reported. Do not fabricate results.

## Who counts as external
Developers who are not on the Telnora team: freelancers, developers at other companies, students, community
members. Ideally Nigerian developers, since that is the target audience.

## Invitation message (WhatsApp / email)
> Hi [name], I'm entering the National AI Innovation Challenge with a developer toolkit for N-ATLAS
> (Nigeria's open LLM). It's an SDK + React chat/voice components. Could you give it 20-30 minutes and tell me
> honestly where you got stuck? Start here: https://telnora-natlas-kit.vercel.app/docs and the repo
> https://github.com/cutewizzy11/telnora-natlas-kit. I'll send you a 6-question form afterwards.
> If you can, I'll credit you (with permission) in the submission.

## Tester task (about 30 minutes)
1. Open the docs quickstart. Note the time you start.
2. Install/copy the SDK (TypeScript or Python) and make a first chat call against the endpoint we give you
   (or your own). Note the time of your first successful response.
3. Try streaming.
4. Optional: add `<NatlasChat />` to a small React app.
5. Fill in the feedback form.

We must provide each tester a working N-ATLAS endpoint URL (host the model first, see `deploy/README.md`) or they
can host their own.

## Feedback form (copy into Google Forms)
1. Name and role (and permission to name you in the submission: yes/no)
2. Language(s) used: TypeScript / Python / React
3. Minutes from opening the docs to first successful response
4. Where did you get stuck or confused? (free text)
5. Rate the docs 1-5 and the SDK API 1-5
6. Would you use this in a real project? Why or why not?

## Evidence to collect (for the submission)
- Screenshot of each tester's completed form (or exported responses)
- The tester's first-response timing
- Any GitHub issues or PRs they open
- Changes you made because of their feedback (link commits)

## Draft outcome text for the form (edit with REAL numbers; 200 words max)
> [N] external developers ([roles]) beta-tested the kit. Median time from opening the docs to a first
> successful N-ATLAS response was [X] minutes. Feedback: [top 2-3 issues]. We fixed [what] in commits [links].
> Evidence submitted: form responses, timing screenshots and repository issues.
