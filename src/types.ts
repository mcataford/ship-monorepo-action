export interface ActionContext {
    githubClient: GithubClient
    repoOwner: string
    repoName: string
    baseSha: string
    headSha: string
    checkoutPath: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GithubClient = any

export type ProcessReturnCode = 0 | 1

export type ProjectsMap = Map<string, string>
