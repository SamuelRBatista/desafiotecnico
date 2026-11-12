import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): string {
    return 'Medical Orders API is running.';
  }

  getApplicationHealth(): { status: string } {
    return { status: 'ok' };
  }
}
