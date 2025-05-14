export interface FormProps {
  label: string;
  required: boolean;
  choices: string[];
  displayAlpha: boolean;
  default: string;
}

export interface FormValidation {
  hasNoLabel: boolean;
  hasDuplicates: boolean;
  hasTooLong: boolean;
  hasTooMany: boolean;
}
