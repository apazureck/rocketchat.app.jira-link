import {
  IHttp,
  ILogger,
  IMessageBuilder,
  IModify,
  IModifyCreator,
  IPersistence,
  IRead,
  IUserRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
  ISlashCommandPreviewItem,
  SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { expect } from "chai";
import "mocha";
import { It, Mock, Times } from "typemoq";
import { SearchIssueCommand } from "../../app/src/commands/searchIssueCommand";
import {
  IJiraIssueBase,
  ISearchResult,
} from "../../app/src/definition/jiraConnection";

describe("Search Command Tests", () => {
  it("Put Issue in Message Id should return valid item", () => {
    // Arrange

    const loggerMock = Mock.ofType<ILogger>();

    const itemMock = Mock.ofType<ISlashCommandPreviewItem>();
    itemMock.setup((i) => i.id).returns(() => "ISSUE-123");

    const commandContextMock = Mock.ofType<SlashCommandContext>();

    const messageMock = Mock.ofType<IMessageBuilder>();
    messageMock
      .setup((m) => m.setSender(It.isAny()))
      .returns(() => messageMock.object);
    messageMock
      .setup((m) => m.setRoom(It.isAny()))
      .returns(() => messageMock.object);

    const creatorMock = Mock.ofType<IModifyCreator>();
    creatorMock
      .setup((c) => c.startMessage())
      .returns(() => messageMock.object);

    const modifyMock = Mock.ofType<IModify>();
    modifyMock.setup((m) => m.getCreator()).returns(() => creatorMock.object);

    const cut = new SearchIssueCommand(loggerMock.object);

    // Act
    cut.putIssueIdInMessage(
      modifyMock.object,
      commandContextMock.object,
      itemMock.object
    );

    // Assert

    messageMock.verify((m) => m.setSender(It.isAny()), Times.once());
    messageMock.verify((m) => m.setRoom(It.isAny()), Times.once());
    messageMock.verify((m) => m.setThreadId(It.isAny()), Times.once());
    messageMock.verify((m) => m.setText(itemMock.object.id), Times.once());
    creatorMock.verify((c) => c.finish(messageMock.object), Times.once());
  });
  it("previewer should return valid issue", () => {
    // Arrange

    const resultcount = 1;
    const key = "ISSUE-123";
    const summary = "SUMMARY";

    const loggerMock = Mock.ofType<ILogger>();

    const issueMock = Mock.ofType<IJiraIssueBase>();
    issueMock.setup(i => i.key).returns(() => key);
    issueMock.setup(i => i.fields).returns(() => {
        return {
            summary,
            description: "a bug",
            issuetype: {
                iconUrl: "url",
                name: "name",
            },
            status: {
                name: "Done"
            }
        };
    });

    const searchResultMock = Mock.ofType<ISearchResult>();
    searchResultMock.setup((sr) => sr.total).returns(() => resultcount);
    searchResultMock.setup((sr) => sr.issues).returns(() => [issueMock.object]);

    const cut = new SearchIssueCommand(loggerMock.object);

    // Act

    const result = cut.buildPreviewFromSearchResult(searchResultMock.object);

    // Assert

    expect(result.i18nTitle).equals(`Found ${resultcount} results for`);
    const testitem = result.items.pop() as ISlashCommandPreviewItem;
    expect(testitem.id).equals(key);
    expect(testitem.value).equals(`[${key}]\n${summary}`);
  });
});
