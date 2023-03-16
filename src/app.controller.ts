import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('formFill')
  async executePuppeteer(): Promise<string> {
    // const data = await this.appService.execute();
    const data = await this.appService.execute();
    return '';
  //   return data;
  }

  @Post('newFormTest')
  async create(@Body() requestBody: any) {
    const result = await this.appService.executeData(requestBody);
    return result;
  }
}
