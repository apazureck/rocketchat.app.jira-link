import { IJiraIssue } from "../../definition/jiraConnection";
import { IFoundIssue, IIssueReplacer } from "../../definition/messageHandling";

export class IssueReplacer implements IIssueReplacer {

    public callback: (issue: IJiraIssue) => string = issue => `[${issue.key}](${issue.jiraLinkBrowseAddress})`;

    public replaceIssues(foundIssues: Array<IFoundIssue>, text: string): string {

        for (const foundIssue of foundIssues.reverse()) {
            text = replaceInTextByIndexAndLength(text, this.callback(foundIssue.issue), foundIssue.foundMatch.index, foundIssue.foundMatch[0].length);
        }
        return text;
    }
}

export function replaceInTextByIndexAndLength(text: string, replacement: string, start: number, length: number): string {
    return text.replace(new RegExp("^(.{" + start + "}).{" + length + "}"), "$1" + replacement);
}
