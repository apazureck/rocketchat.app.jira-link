// tslint:disable: max-classes-per-file

import {
    ISettingsExtend
} from "@rocket.chat/apps-engine/definition/accessors";
import { SettingType } from "@rocket.chat/apps-engine/definition/settings";

export class SETTINGS {
    public static get replaceIssueIdsWithLinks(): string { return "jira-link-replaceIssueIdsWithLinks"; }
    public static get jiraServerAddress(): string { return "jira-link-server-address"; }
    public static get jiraUserName(): string { return "jira-link-username"; }
    public static get jiraPassword(): string { return "jira-link-password"; }
    public static get regex(): string { return "jira-link-regex"; }
    public static get addAttachments(): string { return "jira-link-add-attachments"; }
    public static get filterRegex(): string { return "jira-link-filter-regex"; }
    public static get DEFAULTS(): SettingsDefaults { return new SettingsDefaults(); }
}

class SettingsDefaults {
    public get filterRegex(): RegExp { return /(\[.*?(\w+-\d+).*?\]\(.*?\1.*?\)|```.*?```|`.*?`)/gm; }
    public get regex(): RegExp { return /\b\w+-\d+\b/gm; }
}

const sectionConnection = "Connection Settings";
const sectionAttachments = "Message Settings";

export function extendConfiguration(
    settings: ISettingsExtend
): void {
    /// Server Settings
    settings.provideSetting({
        section: sectionConnection,
        id: SETTINGS.jiraServerAddress,
        packageValue: "",
        public: false,
        type: SettingType.STRING,
        multiline: false,
        required: true,
        i18nLabel: label(SETTINGS.jiraServerAddress),
        i18nDescription: description(SETTINGS.jiraServerAddress),
        i18nPlaceholder: "http://localhost:5000"
    });
    settings.provideSetting({
        section: sectionConnection,
        id: SETTINGS.jiraUserName,
        packageValue: "",
        public: false,
        type: SettingType.STRING,
        multiline: false,
        required: true,
        i18nLabel: label(SETTINGS.jiraUserName),
        i18nDescription: description(SETTINGS.jiraUserName),
        i18nPlaceholder: "John Doe"
    });
    settings.provideSetting({
        section: sectionConnection,
        id: SETTINGS.jiraPassword,
        packageValue: "",
        public: false,
        type: SettingType.STRING,
        multiline: false,
        required: true,
        i18nLabel: label(SETTINGS.jiraPassword),
        i18nDescription: description(SETTINGS.jiraPassword),
        i18nPlaceholder: "****"
    });

    /// Regular Expression
    settings.provideSetting({
        id: SETTINGS.regex,
        packageValue: SETTINGS.DEFAULTS.regex.source,
        public: false,
        type: SettingType.CODE,
        multiline: false,
        required: true,
        i18nLabel: label(SETTINGS.regex),
        i18nDescription: description(SETTINGS.regex)
    });

    /// Filter Regular Expression
    settings.provideSetting({
        id: SETTINGS.filterRegex,
        packageValue: SETTINGS.DEFAULTS.filterRegex.source,
        public: false,
        type: SettingType.CODE,
        multiline: false,
        required: true,
        i18nLabel: label(SETTINGS.filterRegex),
        i18nDescription: description(SETTINGS.filterRegex)
    });

    settings.provideSetting({
        id: SETTINGS.replaceIssueIdsWithLinks,
        section: sectionAttachments,
        packageValue: true,
        public: false,
        type: SettingType.BOOLEAN,
        required: true,
        i18nLabel: label(SETTINGS.replaceIssueIdsWithLinks),
        i18nDescription: description(SETTINGS.replaceIssueIdsWithLinks)
    });
    // Attachment Settings
    settings.provideSetting({
        id: SETTINGS.addAttachments,
        section: sectionAttachments,
        packageValue: true,
        public: false,
        type: SettingType.BOOLEAN,
        required: true,
        i18nLabel: label(SETTINGS.addAttachments),
        i18nDescription: description(SETTINGS.addAttachments)
    });
}

function label(id: string) {
    return id  + "-label";
}

function description(id: string) {
    return id + "-description";
}
