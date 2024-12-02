export interface AdvancedConfigurationPanelProps {
  onSave: (config: AdvancedConfiguration) => void;
  initialConfig: AdvancedConfiguration;
  children?: React.ReactNode;
} 