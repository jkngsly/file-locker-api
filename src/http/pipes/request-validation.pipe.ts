import { BadRequestException, ValidationError, ValidationPipe } from "@nestjs/common";

const RequestValidationPipe = new ValidationPipe({
    whitelist: true, // Automatically strip properties not outlined in the DTO
    transform: true, // Automatically transform payload into the appropriate DTO's type,
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      const getPrettyClassValidatorErrors = (
        validationErrors: ValidationError[],
        parentProperty = '',
      ): Array<{ property: string; errors: string[] }> => {
        const errors = [];

        const getValidationErrorsRecursively = (
          validationErrors: ValidationError[],
          parentProperty = '',
        ) => {
          for (const error of validationErrors) {
            const propertyPath = parentProperty
              ? `${parentProperty}.${error.property}`
              : error.property;

            if (error.constraints) {
              errors.push({
                property: propertyPath,
                errors: Object.values(error.constraints),
              });
            }

            if (error.children?.length) {
              getValidationErrorsRecursively(error.children, propertyPath)
            }
          }
        };

        getValidationErrorsRecursively(validationErrors, parentProperty)

        return errors;
      };

      const errors = getPrettyClassValidatorErrors(validationErrors)

      return new BadRequestException({
        message: 'validation error',
        errors: errors,
      });
    }
  });

export default RequestValidationPipe;