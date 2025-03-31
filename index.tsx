import { definePlugin, settings } from "vencord";
import { findByProps } from "vencord/webpack";
import React, { useState } from "react";

const StereoVoiceUI: React.FC = () => {
    const [balance, setBalance] = useState(settings.get("stereoBalance", 0));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setBalance(value);
        settings.set("stereoBalance", value);
    };

    return (
        <div style={{ padding: "10px", background: "#282c34", color: "white", borderRadius: "5px" }}>
            <h2>Stereo Voice Plugin</h2>
            <p>Adjust the balance of the voice between left and right channels.</p>
            <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={balance}
                onChange={handleChange}
                style={{ width: "100%" }}
            />
            <p>Balance: {balance}</p>
        </div>
    );
};

export default definePlugin({
    name: "StereoVoice",
    description: "Allows control over stereo voice balance.",
    authors: [{ name: "YourName" }],
    version: "1.0.0",
    settingsPanel: () => <StereoVoiceUI />, // UI for settings
    async start() {
        const WebRTC = findByProps("setTransportOptions");
        if (!WebRTC) return console.error("Failed to find WebRTC module");

        const original = WebRTC.setTransportOptions;
        WebRTC.setTransportOptions = function (options) {
            if (options.audioEncoder) {
                options.audioEncoder.params = options.audioEncoder.params || {};
                options.audioEncoder.params.stereo = 1;
                options.audioEncoder.params.balance = settings.get("stereoBalance", 0); // Use saved balance value
            }
            return original.apply(this, arguments);
        };
    },
    stop() {
        location.reload(); // Reload to reset audio settings
    }
});