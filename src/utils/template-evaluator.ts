import type { SuggestionNode, EvaluationOptions, ExpressionContext } from '../types';
import { resolvePath } from './path-resolver';

/**
 * Evaluates a template string, replacing {{...}} placeholders with values from a data object.
 */
export function evaluateTemplateString(
  templateString: string,
  data: SuggestionNode,
  options: EvaluationOptions = {}
): string {
  const { defaultValue = '[Not Found]', throwOnError = false } = options;

  if (!templateString) return templateString;

  const regex = /{{\s*([\w\.]+)\s*}}/g;

  return templateString.replace(regex, (match, path) => {
    try {
      const value = resolvePath(path, data);

      if (value === undefined || value === null) {
        if (throwOnError) {
          throw new Error(`Path not found: ${path}`);
        }
        return defaultValue;
      }

      if (Array.isArray(value) || typeof value === 'object') {
        return JSON.stringify(value);
      }

      return String(value);
    } catch (error) {
      if (throwOnError) {
        throw error;
      }
      console.warn(`Failed to resolve path: ${path}`, error);
      return defaultValue;
    }
  });
}

/**
 * Safe expression evaluator for complex expressions
 */
export class ExpressionEvaluator {
  /**
   * Evaluate a template expression with context
   */
  static evaluate(
    expression: string,
    context: ExpressionContext,
    defaultValue: any = null
  ): any {
    if (!expression || typeof expression !== 'string') {
      return expression;
    }

    // Simple template variable replacement
    const regex = /{{\s*([\w\.]+)\s*}}/g;
    
    return expression.replace(regex, (match, path) => {
      const value = this.resolvePath(path, context);
      
      if (value === undefined || value === null) {
        return defaultValue ?? match;
      }

      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      return String(value);
    });
  }

  /**
   * Resolve a dot-notation path in the context
   */
  private static resolvePath(path: string, context: ExpressionContext): any {
    const parts = path.split('.');
    let current: any = context;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Batch evaluate multiple properties
   */
  static evaluateProperties(
    properties: Record<string, any>,
    context: ExpressionContext
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (typeof value === 'string') {
        result[key] = this.evaluate(value, context, value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.evaluateProperties(value, context);
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}
