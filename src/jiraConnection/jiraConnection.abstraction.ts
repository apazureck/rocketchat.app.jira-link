export interface IJiraConnection {
    serverUrl: string;
    request<T>(url: string): Promise<T>;

}
