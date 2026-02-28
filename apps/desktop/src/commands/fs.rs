use serde::Serialize;

#[derive(Serialize)]
pub struct BytesResult {
    pub bytes: Vec<u8>,
}

#[tauri::command]
pub async fn read_file_bytes(path: String) -> Result<BytesResult, String> {
    if path.trim().is_empty() {
        return Err("path cannot be empty".to_string());
    }
    let bytes = std::fs::read(path).map_err(|error| error.to_string())?;
    Ok(BytesResult { bytes })
}
