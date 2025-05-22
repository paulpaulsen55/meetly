import { isTauri } from "@tauri-apps/api/core"

// Extend the Window interface to include __TAURI__
declare global {
    interface Window {
        __TAURI__?: any;
    }
}

import {
    isPermissionGranted,
    requestPermission,
    sendNotification,
} from '@tauri-apps/plugin-notification';

const messages = [
    "Keep shining, superstar!",
    "You're awesome—don't forget it!",
    "Keep going, you're killing it!",
    "Smile, you're amazing!",
    "Stay positive and keep laughing!",
    "You're doing great—rock on!",
];

async function sendRandomEncouragingMessage() {
    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
    }

    if (permissionGranted) {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        sendNotification({ title: 'Tauri', body: randomMessage });
        console.log(`Notification sent: ${randomMessage}`);
    }
}

export async function startMessages() {
    if (!window.__TAURI__) {
        console.log("Not running in Tauri, skipping notification setup.");
        return;
    }

    sendRandomEncouragingMessage();

    setInterval(() => {
        sendRandomEncouragingMessage();
    }, 20000);
}