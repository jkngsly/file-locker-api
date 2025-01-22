import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse = exception.getResponse
            ? exception.getResponse()
            : { message: exception.message };

        response.status(status).json({
            message: 'An error occurred',
            data: null,
            statusCode: status,
            errors: Array.isArray(errorResponse?.message)
                ? errorResponse.message
                : [errorResponse.message || 'Unknown error'],
            errorMessage: exception.message || 'An unexpected error occurred',
        });
    }
}
