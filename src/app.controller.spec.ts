import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return a health check message', () => {
    expect(appController.getHealth()).toBe('Medical Orders API is running.');
  });

  it('should return an ok status payload', () => {
    expect(appController.getApplicationHealth()).toEqual({ status: 'ok' });
  });
});
