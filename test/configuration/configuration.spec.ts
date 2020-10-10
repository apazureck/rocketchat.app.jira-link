import { ISettingsExtend } from "@rocket.chat/apps-engine/definition/accessors";
import "mocha";
import { Mock } from "typemoq";
import { extendConfiguration } from "../../app/src/configuration/configuration";

describe("Tests for configuration generation", () => {
    it("Settings should work properly", () => {
        // Arrange

        const settingsMock = Mock.ofType<ISettingsExtend>();

        // Act

        extendConfiguration(settingsMock.object);

        // Assert

    });
});
