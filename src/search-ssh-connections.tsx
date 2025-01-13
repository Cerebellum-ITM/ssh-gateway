import { getPreferenceValues, ActionPanel, List, Action, showHUD, Icon, closeMainWindow } from "@raycast/api";
import { getConnections } from "./utils/storage.api";
import { SSHConnection, ShellOption, Preferences } from "./types";
import { useEffect, useState } from "react";
import { runAppleScript } from "@raycast/utils";
import { getGhosttyScript } from "./scripts/ghosttyScript"

const preferences = getPreferenceValues<Preferences>();
export const openIn = preferences["openIn"];

export default function Command() {
  const [shellType, setShellType] = useState<ShellOption | null>(null);
  const [connectionsList, setConnectionsList] = useState<SSHConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const shellOptions = {
    bash: "Bash",
    zsh: "Zsh",
    fish: "Fish",
  };

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const connections = await getConnections();
        setConnectionsList(connections);
      } catch (err) {
        setError("Failed to load connections");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, []);
  
  if (isLoading) {
    return <List isLoading />;
  }

  if (error) {
    return <List>{error}</List>;
  }

  return (
    <List isLoading={isLoading} searchBarAccessory={
      <List.Dropdown 
        tooltip="Select shell type" 
        storeValue
        defaultValue={ShellOption.Bash}
        onChange={(newValue) => setShellType(newValue as ShellOption)}
      >
        {Object.entries(shellOptions).map(([value, name]) => (
            <List.Dropdown.Item key={value} title={name} value={value}/>
          ))}
      </List.Dropdown>
    }>
      {connectionsList.map((connection) => (
        <ConnectionListItem key={connection.id} connection={connection} shell={shellType}/>
      ))}
    </List>
  );
}

function ConnectionListItem(props: { connection: SSHConnection, shell: ShellOption | null }) {
  const { connection, shell } = props;
  return (
    <List.Item
      icon={Icon.ComputerChip}
      title={connection.name}
      subtitle={connection.address}
      actions={
        <ActionPanel>
          <Action title="Connect to item" onAction={() => handleSelectConnection(connection, shell)}/>
          <Action title="Configure Ghostty terminal in the item" onAction={() => configureGhosttyTerminalInSelectConnection(connection)}/>
        </ActionPanel>
      }
    />
  );
}

const handleSelectConnection = async (connection: SSHConnection, shell: ShellOption | null) => {
  const command = `ssh ${connection.name} -t ${shell}`
  const finalScript = getGhosttyScript(openIn, command);
  try {
      await closeMainWindow();
      await runAppleScript(finalScript);
      showHUD(`The server ${connection.name} was successfully configured`);
  } catch (error) {
      showHUD(`Failed to connect to ${connection.name}: ${error}`);
      console.log(error);
  }
};

const configureGhosttyTerminalInSelectConnection = async (connection: SSHConnection) => {
  const command = `infocmp -x | ssh ${connection.name} -- tic -x -`;
  const finalScript = getGhosttyScript(openIn, command);
  try {
      await closeMainWindow();
      await runAppleScript(finalScript);
      showHUD(`The server ${connection.name} was successfully configured`);
  } catch (error) {
      showHUD(`Failed to connect to ${connection.name}: ${error}`);
      console.log(error);
  }
};