# Meetly

Your personalized AI-Agent

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## n8n selfhosted Docker Setup
[Docker](https://docs.docker.com/get-docker/)

```shell
docker volume create n8n_data

docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```
Workflow active schalten

### API-Keys
- [Gemini](https://aistudio.google.com/app/apikey)
- [OpenAI](enis)