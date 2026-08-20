export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink-primary py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-ink-primary mb-6">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
          <p className="text-ink-secondary">
            Last updated: August 20, 2026
          </p>
          
          <h2 className="text-2xl font-semibold text-ink-primary mt-8 mb-4">Overview</h2>
          <p className="text-ink-secondary">
            AI Clipboard respects your privacy and is designed with privacy by default. This extension does not collect, transmit, or store any personal information without your explicit consent.
          </p>

          <h2 className="text-2xl font-semibold text-ink-primary mt-8 mb-4">Data Collection</h2>
          <p className="text-ink-secondary">
            <strong>Zero Background Surveillance.</strong> AI Clipboard only activates when you select text or trigger an explicit action. It never monitors, logs, or captures unselected browsing activity.
          </p>

          <h2 className="text-2xl font-semibold text-ink-primary mt-8 mb-4">Local Storage</h2>
          <p className="text-ink-secondary">
            <strong>Local Key Isolation.</strong> If you choose to provide your own OpenAI or Anthropic API key, it is stored strictly in your browser&#x27;s local storage (chrome.storage.local). This key never leaves your device.
          </p>

          <h2 className="text-2xl font-semibold text-ink-primary mt-8 mb-4">Free Tier</h2>
          <p className="text-ink-secondary">
            <strong>No Training on Your Data.</strong> Free-tier queries are processed ephemerally through Cloudflare Workers AI. All request data is discarded immediately after inference. No training data is retained.
          </p>

          <h2 className="text-2xl font-semibold text-ink-primary mt-8 mb-4">Third-Party Services</h2>
          <p className="text-ink-secondary">
            The extension may use Cloudflare Workers AI for inference processing. Cloudflare&#x27;s privacy policy applies to any data processed through their service.
          </p>

          <h2 className="text-2xl font-semibold text-ink-primary mt-8 mb-4">Your Rights</h2>
          <p className="text-ink-secondary">
            You can clear all stored data (including API keys) from the extension&#x27;s settings page. You can also uninstall the extension at any time to stop all data processing.
          </p>

          <h2 className="text-2xl font-semibold text-ink-primary mt-8 mb-4">Changes to This Policy</h2>
          <p className="text-ink-secondary">
            We may update this privacy policy from time to time. Any changes will be reflected on this page with an updated revision date.
          </p>
        </div>
      </div>
    </div>
  );
}