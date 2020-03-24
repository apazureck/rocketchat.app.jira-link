import { ILogger } from "@rocket.chat/apps-engine/definition/accessors";

export interface ILogProvider {
    getLogger(): ILogger;
}
