import {
    ILogger,
    IMessageBuilder,
    ISettingRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import "mocha";
import { It, Mock, Times } from "typemoq";
import { SETTINGS } from "../../app/src/configuration/configuration";
import {
    IAttachmentCreator,
    IFoundIssue,
    IIssueReplacer,
    IJiraIssueMessageParser,
} from "../../app/src/definition/messageHandling";
import { JiraIssueMessageHandler } from "../../app/src/messageHandlers/JiraIssueMessageHandler";

describe("Jira Issue Message Handler Tests", () => {
    const loggerMock = Mock.ofType<ILogger>();
    const settingsMock = Mock.ofType<ISettingRead>();
    const messageParserMock = Mock.ofType<IJiraIssueMessageParser>();
    const messageBuilderMock = Mock.ofType<IMessageBuilder>();
    const issueReplacerMock = Mock.ofType<IIssueReplacer>();
    const attachmentCreatorMock = Mock.ofType<IAttachmentCreator>();

    beforeEach(() => {
        loggerMock.reset();
        settingsMock.reset();
        messageParserMock.reset();
        messageBuilderMock.reset();
        issueReplacerMock.reset();
    });

    it("Empty Message should be ignored", async () => {
        // Arrange

        messageBuilderMock
            .setup((mb) => mb.getMessage())
            .returns(() => {
                return {} as IMessage;
            });

        const cut = new JiraIssueMessageHandler(
            loggerMock.object,
            settingsMock.object,
            messageParserMock.object,
            messageBuilderMock.object,
            issueReplacerMock.object,
            attachmentCreatorMock.object
        );

        // Act

        const result = await cut.replaceIssuesInMessage();

        // Assert

        messageParserMock.verify(
            (pm) => pm.getIssuesFromMessage(It.isAny()),
            Times.never()
        );
        messageBuilderMock.verify((mb) => mb.getMessage(), Times.once());
    });

    it("Message should be correctly forwarded to message parser", async () => {
        // Arrange

        const text = "text";

        messageBuilderMock.setup((mb) => mb.getText()).returns(() => text);

        messageParserMock
            .setup((pm) => pm.getIssuesFromMessage(text))
            .returns(async () => []);

        const cut = new JiraIssueMessageHandler(
            loggerMock.object,
            settingsMock.object,
            messageParserMock.object,
            messageBuilderMock.object,
            issueReplacerMock.object,
            attachmentCreatorMock.object
        );

        // Act

        const result = await cut.replaceIssuesInMessage();

        // Assert

        messageParserMock.verify(
            (pm) => pm.getIssuesFromMessage(text),
            Times.once()
        );
    });

    it("Issue links should be created", async () => {
        // Arrange

        const input = "input to issue replacer";
        const output = "output  FROM  issue replacer";

        messageBuilderMock.setup((mb) => mb.getText()).returns(() => input);

        messageParserMock
            .setup((pm) => pm.getIssuesFromMessage(input))
            .returns(async () => [Mock.ofType<IFoundIssue>().object]);

        issueReplacerMock
            .setup((ir) => ir.replaceIssues(It.isAny(), input))
            .returns(() => output);

        const cut = new JiraIssueMessageHandler(
            loggerMock.object,
            settingsMock.object,
            messageParserMock.object,
            messageBuilderMock.object,
            issueReplacerMock.object,
            attachmentCreatorMock.object
        );

        // Act

        const result = await cut.replaceIssuesInMessage();

        // Assert

        messageParserMock.verify(
            (pm) => pm.getIssuesFromMessage(input),
            Times.once()
        );

        messageBuilderMock.verify((mb) => mb.setText(output), Times.once());
        attachmentCreatorMock.verify(
            (ac) => ac.createAttachment(It.isAny()),
            Times.never()
        );
    });

    it("Attachments should be created if requested", async () => {
        // Arrange

        const input = "input to issue replacer";
        const output = "output  FROM  issue replacer";

        messageBuilderMock.setup((mb) => mb.getText()).returns(() => input);

        messageParserMock
            .setup((pm) => pm.getIssuesFromMessage(input))
            .returns(async () => [Mock.ofType<IFoundIssue>().object]);

        issueReplacerMock
            .setup((ir) => ir.replaceIssues(It.isAny(), input))
            .returns(() => output);

        settingsMock
            .setup((s) => s.getValueById(SETTINGS.addAttachments))
            .returns(async () => true);

        const cut = new JiraIssueMessageHandler(
            loggerMock.object,
            settingsMock.object,
            messageParserMock.object,
            messageBuilderMock.object,
            issueReplacerMock.object,
            attachmentCreatorMock.object
        );

        // Act

        const result = await cut.replaceIssuesInMessage();

        // Assert

        messageParserMock.verify(
            (pm) => pm.getIssuesFromMessage(input),
            Times.once()
        );

        messageBuilderMock.verify((mb) => mb.setText(output), Times.once());
        attachmentCreatorMock.verify(ac => ac.createAttachment(It.isAny()), Times.once());
    });
});
