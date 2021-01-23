import * as core from '@actions/core'
import mockFS from 'mock-fs'

import shipMonorepo from '../src/shipMonorepo'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

function getMockConfigSource(mapping) {
    return `
{
    "projects": ${JSON.stringify(mapping)}
}
`
}

function getMockClient(responseData) {
    return {
        repos: {
            compareCommits: jest.fn().mockReturnValue(responseData),
        },
    }
}

const defaultParams = {
    workspacePath: '',
    beforeSha: 'before-sha-123',
    afterSha: 'after-sha-456',
    repositoryName: 'repo',
    repositoryOwner: 'superdev',
}

describe('shipMonorepo', () => {
    let errorSpy

    beforeEach(() => {
        jest.spyOn(core, 'info').mockImplementation(noop)
        errorSpy = jest.spyOn(core, 'error').mockImplementation(noop)
        jest.spyOn(core, 'startGroup').mockImplementation(noop)
        jest.spyOn(core, 'endGroup').mockImplementation(noop)
        mockFS.restore()
    })

    afterEach(() => {
        mockFS.restore()
        jest.restoreAllMocks()
    })
    describe('Configuration', () => {
        it.each`
            reason                     | config
            ${'not valid JSON'}        | ${'not-json'}
            ${'missing required keys'} | ${'{}'}
        `('Fails if given config file is $reason', async ({ config }) => {
            mockFS({
                '.shipMonorepo': config,
            })

            const returnCode = await shipMonorepo({
                ...defaultParams,
                githubClient: null,
            })

            expect(returnCode).toEqual(1)
            expect(errorSpy.mock.calls[0][0]).toMatchInlineSnapshot(
                '"Invalid config file"',
            )
        })

        it('Fails if given config file is missing', async () => {
            mockFS({})

            const returnCode = await shipMonorepo({
                ...defaultParams,
                githubClient: null,
            })

            expect(returnCode).toEqual(1)
            expect(errorSpy.mock.calls[0][0]).toMatchInlineSnapshot(
                '"Config file not found"',
            )
        })
    })

    it('sets an environment variables if a project matches', async () => {
        const mockMapping = { proj1: 'proj1/*' }
        const modifiedFiles = ['proj1/test.txt', 'other/stuff.exe']

        mockFS({
            '.shipMonorepo': getMockConfigSource(mockMapping),
        })
        const exportVariableSpy = jest
            .spyOn(core, 'exportVariable')
            .mockImplementation(noop)
        const mockClient = getMockClient({
            data: {
                files: modifiedFiles.map(filename => ({ filename })),
            },
        })

        const returnCode = await shipMonorepo({
            ...defaultParams,
            githubClient: mockClient,
        })
        expect(mockClient.repos.compareCommits).toHaveBeenCalledWith({
            base: defaultParams.beforeSha,
            head: defaultParams.afterSha,
            owner: defaultParams.repositoryOwner,
            repo: defaultParams.repositoryName,
        })
        expect(returnCode).toEqual(0)
        expect(exportVariableSpy).toHaveBeenCalledWith('DEPLOY_PROJ1', 1)
        expect(exportVariableSpy).toHaveBeenCalledTimes(1)
    })

    it('sets multiple environment variables if multiple projects match', async () => {
        const mockMapping = { proj1: 'proj1/*', other: 'other/*' }
        const modifiedFiles = ['proj1/test.txt', 'other/stuff.exe']

        mockFS({
            '.shipMonorepo': getMockConfigSource(mockMapping),
        })
        const exportVariableSpy = jest
            .spyOn(core, 'exportVariable')
            .mockImplementation(noop)
        const mockClient = getMockClient({
            data: {
                files: modifiedFiles.map(filename => ({ filename })),
            },
        })

        const returnCode = await shipMonorepo({
            ...defaultParams,
            githubClient: mockClient,
        })
        expect(mockClient.repos.compareCommits).toHaveBeenCalledWith({
            base: defaultParams.beforeSha,
            head: defaultParams.afterSha,
            owner: defaultParams.repositoryOwner,
            repo: defaultParams.repositoryName,
        })
        expect(returnCode).toEqual(0)
        expect(exportVariableSpy).toHaveBeenNthCalledWith(1, 'DEPLOY_PROJ1', 1)
        expect(exportVariableSpy).toHaveBeenNthCalledWith(2, 'DEPLOY_OTHER', 1)
        expect(exportVariableSpy).toHaveBeenCalledTimes(2)
    })

    it('sets no environment variables if no projects match', async () => {
        const mockMapping = { proj1: 'proj1/*', other: 'other/*' }
        const modifiedFiles = ['project/test.txt', 'otherproject/stuff.exe']

        mockFS({
            '.shipMonorepo': getMockConfigSource(mockMapping),
        })
        const exportVariableSpy = jest
            .spyOn(core, 'exportVariable')
            .mockImplementation(noop)
        const mockClient = getMockClient({
            data: {
                files: modifiedFiles.map(filename => ({ filename })),
            },
        })

        const returnCode = await shipMonorepo({
            ...defaultParams,
            githubClient: mockClient,
        })
        expect(mockClient.repos.compareCommits).toHaveBeenCalledWith({
            base: defaultParams.beforeSha,
            head: defaultParams.afterSha,
            owner: defaultParams.repositoryOwner,
            repo: defaultParams.repositoryName,
        })
        expect(returnCode).toEqual(0)
        expect(exportVariableSpy).not.toHaveBeenCalled()
    })
})
