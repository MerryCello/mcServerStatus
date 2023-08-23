type FormattedText = {
  raw: string[];
  clean: string[];
  html: string[];
};

type NameVersion = {
  name: string;
  version: string;
};

/** See https://api.mcsrvstat.us/ for more info */
export type ServerStatus = {
  pingAvgMs?: number;
  loading?: boolean;
  online?: boolean;
  error?: Error;
  ip?: string;
  port?: number;
  hostname?: string; //Only included when a hostname is detected
  debug?: {
    //See section below for information about the values
    ping: boolean;
    query: boolean;
    srv: boolean;
    querymismatch: boolean;
    ipinsrv: boolean;
    cnameinsrv: boolean;
    animatedmotd: boolean;
    cachehit: boolean;
    cachetime: number;
    cacheexpire: number;
    apiversion: number;
  };
  version?: string; //Could include multiple versions or additional text
  protocol?: {
    //Only included when ping is used
    version: number;
    name?: string; //Only included if a version name is found
  };
  icon?: string; //Only included when an icon is detected
  software?: string; //Only included when software is detected
  map?: FormattedText;
  gamemode?: string; //Only included for Bedrock servers
  serverid?: string; //Only included for Bedrock servers
  eula_blocked?: boolean; //Only included for Java servers
  motd?: FormattedText;
  players?: {
    online: number;
    max: number;
    list?: { name: string; uuid: string }[];
    //Only included when there are players
  };
  plugins?: NameVersion[];
  //Only included when plugins are detected
  mods?: NameVersion[];
  //Only included when mods are detected
  info?: FormattedText; //Only included when detecting that the player samples are used for information
};
