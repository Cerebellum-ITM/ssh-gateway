import { LocalStorage, getPreferenceValues } from "@raycast/api";
import { SSHConnection } from "../types";
import * as fs from "fs";

const preferences = getPreferenceValues();
const sshConfig = preferences.sshConfig.replace("~", process.env.HOME);

function parseSSHConfig(configFilePath: string): SSHConnection[] {
  const configData = fs.readFileSync(configFilePath, "utf8");
  const configLines = configData.split("\n");

  const connections: SSHConnection[] = [];
  let currentConnection: SSHConnection | null = null;
  

  for (const line of configLines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("#") || trimmedLine === "") {
      continue;
    }

    if (trimmedLine.startsWith("Host ") && trimmedLine !== "Host *") {
      if (currentConnection !== null) {
        connections.push(currentConnection);
      }

      currentConnection = { 
        id: connections.length.toString(), 
        address: "", 
        name: trimmedLine.substring(5), 
        user: "" ,
      };

    } else if (currentConnection !== null) {
      const firstSpaceIndex = trimmedLine.indexOf(" ");
      const key = trimmedLine.substring(0, firstSpaceIndex);
      const value = trimmedLine.substring(firstSpaceIndex + 1);
      switch (key) {
        case "HostName":
          currentConnection.address = value;
          break;
        case "User":
          currentConnection.user = value;
          break;
        case "Port":
          currentConnection.port = value;
          break;
        case "IdentityFile":
          currentConnection.identityFile = value;
          break;
        case "HostNameKey":
          // Ignore this key
          break;
        default:
          break;
      }
    }
  }

  if (currentConnection !== null) {
    connections.push(currentConnection);
  }

  return connections;
}


export async function getConnections(): Promise<SSHConnection[]> {
  switch (sshConfig) {
    case "localStorage": {
      const { connections } = await LocalStorage.allItems();
      if (!connections) {
        return [];
      }
      return JSON.parse(connections);
    }
    default: {
      if (!fs.existsSync(sshConfig)) {
        return [];
      }
      const connections = parseSSHConfig(sshConfig);
      return connections;
    }
  }
}
