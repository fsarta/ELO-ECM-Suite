use tauri_plugin_notification::NotificationExt;

#[tauri::command]
pub async fn notify_os(
    app: tauri::AppHandle,
    title: String,
    body: String,
    icon: Option<String>,
) -> Result<(), String> {
    let _ = icon;
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|error| error.to_string())
}
