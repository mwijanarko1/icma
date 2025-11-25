export interface SettingsDropdownProps {
  onClearCache: () => void;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  onOpenApiKeyModal: () => void;
}

export interface ApiKeyModalProps {
  apiKey: string;
  showApiKeyModal: boolean;
  onSave: (apiKey: string) => void;
  onClose: () => void;
}

