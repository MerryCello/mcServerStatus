export type ServerData = {id?: string; address: string; name: string};

export type UserServers = {servers: ServerData[]};

export type SharedList = UserServers & {name: string; ownersUids: string[]};
