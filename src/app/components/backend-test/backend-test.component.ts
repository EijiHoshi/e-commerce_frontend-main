import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BackendTestService } from '../../services/backend-test.service';

@Component({
  selector: 'app-backend-test',
  template: `
    <ion-content>
      <ion-header>
        <ion-toolbar>
          <ion-title>Backend Connection Test</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Test Koneksi Backend Laravel</ion-card-title>
            <ion-card-subtitle>Testing connection to: {{ backendUrl }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-button (click)="testBackendConnection()" expand="block">
              Test Koneksi Backend
            </ion-button>
            
            <ion-button (click)="testLoginEndpoint()" expand="block" color="secondary">
              Test Login Endpoint
            </ion-button>
            
            <ion-button (click)="testDatabaseConnection()" expand="block" color="tertiary">
              Test Database Connection
            </ion-button>

            <ion-button (click)="testProductsEndpoint()" expand="block" color="success">
              Test Products API
            </ion-button>

            <ion-button (click)="testCategoriesEndpoint()" expand="block" color="warning">
              Test Categories API
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-card *ngIf="testResults">
          <ion-card-header>
            <ion-card-title color="success">Hasil Test Berhasil</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <pre>{{ testResults | json }}</pre>
          </ion-card-content>
        </ion-card>

        <ion-card *ngIf="errorMessage">
          <ion-card-header>
            <ion-card-title color="danger">Error</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>{{ errorMessage }}</p>
            <ion-button (click)="showTroubleshooting()" expand="block" color="medium">
              Lihat Troubleshooting
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-card *ngIf="showTroubleshootingGuide">
          <ion-card-header>
            <ion-card-title>Troubleshooting Guide</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <h3>Langkah-langkah Perbaikan:</h3>
            <ol>
              <li>Pastikan backend Laravel berjalan di <code>http://efablisi.site/api</code></li>
              <li>Jalankan perintah: <code>php artisan serve</code></li>
              <li>Pastikan database MySQL berjalan</li>
              <li>Periksa file <code>.env</code> di backend Laravel</li>
              <li>Clear cache Laravel: <code>php artisan config:clear</code></li>
              <li>Periksa CORS configuration di backend</li>
            </ol>
          </ion-card-content>
        </ion-card>
      </ion-content>
    </ion-content>
  `,
  styles: [`
    pre {
      background: #f4f4f4;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    code {
      background: #e0e0e0;
      padding: 2px 4px;
      border-radius: 3px;
    }
  `],
  imports: [CommonModule, IonicModule],
  standalone: true
})
export class BackendTestComponent implements OnInit {

  testResults: any = null;
  errorMessage: string = '';
  showTroubleshootingGuide = false;
  backendUrl: string = '';

  constructor(private backendTest: BackendTestService) { }

  ngOnInit() {
    this.backendTest.logEnvironmentConfig();
    this.backendUrl = 'https://efabli.site/api';
  }

  testBackendConnection() {
    this.clearResults();
    this.backendTest.testBackendConnection().subscribe(
      response => {
        this.testResults = { type: 'Backend Connection', success: true, data: response };
        console.log('Backend connection successful:', response);
      },
      error => {
        this.errorMessage = `Backend connection failed: ${error.message}`;
        console.error('Backend connection error:', error);
      }
    );
  }

  testLoginEndpoint() {
    this.clearResults();
    this.backendTest.testLoginEndpoint().subscribe(
      response => {
        this.testResults = { type: 'Login Endpoint', success: true, data: response };
        console.log('Login endpoint successful:', response);
      },
      error => {
        this.errorMessage = `Login endpoint failed: ${error.message}`;
        console.error('Login endpoint error:', error);
      }
    );
  }

  testDatabaseConnection() {
    this.clearResults();
    this.backendTest.testDatabaseConnection().subscribe(
      response => {
        this.testResults = { type: 'Database Connection', success: true, data: response };
        console.log('Database connection successful:', response);
      },
      error => {
        this.errorMessage = `Database connection failed: ${error.message}`;
        console.error('Database connection error:', error);
      }
    );
  }

  testProductsEndpoint() {
    this.clearResults();
    this.backendTest.testProductsEndpoint().subscribe(
      response => {
        this.testResults = { type: 'Products API', success: true, data: response };
        console.log('Products API successful:', response);
      },
      error => {
        this.errorMessage = `Products API failed: ${error.message}`;
        console.error('Products API error:', error);
      }
    );
  }

  testCategoriesEndpoint() {
    this.clearResults();
    this.backendTest.testCategoriesEndpoint().subscribe(
      response => {
        this.testResults = { type: 'Categories API', success: true, data: response };
        console.log('Categories API successful:', response);
      },
      error => {
        this.errorMessage = `Categories API failed: ${error.message}`;
        console.error('Categories API error:', error);
      }
    );
  }

  showTroubleshooting() {
    this.showTroubleshootingGuide = !this.showTroubleshootingGuide;
  }

  private clearResults() {
    this.testResults = null;
    this.errorMessage = '';
    this.showTroubleshootingGuide = false;
  }
} 