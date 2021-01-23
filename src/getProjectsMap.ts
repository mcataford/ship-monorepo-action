import { resolve as resolvePath } from 'path'
import { existsSync, readFileSync } from 'fs'

import Ajv from 'ajv'

import type { ActionContext, ProjectsMap } from './types'
import configSchema from './configSchema'

function validateConfig(configObject: Record<string, any>): boolean {
    const validateSchema = new Ajv().compile(configSchema)

    const isValid = validateSchema(configObject)

    return isValid
}
export default async function getProjectsMap(
    context: ActionContext,
): Promise<ProjectsMap> {
    const configPath = resolvePath(context.checkoutPath, '.shipMonorepo')

    if (!existsSync(configPath)) throw new Error('Config file not found')

    let config
    try {
        config = JSON.parse(
            readFileSync(configPath, {
                encoding: 'utf8',
            }),
        )
    } catch (e) {
        throw new Error('Invalid config file')
    }
    if (!validateConfig(config)) {
        throw new Error('Invalid config file')
    }

    const projectsMap: ProjectsMap = config.projects
    return projectsMap
}
