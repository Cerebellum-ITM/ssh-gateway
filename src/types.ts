export interface SSHConnection {
  id: string;
  address: string;
  name: string;
  user?: string;
  port?: string;
  identityFile?: string;
}
