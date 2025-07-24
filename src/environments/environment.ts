// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  // API URL - gunakan domain backend Laravel production
  apiUrl: 'https://efabli.site/api',
  // Image Base URL - untuk akses gambar dari backend production
  imageBaseUrl: 'https://efabli.site',
  // Backend configuration untuk production
  backend: {
    url: 'https://efabli.site',
    apiUrl: 'https://efabli.site/api',
    database: {
      connection: 'mysql',
      host: 'efabli.site',
      port: 3306,
      database: 'efablisi_e-commerce',
      username: 'efablisi_efablisi'
    }
  },
  firebase: {
    apiKey: "AIzaSyB8Iu_m3oybTEEipzD8hDlk8ZZ_9PHo2-4",
    authDomain: "efabli.firebaseapp.com",
    projectId: "efabli",
    storageBucket: "efabli.firebasestorage.app",
    messagingSenderId: "1047273745943",
    appId: "1:1047273745943:web:b89b9d2aefba525a383652",
    measurementId: "G-S7Q0DQ3EH0"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
