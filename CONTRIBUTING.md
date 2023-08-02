---
---

<p align="center"><a href="https://editor.kullna.org/"><img src="https://www.kullna.org/brand/logo.svg" width="150"></a></p>
<h1 align="center">@kullna/editor</h1>
<h3 align="center">A small but feature-rich code editor for the web</h3>

<p align="center"><a href="/">Home</a></p>

# How to Contribute

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

1. Fork the repo on GitHub
2. Clone the fork on your local machine

```bash
git clone git://github.com/<your-name>/editor.git
```

3. Create your feature branch

```bash
git checkout -b <your-name>/my-new-feature
```

4. Start the development environment

```bash
npm install
npm run start
```

5. Make your changes

Temporarily change which file is loaded in `demo.html` from the CDN to: `dist/kullna-editor.esm.js`.

You will find the relavant lines commented out in `demo.html`.

This will allow you to test your changes on the demo page using a source-mapped esm that updates
automatically as you change project files.

When you're ready to commit your changes, stage the files you have changed:

```bash
git add <my-new-feature-file>
```

6. Commit your changes

```bash
git commit
```

You may have to fix any errors that occur. In which case, repeat steps 5 and 6 until the commit
succeeds.

7. Push your changes to a new branch on your fork on GitHub

```bash
git push origin <your-name>/my-new-feature
```

8. Create a Pull Request on GitHub

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

## Commit Messages

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

_The Kullna Editor source, artifacts, and website content are **Copyright (c) 2023 The Kullna
Programming Language Project.** They are free to use and open-source under the terms of the
[GNU Lesser General Public License](https://www.gnu.org/licenses/lgpl-3.0)._

_Portions of this library are [Copyright (c) 2020 Anton Medvedev and others](NOTICE.md) and used
under the terms of the MIT License._
