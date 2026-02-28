#[tauri::command]
pub async fn notify_os(title: String, body: String, icon: Option<String>) -> Result<(), String> {
    let _ = (title, body, icon);
    Ok(())
}

