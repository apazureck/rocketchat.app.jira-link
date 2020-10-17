import { ILogger, ISettingRead } from "@rocket.chat/apps-engine/definition/accessors";
import { SETTINGS } from "../../configuration/configuration";
import { IJiraIssue } from "../../definition/jiraConnection";
import { IFoundIssue, IIssueReplacer } from "../../definition/messageHandling";

export class IssueReplacer implements IIssueReplacer {
    /**
     *
     */
    constructor(private settings: ISettingRead, private logger: ILogger) {}
    public callback: (issue: IJiraIssue) => string = (issue) =>
        `[${issue.key}](${issue.jiraLinkBrowseAddress})`;

    public async replaceIssues(
        foundIssues: Array<IFoundIssue>,
        text: string
    ): Promise<string> {
        const shouldreplace: boolean = await this.settings.getValueById(SETTINGS.replaceIssueIdsWithLinks);
        this.logger.debug("Replace issue ids with links", shouldreplace)
        if (!shouldreplace) {
            return text;
        }

        for (const foundIssue of foundIssues.reverse()) {
            text = replaceInTextByIndexAndLength(
                text,
                this.callback(foundIssue.issue),
                foundIssue.foundMatch.index,
                foundIssue.foundMatch[0].length
            );
        }
        return text;
    }
}

/**
 * This function replaces replaces the characters at startIndex and length with the given replacement string.
 *
 * The replacment string will not be cut to the given length, so the result that is returned will be longer or shorter than the original string.
 *
 * @export
 * @param {string} text Text the replacment should be inserted
 * @param {string} replacement The string that will be inserted at startIndex and will replace the length.
 * @param {number} startIndex The start index to replace
 * @param {number} length The number of characters that should be covered by the replacement string
 * @return {*}  {string} The result string
 */
export function replaceInTextByIndexAndLength(
    text: string,
    replacement: string,
    startIndex: number,
    length: number
): string {
    return text.replace(
        new RegExp("^(.{" + startIndex + "}).{" + length + "}", "s"),
        "$1" + replacement
    );
}
