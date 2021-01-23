# ship-monorepo-action
:ship: Shipping monorepos? No problemo. :rocket:

## Only deploy what you need to

If you are using monorepos to host your app's frontend/backend/client(s), you probably ran into the problem of needing to deploy only what changed. After all, changes made to the frontend shouldn't trigger a backend deploy and vice-versa. The homebrewed solution to this is to try and detect which projects have new changes that need to be shipped. `ship-monorepo-action` abtracts all of this away and takes care of setting up environment flags so you can gate which deploy jobs to run.


```
jobs:
    monorepo_deploy:
        #...
        - name: Determine what to deploy
          uses: mcataford/ship-monorepo-action
          with:
            gh_token: <action-scoped token>
        - name: Deploy frontend
          if: env.DEPLOY_FRONTEND == 1
          run: echo "Ship it!"
        - name: Deploy backend
          if: env.DEPLOY_BACKEND == 1
          run: echo "Ship it!"
```

When the action is run, it will determine which projects contain changes (see [configuration](###Configuration)) and will set environment variables that you can use to gate further deploy steps.

## Usage

### Configuration

Set up a `.shipMonorepo` file at the root of your repository to tell the action what your project domains are:

```
{
    "projects": {
        "project1": "frontend/*",
        "project2: "backend/*"
    }
}
```

Using the globs defined for each project, `ship-monorepo` determines if any of the changes added in the triggering event corresponds to a project. If any change exists for a given project, a `DEPLOY_{project_name}` environment variable will be set and can be used for triggering further behaviour.

In the example above, any file in `frontend/` would result in `DEPLOY_PROJECT1` being set in the environment.
