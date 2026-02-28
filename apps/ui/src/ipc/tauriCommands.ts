interface TauriCore {
  invoke<T>(command: string, payload?: Record<string, unknown>): Promise<T>;
}

interface TauriGlobal {
  core?: TauriCore;
}

declare global {
  interface Window {
    __TAURI__?: TauriGlobal;
  }
}

const invoke = async <T>(command: string, payload?: Record<string, unknown>): Promise<T | null> => {
  const tauri = window.__TAURI__?.core;
  if (!tauri) {
    return null;
  }
  return tauri.invoke<T>(command, payload);
};

export interface NativeFileSelection {
  path: string;
  name: string;
  size: number;
}

export const tauriCommands = {
  async openFileDialog(): Promise<NativeFileSelection | null> {
    return invoke<NativeFileSelection>("dialog_open_file");
  },
  async saveFileDialog(defaultName: string): Promise<{ path: string } | null> {
    return invoke<{ path: string }>("dialog_save_file", { defaultName });
  },
  async notify(title: string, body: string): Promise<void> {
    await invoke<void>("notify_os", { title, body });
  },
  async updateTray(taskCount: number): Promise<void> {
    await invoke<void>("update_tray", { taskCount });
  },
  async readFileBytes(path: string): Promise<{ bytes: number[] } | null> {
    return invoke<{ bytes: number[] }>("read_file_bytes", { path });
  }
};

