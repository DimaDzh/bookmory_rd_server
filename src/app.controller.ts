import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthCheckResponseDto } from './common/dto/health-check.dto';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Health check endpoint',
    description:
      'Returns a simple greeting message to verify the API is running',
  })
  @ApiResponse({
    status: 200,
    description: 'API is running successfully',
    type: HealthCheckResponseDto,
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
