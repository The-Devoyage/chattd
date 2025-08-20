use anyhow::anyhow;
use async_openai::types::{
    ChatCompletionRequestAssistantMessageArgs, ChatCompletionRequestMessage,
    ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs,
    CreateChatCompletionRequestArgs,
};
use deeb::*;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, State};

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

    let mut messages: Vec<ChatCompletionRequestMessage> = history
        .iter()
        .map(|m| match m.role {
            MessageRole::User => Ok(ChatCompletionRequestUserMessageArgs::default()
                .content(m.text.clone())
                .build()
                .map_err(|_| anyhow!("Failed to construct user message: {}", m.text))?
                .into()),
            MessageRole::Bot => Ok(ChatCompletionRequestAssistantMessageArgs::default()
                .content(m.text.clone())
                .build()
                .map_err(|_| anyhow!("Failed to construct assistant message: {}", m.text))?
                .into()),
        })
        .collect::<Result<Vec<_>, anyhow::Error>>()?;

    let system_prompt = ChatCompletionRequestSystemMessageArgs::default()
        .content(
            r#"
    You are the AI behind the `chattd` application. Assist the user by answering their questions. 
    ## How to respond:
    1. Respond in markdown.
    2. Respond in short concise answers unless asked otherwise.
    3. Always format code with syntax hints - example: ```js let a = "abcd"; ```
    "#,
        )
        .build()
        .map_err(|_| anyhow!("Failed to create system prompt."))?
        .into();

    messages.push(system_prompt);

    let request = CreateChatCompletionRequestArgs::default()
        .model("gpt-5-mini")
        .messages(messages)
        .build()
        .map_err(|_| anyhow!("Failed to construct chat completion request args."))?;

    let response = app_state
        .open_ai
        .chat()
        .create(request)
        .await
        .map_err(|_| anyhow!("Failed to call the OpenAI API."))?;

    let text_res = response
        .choices
        .get(0)
        .map(|c| c.message.content.clone())
        .unwrap_or_else(|| Some("No Response".to_string()));

    let bot_msg = CreateMessageInput {
        text: text_res.unwrap(),
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
    favorites: Option<bool>,
) -> tauri::Result<Vec<Message>> {
    let query = if favorites.unwrap_or(false) {
        Query::eq("favorite", true)
    } else {
        Query::All
    };
    let mut messages = Message::find_many(
        &app_state.db,
        query,
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
