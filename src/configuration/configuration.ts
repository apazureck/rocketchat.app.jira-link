import {
    IConfigurationExtend,
    IEnvironmentRead
} from "@rocket.chat/apps-engine/definition/accessors";
import { SettingType } from "@rocket.chat/apps-engine/definition/settings";

export const settingJiraServerAddress = "jira-link-server-address";
export const settingJiraUserName = "jira-link-username";
export const settingJiraPassword = "jira-link-password";
export const settingRegex = "jira-link-regex";
export const settingAddAttachments = "jira-link-add-attachments";

const sectionConnection = "Connection Settings";
const sectionAttachments = "Attachments";

export function extendConfiguration(
    configuration: IConfigurationExtend,
    environmentRead: IEnvironmentRead
): void {
    /// Server Settings
    configuration.settings.provideSetting({
        section: sectionConnection,
        id: settingJiraServerAddress,
        packageValue: "",
        public: false,
        type: SettingType.STRING,
        multiline: false,
        required: true,
        i18nLabel: settingJiraServerAddress + "-label",
        i18nDescription: settingJiraServerAddress + "-description",
        i18nPlaceholder: "http://localhost:5000"
    });
    configuration.settings.provideSetting({
        section: sectionConnection,
        id: settingJiraUserName,
        packageValue: "",
        public: false,
        type: SettingType.STRING,
        multiline: false,
        required: true,
        i18nLabel: settingJiraUserName + "-label",
        i18nDescription: settingJiraUserName + "-description",
        i18nPlaceholder: "John Doe"
    });
    configuration.settings.provideSetting({
        section: sectionConnection,
        id: settingJiraPassword,
        packageValue: "",
        public: false,
        type: SettingType.STRING,
        multiline: false,
        required: true,
        i18nLabel: settingJiraPassword + "-label",
        i18nDescription: settingJiraPassword + "-description",
        i18nPlaceholder: "****"
    });

    /// Regular Expression
    configuration.settings.provideSetting({
        id: settingRegex,
        packageValue: "\\b\\w+-\\d+\\b",
        public: false,
        type: SettingType.CODE,
        multiline: false,
        required: true,
        i18nLabel: settingRegex + "-label",
        i18nDescription: settingRegex + "-description"
    });

    // Attachment Settings
    configuration.settings.provideSetting({
        id: settingAddAttachments,
        section: sectionAttachments,
        packageValue: true,
        public: false,
        type: SettingType.BOOLEAN,
        required: true,
        i18nLabel: settingAddAttachments + "-label",
        i18nDescription: settingAddAttachments + "-description"
    });
}
