// Helper function to map error codes to user-friendly messages
export function getErrorMessage(error: string | undefined): string {
	if (!error) return "";

	switch (error) {
		case "API_ERROR":
			return "Unable to process request. Check connection or quota.";
		case "SERVER_ERROR":
			return "AI service is busy — retrying usually fixes it.";
		case "INPUT_TOO_LONG":
			return "Text too long — trimmed it for you.";
		case "LIMIT_REACHED":
			return "Usage limit reached. Please wait for the reset.";
		case "DISABLED":
			return "Extension is paused. Turn it on from the popup.";
		case "INVALID_INPUT":
			return "Please enter a message.";
		default:
			return error;
	}
}