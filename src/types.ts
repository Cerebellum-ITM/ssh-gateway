export interface SSHConnection {
  id: string;
  address: string;
  name: string;
  user?: string;
  port?: string;
  identityFile?: string;
}

export interface Preferences {
  openIn: string;
}

export enum ShellOption {
  Bash = "bash",
  Zsh = "zsh",
  Fish = "fish",
}