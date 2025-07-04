import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// Tambahkan ini untuk mendukung locale Indonesia
import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';
registerLocaleData(localeId, 'id-ID');

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
