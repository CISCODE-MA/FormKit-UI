/**
 * StepConfig - Multi-step wizard configuration
 * Type Layer — contracts only, zero runtime logic
 */

import type { z } from 'zod';
import type { FieldConfig } from './FieldConfig';

/**
 * Configuration for a single step in a multi-step form wizard
 *
 * @example
 * ```typescript
 * const step: StepConfig = {
 *   title: 'Profile',
 *   description: 'Enter your personal information',
 *   schema: z.object({ name: z.string().min(2), email: z.string().email() }),
 *   fields: [
 *     { key: 'name', label: 'Full Name', type: FieldType.TEXT },
 *     { key: 'email', label: 'Email', type: FieldType.EMAIL },
 *   ],
 * };
 * ```
 */
export interface StepConfig {
  /** Step title displayed in stepper */
  readonly title: string;
  /** Zod schema for this step's fields (validated when user clicks Next) */
  readonly schema: z.ZodType;
  /** Field configurations for this step */
  readonly fields: FieldConfig[];
  /** Optional step description */
  readonly description?: string;
}
