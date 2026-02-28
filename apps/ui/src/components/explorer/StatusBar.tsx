import { useExplorerStore } from "../../stores/explorerStore";

export const StatusBar = (): JSX.Element => {
  const documents = useExplorerStore((state) => state.documents);
  const selectedDocumentId = useExplorerStore((state) => state.selectedDocumentId);
  const userName = useExplorerStore((state) => state.userName);
  const isLoadingContent = useExplorerStore((state) => state.isLoadingContent);
  const myTasks = useExplorerStore((state) => state.myTasks);

  const selected = documents.find((document) => document.id === selectedDocumentId);

  return (
    <footer className="status-bar">
      <div>
        {documents.length} elementi
        {selected ? ` | selezionato: ${selected.name} (${selected.sizeLabel})` : ""}
      </div>
      <div>{isLoadingContent ? "Caricamento..." : `Task aperti: ${myTasks.length}`}</div>
      <div>Spazio: 12.4 GB / 500 GB | Locale | Utente: {userName}</div>
    </footer>
  );
};
