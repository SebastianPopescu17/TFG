import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';
import 'chartjs-adapter-date-fns';



bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
