import React from "react";
import { Switch } from "@mantine/core";

interface ButProps {
	isOn: boolean;
	toggleSwitch: () => void;
}

const But: React.FC<ButProps> = ({ isOn, toggleSwitch }) => {
	return (
		<div className="flex items-center justify-center p-2">
			<Switch
				checked={isOn}
				onChange={toggleSwitch}
				size="lg"
				color="blue"
				label={isOn ? "Extension Enabled" : "Extension Paused"}
				aria-label="Toggle AI Clipboard extension on or off"
			/>
		</div>
	);
};

export default But;
