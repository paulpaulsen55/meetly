![banner](./static/banner.png)
# Meetly
Dein smarter persönlicher AI-Agent.

## Prerequisites
- [Node.js](https://nodejs.org/en/download/) (LTS version)
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri)
- [Docker](https://docs.docker.com/get-docker/) (for n8n selfhosted)

## Recommended IDE Setup
[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## Getting Started
<!-- explain the structure of the application -->

### n8n selfhosted Docker Setup
1. Setup and run n8n in a Docker container:
    ```shell
    docker volume create n8n_data
    docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
    ```
2. After accessing the [n8n UI](https://localhost:5678), you need to set up a local account.
3. Create a new workflow and import the [meetly workflow](./meetly-n8n.json) file.
    ![where to find the import button](./static/n8n_import.png)
4. Set up the credentials for the "OpenAI Whisper" and "Google Gemini Chat Model" Nodes in the workflow:
   - OpenAI API Key:
   - Gemini API Key:
5. Activate the workflow by clicking on the "Activate" button in the top right corner of the n8n UI.

### Install dependencies
```shell
npm install
```

### Run the app
```shell
npm run dev
```
