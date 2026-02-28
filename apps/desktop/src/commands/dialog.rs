use serde::Serialize;

#[derive(Serialize)]
pub struct FileSelection {
    pub path: String,
    pub name: String,
    pub size: u64,
}

#[tauri::command]
pub async fn dialog_open_file() -> Option<FileSelection> {
    None
}

#[derive(Serialize)]
pub struct SaveSelection {
    pub path: String,
}

#[tauri::command]
pub async fn dialog_save_file() -> Option<SaveSelection> {
    None
}

