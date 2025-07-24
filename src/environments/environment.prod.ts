export const environment = {
  production: true,
  // API URL - sesuaikan dengan domain backend Laravel production
  apiUrl: 'https://efabli.site/api', // Production backend

  // Image Base URL - untuk akses gambar dari backend production
  imageBaseUrl: 'https://efabli.site', // Production backend

  // Backend configuration untuk production
  backend: {
    url: 'https://efabli.site',
    apiUrl: 'https://efabli.site/api',
    database: {
      connection: 'mysql',
      host: 'localhost',
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
