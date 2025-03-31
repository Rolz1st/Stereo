import { definePlugin } from "vencord";
import { findModuleByProps } from "vencord/utils";
import React, { useState } from "react";

const StereoVoiceUI: React.FC<{ setBalance: (value: number) => void }> = ({ setBalance }) => {
    const [balance, setLocalBalance] = useState(0);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setLocalBalance(value);
        setBalance(value);
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
    settingsPanel: ({ setBalance }) => <StereoVoiceUI setBalance={setBalance} />, // Add UI for settings
    async start() {
        const WebRTC = findModuleByProps("setTransportOptions");
        if (!WebRTC) return console.error("Failed to find WebRTC module");

        let balance = 0; // Default center

        const updateBalance = (value: number) => {
            balance = value;
        };

        const original = WebRTC.setTransportOptions;
        WebRTC.setTransportOptions = function (options) {
            if (options.audioEncoder) {
                options.audioEncoder.params = options.audioEncoder.params || {};
                options.audioEncoder.params.stereo = 1;
                options.audioEncoder.params.balance = balance; // Adjust balance dynamically
            }
            return original.apply(this, arguments);
        };
    },
    stop() {
        location.reload(); // Reload to reset audio settings
    }
});
