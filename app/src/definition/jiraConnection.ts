export interface IJiraConnection {
    serverUrl: string;
    request<T>(url: string): Promise<T>;
}

export interface IJiraIssueProvider {
    getIssue(issueId: string): Promise<IJiraIssue | undefined>;
    searchIssue(searchString: string): Promise<ISearchResult>;
}

export interface IJiraIssueBase {
    key: string;
    fields: {
        issuetype: {
            name: string;
            iconUrl: string;
        };
        description: string;
        summary: string;
        status: {
            name: string;
        };
    };

    /**
     * These field is set by the issuer for link creation in the attachment
     *
     * @type {string}
     * @memberof IJiraIssue
     */
    jiraLinkAddress: string;

    /**
     * This field is set by the issuer. This is the browse link to the server
     *
     * @type {string}
     * @memberof IJiraIssue
     */
    jiraLinkBrowseAddress: string;

    /**
     * Server the issue was found on
     *
     * @type {string}
     * @memberof IJiraIssue
     */
    jiraLinkServerUrl: string;
}

export interface ISearchResult {
    expand: string;
    startAt: number;
    maxResults: number;
    total: number;
    issues: Array<IJiraIssueBase>;
}

export interface IJiraLinkEntity {
    jiraLinkAddress: string;
    jiraLinkBrowseAddress: string;
    jiraLinkServerUrl: string;
}

export interface IJiraIssue extends IJiraIssueBase, IJiraLinkEntity {}
