use deeb::*;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::app_state::AppState;

#[derive(Serialize, Deserialize)]
pub enum MessageRole {
    User,
    Bot,
}

#[derive(Serialize, Deserialize, Collection)]
pub struct Message {
    _id: String,
    text: String,
    role: MessageRole,
}

#[derive(Serialize, Deserialize)]
pub struct CreateMessageInput {
    text: String,
    role: MessageRole,
}

#[tauri::command]
pub async fn save_message(
    app_state: State<'_, AppState>,
    message: CreateMessageInput,
) -> tauri::Result<Message> {
    println!("SAVING MESSAGE");
    Ok(Message::insert_one::<CreateMessageInput>(&app_state.db, message, None).await?)
}

#[tauri::command]
pub async fn read_messages(
    app_state: State<'_, AppState>,
    skip: Option<i32>,
    limit: Option<i32>,
) -> tauri::Result<Vec<Message>> {
    println!("READING MESSAGES");
    Ok(Message::find_many(
        &app_state.db,
        Query::All,
        Some(FindManyOptions {
            skip: Some(skip.unwrap_or(0)),
            limit: Some(limit.unwrap_or(20)),
            order: None,
        }),
        None,
    )
    .await?
    .unwrap_or(vec![]))
}
