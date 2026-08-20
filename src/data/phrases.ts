import { LoversPhrase } from '../types';
import { LOVERS_PHRASES_BASE } from './phrases_base';
import { LOVERS_PHRASES_EXTRA } from './phrases_extra';

export const LOVERS_PHRASES: LoversPhrase[] = [
  ...LOVERS_PHRASES_BASE,
  ...LOVERS_PHRASES_EXTRA
];
