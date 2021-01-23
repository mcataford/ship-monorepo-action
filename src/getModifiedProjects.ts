import { match } from 'minimatch'

import type { ProjectsMap } from './types'

export default function getModifiedProjects(
    projectsMap: ProjectsMap,
    modifiedFiles: string[],
): string[] {
    return Object.entries(projectsMap).reduce(
        (modifiedProjects, [projectName, projectPattern]) => {
            const hasChanged = match(modifiedFiles, projectPattern).some(
                Boolean,
            )

            return hasChanged
                ? [...modifiedProjects, projectName]
                : modifiedProjects
        },
        [],
    )
}
