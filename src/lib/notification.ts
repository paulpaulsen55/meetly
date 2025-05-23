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

function getRandomMessage(): string {
    return messages[Math.floor(Math.random() * messages.length)];
}

async function sendTauriNotification(): Promise<void> {
    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === "granted";
    }

    if (permissionGranted) {
        const randomMessage = getRandomMessage();
        sendNotification({ title: "Get back on mettly", body: randomMessage });
    }
}

async function sendWebNotification(): Promise<void> {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("Permission not granted for notifications.");
            return;
        }
    }
    const randomMessage = getRandomMessage();
    new Notification("Get back on mettly", { body: randomMessage });
}

// Starts sending notifications at a set interval based on the environment
export async function startMessages(): Promise<void> {
    if (window.__TAURI__) {
        sendTauriNotification();
        setInterval(sendTauriNotification, 20000);
    } else if ("Notification" in window) {
        sendWebNotification();
        setInterval(sendWebNotification, 20000);
    } else {
        console.log("Notifications are not supported in this environment.");
    }
}