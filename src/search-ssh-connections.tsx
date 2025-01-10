import { ActionPanel, Detail, List, Action, Icon } from "@raycast/api";
import { getConnections } from "./utils/storage.api";
import { SSHConnection } from "./types";
import { useEffect, useState } from "react";

export default function Command() {
  const [connectionsList, setConnectionsList] = useState<SSHConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <List isLoading={isLoading}>
      {connectionsList.map((connection) => (
        <ConnectionListItem key={connection.id} connection={connection} />
      ))}
    </List>
  );
}

function ConnectionListItem(props: { connection: SSHConnection }) {
  const { connection } = props;
  console.log(connection)
  return (
    <List.Item
      icon={Icon.ComputerChip}
      title={connection.name}
      subtitle={connection.address}
      actions={
        <ActionPanel>
          <Action.Push title="Show Details" target={<Detail markdown={`# ${connection.name}\n\n**Address:** ${connection.address}\n\n**User:** ${connection.user || "N/A"}\n\n**Port:** ${connection.port || "N/A"}\n\n${connection.identityFile || "N/A"}`}/>}/>
        </ActionPanel>
      }
    />
  );
}
