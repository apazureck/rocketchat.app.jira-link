import { IJiraIssue } from "../../definition/jiraConnection";
import { IFoundIssue, IIssueReplacer } from "../../definition/messageHandling";

export class IssueReplacer implements IIssueReplacer {

    public callback: (issue: IJiraIssue) => string = issue => `[${issue.key}](${issue.jiraLinkBrowseAddress})`;

    public replaceIssues(foundIssues: Array<IFoundIssue>, text: string): string {
        for (const issue of foundIssues.map(fi => fi.issue)) {
            text = text.replace(
                issue.issueId,
                this.callback(issue)
            );
        }
        return text;
    }

}
