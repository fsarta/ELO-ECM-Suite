mod commands;

use commands::dialog::{dialog_open_file, dialog_save_file};
use commands::fs::read_file_bytes;
use commands::notify::notify_os;
use commands::sidecar::start_sidecars;
use commands::tray::update_tray;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(error) = start_sidecars() {
        eprintln!("sidecar bootstrap failed: {error}");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            dialog_open_file,
            dialog_save_file,
            notify_os,
            update_tray,
            read_file_bytes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}
