# Contributing

We warmly welcome contributions in the form of bug reports, feature requests, and PRs.

## Bug Reports and Feature Requests

Please use [GitHub issues](https://github.com/kullna/editor/issues/new) to report bugs and request
features. Please check to see if there is already an issue for the bug or feature you are
reporting/requesting. If there is, please add a comment to the existing issue rather than creating a
new one.

Someone from the team will review your issue and respond to it. If you have any questions, please
ask them in the issue comments.

## Pull Requests

We actively welcome your pull requests; we will work with you to get changes in.

Before you begin, **please [open an issue](https://github.com/kullna/editor/issues/new)** describing
the problem that you are solving, or the feature that you are adding. This will help us to
understand your proposed change and to provide feedback on it before you invest a lot of time in it.
It will also help us to avoid duplication of effort. Also, please join our
[Discord](http://discord.kullna.org) to discuss your ideas with us.

Here's the overall process for contributing:

1. Create an Issue on GitHub
2. Maybe disucss your idea with us on [Discord](http://discord.kullna.org)
3. All Feature Requests will be tagged with either `green-light` or `red-light` to indicate whether
   we are likely to accept related PRs. Any PRs submitted for `red-light` issues will be closed.
   Issues must have a `green-light` tag before a PR will be accepted.
4. Some issues and feature requests are taged with `help wanted` or `good first issue` - these are
   issues that we would like to see PRs for, and we will work with you to get your PR accepted. If
   you are new to the project, the `good first issue` tag indicates good issues to start with. If
   you are interested in working on one of the `help wanted` issues, please comment on the issue to
   let us know you are working on it and we will assign it to you. Issues will be automatically
   unassigned if there is no activity on them for 15 days.

If you are new to open source, or new to contributing to open source, we will be happy to help you
get started. Please join our [Discord](http://discord.kullna.org) and let us know you are new to
open source.

## Getting Started

### 1. Fork the repo on GitHub

### 2. Clone the fork on your local machine

```bash
git clone git://github.com/<your-name>/editor.git && cd editor
```

### 3. Create your feature branch

From the `main` (default) branch:

```bash
git checkout -b <your-name>/my-new-feature
```

### 4. Start the development environment

```bash
npm install
npm run start
```

When you run the `start` command, a browser window will open showing the contents of the `test.html`
page.

This will allow you to test your changes on the test page using a source-mapped esm that updates
automatically as you change project files.

### 5. Make your changes

When you're ready to commit your changes, stage the files you have changed:

```bash
git add <my-new-feature-file>
```

See what files you have changed:

```bash
git status
```

### 6. Commit your changes

```bash
git commit -s
```

There are three things to note here

#### Sign-offs Required

First, you need to "sign-off" your commit. This indicates that you agree to the
[Developer Certificate of Origin](https://developercertificate.org/). To do this, add the `-s` flag
to your commit command. If you forget to do this, your PR will not be able to be merged.

#### Verified Commits Only

Second, your commits must be verified through signature verification. To do this, you must have a
GPG key associated with your GitHub account and configured properly for git. If you have not done so
already, you can follow the instructions in the
[GitHub Commit Signature Verification Guide](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification).

Don't forget to include this in your shell profile:

```bash
export GPG_TTY=$(tty)
```

#### Linting and Formatting

Your changes will be linted and formatted automatically when you commit. If you bypass the commit
hook, your PR will not be able to be merged.

If you want to run checks manually prior to comitting, you can do so with:

```bash
npm run lint
```

You may have to fix any errors that occur. In which case, repeat steps 5 and 6 until the `lint`
succeeds.

#### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for our commit
messages. This allows us to automatically generate a changelog from our commit history.

If you are new to Conventional Commits, please read the
[Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/)

If you are using VSCode, you can install the
[Conventional Commits extension](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits)
If you are using a different editor, please install the appropriate Conventional Commits plugin for
your editor.

If you fail to follow the Conventional Commits specification, a commit hook will fail and you will
not be able to commit your changes until you fix the commit message.

> **5 Steps to Write Better Commit Messages**
>
> **Capitalization and Punctuation:** Conventional Commits requires all lowercase.
>
> **Type of Commit:** Specify the type of commit. You must specify the type of commit you are
> making. Example – feat, fix, docs, style, refactor, test, chore, etc. As in: "feat: add dark mode
> toggle".
>
> **Mood:** Use imperative mood in the subject line. Example – Add fix for dark mode toggle state.
> Imperative mood gives the tone you are giving an order or request.
>
> **Length:** The first line should ideally be no longer than 50 characters, and the body should be
> restricted to 72 characters. Content: Be direct, try to eliminate filler words and phrases in
> these sentences (examples: though, maybe, I think, kind of).
>
> **Think like a journalist.** Who, what, when, where, why, and how.

### 7. Push your changes to a new branch on your fork on GitHub

```bash
git push origin <your-name>/my-new-feature
```

### 8. Create a Pull Request on GitHub

A member of the team will review your PR and work with you to get it accepted. It will automatically
be assigned to a reviewer. If you have any questions, please ask them in the PR comments.

## Code Style

We use [Prettier](https://prettier.io/) to format our code. It will be run on-save in VSCode if you
have the
[Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
installed. If you are using a different editor, please install the appropriate Prettier plugin for
your editor.

We use [ESLint](https://eslint.org/) to lint our code.

Both Prettier and ESLint will be run automatically when you commit your changes. If there are any
errors, you will have to fix them before you can commit.

**Lint your Code:**

```bash
npm run lint
```

**Fix Lintter Errors in your Code:**

```bash
npm run lint:fix
```

## Code of Conduct

We have adopted a Code of Conduct that we expect project participants to adhere to. Please read
[the full text](CODE_OF_CONDUCT.md).

## Developer Certificate of Origin

We use the [Developer Certificate of Origin](https://developercertificate.org/) (DCO) as an
additional safeguard for the Kullna Editor project. This is a well-established and widely-used
mechanism for managing contributions to open source projects. It is used by many other projects,
including the Linux Kernel, Git, and Node.js.

The DCO is a legally binding statement that asserts that you are the creator of your contribution,
or that you otherwise have the authority to submit it under the terms of the DCO. This is important
because it means that you are certifying that you have the right to submit your contribution under
the terms of the [GNU Lesser General Public License](https://www.gnu.org/licenses/lgpl-3.0), and
that you are agreeing to license your contribution under the terms of the
[GNU Lesser General Public License](https://www.gnu.org/licenses/lgpl-3.0).

When you submit a pull request, a DCO bot will automatically check whether you have signed off your
commit. If you have not signed off your commit, the DCO bot will add a comment to your PR asking you
to sign off your commit.

To sign off your commit, you simply add a line to your commit message that says
`Signed-off-by: <your-name> <your-email-address>`. For example:

```
Signed-off-by: Jane Doe <jane-doe@gmail.com>
```

---

The Kullna Editor source, artifacts, and website content are **Copyright (c) 2023
[The Kullna Programming Language Project](https://www.kullna.org/).**

They are free to use and open-source under the terms of the
[GNU Lesser General Public License](https://www.gnu.org/licenses/lgpl-3.0).
