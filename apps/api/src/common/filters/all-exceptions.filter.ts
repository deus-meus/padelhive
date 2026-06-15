import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    const { method, originalUrl } = request;

    let status: number;
    let message: string | string[] | object;
    let errorName: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorName = exception.name;
      } else {
        const obj = exceptionResponse as Record<string, unknown>;
        message = (obj.message as string | string[] | object) || exception.message;
        errorName = (obj.error as string) || exception.name;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorName = 'Internal Server Error';
    }

    if (status >= 500) {
      this.logger.error(
        `${method} ${originalUrl} ${status} - ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      const msgString = typeof message === 'object' ? JSON.stringify(message) : message;
      this.logger.warn(`${method} ${originalUrl} ${status} - ${msgString}`);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: originalUrl,
    });
  }
}
