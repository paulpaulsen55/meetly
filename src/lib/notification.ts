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


if (window.__TAURI__ && typeof Notification === "undefined") {
    // Polyfill Notification for Tauri, to prevent errors when Tauri code accesses Notification.
    window.Notification = class {
        title: string;
        options?: NotificationOptions;
        constructor(title: string, options?: NotificationOptions) {
            this.title = title;
            this.options = options;
            // You can call Tauri's sendNotification if needed here.
            sendNotification({ title, body: options?.body });
        }
        static permission = "granted";
        static requestPermission(): Promise<string> {
            // In Tauri, assume permission is granted.
            return Promise.resolve("granted");
        }
    }
}


const messageInterval = 20000; // 20 seconds
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
    const randomMessage = getRandomMessage();
    sendNotification({ title: "Get back on mettly", body: randomMessage });
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
        alert("moin")
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = (permission === "granted");
        }
        alert(permissionGranted ? "Tauri notifications are enabled" : "Tauri notifications are not enabled");
        if (permissionGranted) {
            alert("Tauri is running, sending notifications every 20 seconds");
            sendTauriNotification();
            setInterval(sendTauriNotification, messageInterval);
        }
    } else if ("Notification" in window) {
        sendWebNotification();
        setInterval(sendWebNotification, messageInterval);
    } else {
        alert("Notifications are not supported in this environment.");
    }
}