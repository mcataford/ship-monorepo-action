import type { ActionContext } from './types'

export default async function getModifiedFiles(
    actionContext: ActionContext,
): Promise<string[]> {
    const comparison = await actionContext.githubClient.repos.compareCommits({
        owner: actionContext.repoOwner,
        repo: actionContext.repoName,
        base: actionContext.baseSha,
        head: actionContext.headSha,
    })

    const modifiedFiles = comparison.data.files.map(file => file.filename)
    return modifiedFiles
}
