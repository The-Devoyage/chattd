// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chattd_lib::ChattdRresult;

#[tokio::main]
async fn main() -> ChattdRresult<()> {
    chattd_lib::run().await?;

    Ok(())
}
