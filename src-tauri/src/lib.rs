use app_state::AppState;
use message::{read_messages, save_message};
use tauri::Manager;
use thiserror::Error;

mod app_state;
pub mod message;

#[derive(Error, Debug)]
pub enum ChattdError {
    #[error("Database Error: `{0}`")]
    DatabaseError(String),
}

pub type ChattdRresult<T> = Result<T, ChattdError>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() -> ChattdRresult<()> {
    let app_state = AppState::new().await?;

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![save_message, read_messages])
        .setup(|app| {
            app.manage(app_state);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
