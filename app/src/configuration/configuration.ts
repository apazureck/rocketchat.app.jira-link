import {
    IConfigurationExtend,
    IEnvironmentRead,
    ISettingsExtend
} from "@rocket.chat/apps-engine/definition/accessors";
import { SettingType } from "@rocket.chat/apps-engine/definition/settings";

export const SETTINGS = {
    jiraServerAddress: "jira-link-server-address",
    jiraUserName: "jira-link-username",
    jiraPassword: "jira-link-password",
    regex: "jira-link-regex",
    addAttachments: "jira-link-add-attachments",
    filterRegex: "jira-link-filter-regex",
    DEFAULTS: {
        filterRegex: /(\[.*?(\w+-\d+).*?\]\(.*?\1.*?\)|```.*?```|`.*?`)/gm,
        regex: /\b\w+-\d+\b/gm,
    }
} as const;

const sectionConnection = "Connection Settings";
const sectionAttachments = "Attachments";

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
        packageValue: SETTINGS.DEFAULTS.regex,
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
