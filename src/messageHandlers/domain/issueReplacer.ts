import { IFoundIssue, IIssueReplacer } from "../../definition/messageHandling";

export class IssueReplacer implements IIssueReplacer {
    public replaceIssues(foundIssues: Array<IFoundIssue>, text: string): string {
        for (const foundIssue of foundIssues) {
            text = text.replace(
                foundIssue.issueId,
                `[${foundIssue.issue.key}](${foundIssue.issue.jiraLinkBrowseAddress})`
            );
        }
        return text;
    }

}
