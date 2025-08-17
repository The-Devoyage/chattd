use std::fs;
use std::path::PathBuf;

use async_openai::{config::OpenAIConfig, Client};
use deeb::Deeb;

use crate::{message::Message, ChattdError, ChattdRresult};

pub struct AppState {
    pub db: Deeb,
    pub open_ai: Client<OpenAIConfig>,
}

impl AppState {
    pub async fn new() -> ChattdRresult<Self> {
        // Init Deeb
        let db = Deeb::new();

        let mut db_path: PathBuf = dirs::home_dir()
            .ok_or_else(|| ChattdError::DatabaseError("Could not find home dir".into()))?;
        db_path.push(".chattd");

        fs::create_dir_all(&db_path)
            .map_err(|e| ChattdError::DatabaseError(format!("Failed to create dir: {}", e)))?;

        db_path.push("db.json");

        db.add_instance(
            "chattd",
            &db_path.to_string_lossy(),
            vec![Message::entity()],
        )
        .await
        .map_err(|e| {
            println!("Failed to add instance: {}", e);
            ChattdError::DatabaseError("Failed to add instance.".to_string())
        })?;

        // Init OpenAI Client
        let open_ai = Client::new();

        Ok(AppState { db, open_ai })
    }
}
