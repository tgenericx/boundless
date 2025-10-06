import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'AtLeastOneField', async: false })
export class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const [fields] = args.constraints as [string[]];
    const instance = args.object as Record<string, unknown>;
    return fields.some((field) => !!instance[field]);
  }

  defaultMessage(args: ValidationArguments): string {
    const [fields] = args.constraints as [string[]];
    return `Provide at least one of: ${fields.join(', ')}`;
  }
}

export function AtLeastOneField<T>(
  fields: (keyof T)[],
  validationOptions?: ValidationOptions,
): ClassDecorator {
  const decorator: ClassDecorator = (target) => {
    registerDecorator({
      name: 'AtLeastOneField',
      target,
      propertyName: undefined as unknown as string,
      constraints: [fields],
      options: validationOptions,
      validator: AtLeastOneFieldConstraint,
    });
  };

  return decorator;
}
