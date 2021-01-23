import * as core from '@actions/core'

import getModifiedFiles from './getModifiedFiles'
import getProjectsMap from './getProjectsMap'
import getModifiedProjects from './getModifiedProjects'
import type { ActionContext, GithubClient, ProcessReturnCode } from './types'

export default async function deployModified({
    githubClient,
    workspacePath,
    beforeSha,
    afterSha,
    repositoryName,
    repositoryOwner,
}: {
    githubClient: GithubClient
    workspacePath: string
    beforeSha: string
    afterSha: string
    repositoryName: string
    repositoryOwner: string
}): Promise<ProcessReturnCode> {
    const actionContext: ActionContext = {
        githubClient,
        checkoutPath: workspacePath,
        baseSha: beforeSha,
        headSha: afterSha,
        repoName: repositoryName,
        repoOwner: repositoryOwner,
    }

    core.info(
        `Looking at ${beforeSha}...${afterSha} of ${repositoryOwner}/${repositoryName}`,
    )

    try {
        // Determine projects with changes.
        const projectsMap = await getProjectsMap(actionContext)
        const modifiedFiles = await getModifiedFiles(actionContext)
        core.startGroup('Modified files')
        if (!modifiedFiles) core.info('No changes.')
        modifiedFiles.forEach(core.info)
        core.endGroup()

        const modifiedProjects = getModifiedProjects(projectsMap, modifiedFiles)

        if (!modifiedProjects) {
            core.info('No changes to deploy.')
            return 0
        }

        core.startGroup('Modified projects')
        modifiedProjects.forEach(core.info)
        core.endGroup()

        // Tag projects that need to be deployed.
        core.startGroup('Deployment outcomes')
        modifiedProjects.forEach(project => {
            const projectFlag = `DEPLOY_${project.toUpperCase()}`
            core.exportVariable(projectFlag, 1)
            core.info(`${project} needs to be deployed.`)
        })
        core.endGroup()
    } catch (e) {
        core.error(e.message)
        return 1
    }

    return 0
}
