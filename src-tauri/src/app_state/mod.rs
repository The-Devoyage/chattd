use deeb::Deeb;

use crate::{message::Message, ChattdError, ChattdRresult};

pub struct AppState {
    pub db: Deeb,
}

impl AppState {
    pub async fn new() -> ChattdRresult<Self> {
        let db = Deeb::new();
        db.add_instance("chattd", "../db/chattd.json", vec![Message::entity()])
            .await
            .map_err(|_| ChattdError::DatabaseError("Failed to add instance.".to_string()))?;
        Ok(AppState { db })
    }
}
