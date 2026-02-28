#[tauri::command]
pub async fn update_tray(task_count: u32) -> Result<(), String> {
    let _ = task_count;
    Ok(())
}

