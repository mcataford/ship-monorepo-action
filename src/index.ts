import { getOctokit, context as githubContext } from '@actions/github'
import { getInput, error as logError } from '@actions/core'

import shipMonorepo from './shipMonorepo'

// Github Client.
const token = getInput('gh_token')

if (!token) {
    logError('Github token not found')
    process.exit(1)
}

const githubClient = getOctokit(token)

// Workspace path within action.
const workspacePath = process.env.GITHUB_WORKSPACE

// Sha before event
const beforeSha = githubContext.payload.before

// Sha after event
const afterSha = githubContext.payload.after

// Repository
const repositoryName = githubContext?.payload?.repository?.name

// Repository owner
const repositoryOwner = githubContext?.payload?.repository?.owner?.login

if (!beforeSha || !afterSha || !repositoryName || !repositoryOwner) {
    logError('Github context not found.')
    process.exit(1)
}

shipMonorepo({
    githubClient,
    workspacePath,
    beforeSha,
    afterSha,
    repositoryName,
    repositoryOwner,
}).then(returnCode => {
    process.exit(returnCode)
})
