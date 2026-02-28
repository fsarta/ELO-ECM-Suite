use serde::Serialize;

#[derive(Serialize)]
pub struct FileSelection {
    pub path: String,
    pub name: String,
    pub size: u64,
}

#[tauri::command]
pub async fn dialog_open_file(filters: Option<Vec<String>>) -> Option<FileSelection> {
    let _ = filters;
    None
}

#[derive(Serialize)]
pub struct SaveSelection {
    pub path: String,
}

#[tauri::command]
pub async fn dialog_save_file(default_name: Option<String>) -> Option<SaveSelection> {
    let _ = default_name;
    None
}
