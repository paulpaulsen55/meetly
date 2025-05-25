![banner](./static/banner.png)
# Meetly
Meetly is a personal AI agent that reminds you of your meetings and provides a summary of the meeting content. It is built using SvelteKit and Tauri for the frontend, and n8n for the backend workflow automation. The app is designed to run on Android devices, but it can also be run on desktop platforms using Tauri or the web version. The app uses the OpenAI Whisper API for transcription and the Gemini Chat Model for summarization.

## Prerequisites
- [Node.js](https://nodejs.org/en/download/) (LTS version)
- [Docker](https://docs.docker.com/get-docker/) (for n8n)

## Recommended IDE Setup
[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## Getting Started
The application uses Sveltekit and follows the standard Sveltekit project structure. The main entry point is `src/routes/+page.svelte`, and the main layout is in `src/routes/+layout.svelte`. Please refer to the [SvelteKit documentation](https://kit.svelte.dev/docs/introduction) for more information on how to work with SvelteKit.

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

## Tauri Android
For Android, a presigned APK is available for quick testing. However, if you prefer to build and sign your own APK, please follow the detailed instructions below.

### Prerequisites
Please install all the necessary [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) to set up Tauri and configure the [Android SDK](https://v2.tauri.app/start/prerequisites/#android) as described in the Tauri documentation. 

### Start a Android-Emulator in development mode
```shell
npm run tauri android dev
```

### Build for Android
```shell
npm run tauri android build
```
After building, you can find the APK in the `\src-tauri\gen\android\app\build\outputs\apk\universal\release\` directory.

Before installing the APK on your Android device, make sure to enable "Install from unknown sources" in the device settings and sign the APK with your own keystore (follow [this guide](https://randombits.dev/articles/android/signing-with-cmd)).


## Further Development
- add more Agents to the app