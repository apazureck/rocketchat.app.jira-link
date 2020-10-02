export interface IAttachmentCreator {
    createAttachment(i: IFoundIssue): IMessageAttachment
}

export interface IFoundIssue {
    /**
     * The issue found on the JIRA server
     *
     * @type {IJiraIssueBase}
     * @memberof IFoundIssue
     */
    issue: IJiraIssueBase;

    /**
     * The found match of the search regex
     *
     * @type {RegExpExecArray}
     * @memberof IFoundIssue
     */
    foundMatch: RegExpExecArray;

    /**
     * The found issue ID in the message text (to replace)
     *
     * @type {string}
     * @memberof IFoundIssue
     */
    issueId: string;
}

export interface IJiraIssueMessageParser {
    getIssuesFromMessage(messageText: string): Promise<Array<IFoundIssue>>;
}

export interface IIssueReplacer {
    replaceIssues(foundIssues: Array<IFoundIssue>, text: string): string;
}
