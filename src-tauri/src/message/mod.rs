use anyhow::anyhow;
use deeb::*;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, State};
use tauri_plugin_http::reqwest;

use crate::app_state::AppState;

#[derive(Clone, Serialize, Deserialize)]
pub enum MessageRole {
    User,
    Bot,
}

#[derive(Serialize, Deserialize, Collection)]
pub struct Message {
    _id: String,
    text: String,
    role: MessageRole,
    _created_at: String,
    favorite: Option<bool>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct CreateMessageInput {
    text: String,
    role: MessageRole,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct UpdateMessageInput {
    favorite: bool,
}

#[derive(Serialize, Deserialize, Debug)]
struct ChatGptRequest {
    model: String,
    messages: Vec<ChatGptMessage>,
}

#[derive(Serialize, Deserialize, Debug)]
struct ChatGptMessage {
    role: String,
    content: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct ChatGptResponse {
    choices: Vec<Choice>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Choice {
    message: ChatGptMessage,
}

#[tauri::command]
pub async fn save_message(
    app_handle: tauri::AppHandle,
    app_state: State<'_, AppState>,
    message: CreateMessageInput,
) -> tauri::Result<Message> {
    // Save user message first
    let saved_msg =
        Message::insert_one::<CreateMessageInput>(&app_state.db, message.clone(), None).await?;
    app_handle.emit("message_created", &saved_msg).unwrap();

    // ---- 1️⃣ Get last N messages from DB for context ----
    let mut history = Message::find_many(
        &app_state.db,
        Query::All,
        Some(FindManyOptions {
            skip: Some(0),
            limit: Some(20), // last 20 messages
            order: vec![FindManyOrder {
                property: "_created_at".to_string(),
                direction: OrderDirection::Descending,
            }]
            .into(),
        }),
        None,
    )
    .await?
    .unwrap_or_default();

    // Put them in chronological order
    history.reverse();

    // ---- 2️⃣ Convert DB messages into OpenAI messages ----
    let chat_messages: Vec<ChatGptMessage> = history
        .iter()
        .map(|m| ChatGptMessage {
            role: match m.role {
                MessageRole::User => "user".to_string(),
                MessageRole::Bot => "assistant".to_string(),
            },
            content: m.text.clone(),
        })
        .collect();

    // ---- 3️⃣ Call OpenAI with full history ----
    let client = reqwest::Client::new();
    let req_body = ChatGptRequest {
        model: "gpt-5-mini".into(),
        messages: chat_messages,
    };

    let resp = client
        .post("https://api.openai.com/v1/chat/completions")
        .bearer_auth(std::env::var("OPENAI_API_KEY").expect("OPENAI_API_KEY not set"))
        .json(&req_body)
        .send()
        .await
        .map_err(|_| anyhow!("Failed to post to OpenAI."))?;

    let parsed: ChatGptResponse = resp
        .json()
        .await
        .map_err(|_| anyhow!("Failed to parse JSON."))?;

    let bot_text = parsed
        .choices
        .get(0)
        .map(|c| c.message.content.clone())
        .unwrap_or_else(|| "No response".into());

    // ---- 4️⃣ Save bot response to DB ----
    let bot_msg = CreateMessageInput {
        text: bot_text.clone(),
        role: MessageRole::Bot,
    };
    let saved_bot_msg =
        Message::insert_one::<CreateMessageInput>(&app_state.db, bot_msg, None).await?;
    app_handle.emit("message_created", &saved_bot_msg).unwrap();

    Ok(saved_msg)
}

#[tauri::command]
pub async fn update_message(
    app_handle: tauri::AppHandle,
    app_state: State<'_, AppState>,
    message_id: String,
    favorite: bool,
) -> tauri::Result<Message> {
    let message = Message::update_one::<UpdateMessageInput>(
        &app_state.db,
        Query::eq("_id", message_id),
        UpdateMessageInput { favorite },
        None,
    )
    .await?;

    if message.is_none() {
        return Err(tauri::Error::Anyhow(anyhow!("Failed to update message.")));
    }

    app_handle.emit("message_updated", &message).unwrap();

    Ok(message.unwrap())
}

#[tauri::command]
pub async fn read_messages(
    app_state: State<'_, AppState>,
    skip: Option<i32>,
    limit: Option<i32>,
) -> tauri::Result<Vec<Message>> {
    let mut messages = Message::find_many(
        &app_state.db,
        Query::All,
        Some(FindManyOptions {
            skip: Some(skip.unwrap_or(0)),
            limit: Some(limit.unwrap_or(20)),
            order: vec![FindManyOrder {
                property: "_created_at".to_string(),
                direction: OrderDirection::Descending,
            }]
            .into(),
        }),
        None,
    )
    .await?
    .unwrap_or(vec![]);
    messages.reverse();
    Ok(messages)
}
