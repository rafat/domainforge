
import { DomaDomain as Domain } from '@/types/doma';

export type CustomizationProps = {
  primaryColor?: string,
  secondaryColor?: string,
  accentColor?: string,
  backgroundColor?: string,
  cardBackgroundColor?: string,
  fontFamily?: string,
  borderRadius?: string,
  buttonStyle?: string,
  layoutSpacing?: string,
  textAlign?: string
} | null;

export interface TemplateProps {
  domain: Domain;
  customization: CustomizationProps;
}
