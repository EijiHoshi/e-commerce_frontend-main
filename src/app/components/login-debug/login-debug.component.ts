import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoginDebugService } from '../../services/login-debug.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login-debug',
  template: `
    <ion-content>
      <ion-header>
        <ion-toolbar>
          <ion-title>Login Debug Tool</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Debug Login Issues</ion-card-title>
            <ion-card-subtitle>Testing connection and login endpoints</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-button (click)="testBackendConnection()" expand="block">
              Test Backend Connection
            </ion-button>
            
            <ion-button (click)="testLoginEndpoint()" expand="block" color="secondary">
              Test Login Endpoint
            </ion-button>
            
            <ion-button (click)="testSanctumEndpoint()" expand="block" color="tertiary">
              Test Sanctum CSRF
            </ion-button>

            <ion-button (click)="testUserEndpoint()" expand="block" color="success">
              Test User Endpoint
            </ion-button>

            <ion-button (click)="testWithDummyCredentials()" expand="block" color="warning">
              Test with Dummy Credentials
            </ion-button>

            <ion-button (click)="logAllInfo()" expand="block" color="medium">
              Log All Information
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-card *ngIf="testResults">
          <ion-card-header>
            <ion-card-title color="success">Test Results</ion-card-title>
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
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Environment Information</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p><strong>API URL:</strong> {{ environment.apiUrl }}</p>
            <p><strong>Backend URL:</strong> {{ environment.backend?.url }}</p>
            <p><strong>Production:</strong> {{ environment.production }}</p>
            <p><strong>Database:</strong> {{ environment.backend?.database?.database }}</p>
            <p><strong>Username:</strong> {{ environment.backend?.database?.username }}</p>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Troubleshooting Steps</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ol>
              <li><strong>Check Backend:</strong> Ensure Laravel server is running on port 8000</li>
              <li><strong>Check Database:</strong> Verify MySQL is running and accessible</li>
              <li><strong>Check CORS:</strong> Ensure Laravel CORS allows frontend origin</li>
              <li><strong>Check API Routes:</strong> Verify login endpoint exists in Laravel</li>
              <li><strong>Check Credentials:</strong> Verify user exists in database</li>
              <li><strong>Check Network:</strong> Ensure no firewall blocking requests</li>
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
  `],
  imports: [CommonModule, IonicModule],
  standalone: true
})
export class LoginDebugComponent implements OnInit {

  testResults: any = null;
  errorMessage: string = '';
  environment = environment;

  constructor(private loginDebug: LoginDebugService) { }

  ngOnInit() {
    this.logAllInfo();
  }

  testBackendConnection() {
    this.clearResults();
    this.loginDebug.testBackendConnection().subscribe(
      response => {
        this.testResults = { type: 'Backend Connection', success: true, data: response };
        console.log('✅ Backend connection test successful:', response);
      },
      error => {
        this.errorMessage = `❌ Backend connection failed: ${error.message}`;
        console.error('❌ Backend connection test failed:', error);
      }
    );
  }
  

  testLoginEndpoint() {
    this.clearResults();
    this.loginDebug.testLoginEndpoint('test@example.com', 'password123').subscribe(
      response => {
        this.testResults = { type: 'Login Endpoint', success: true, data: response };
        console.log('Login endpoint test successful:', response);
      },
      error => {
        this.errorMessage = `Login endpoint failed: ${error.message}`;
        console.error('Login endpoint test failed:', error);
      }
    );
  }

  testSanctumEndpoint() {
    this.clearResults();
    this.loginDebug.testSanctumEndpoint().subscribe(
      response => {
        this.testResults = { type: 'Sanctum CSRF', success: true, data: response };
        console.log('Sanctum endpoint test successful:', response);
      },
      error => {
        this.errorMessage = `Sanctum endpoint failed: ${error.message}`;
        console.error('Sanctum endpoint test failed:', error);
      }
    );
  }

  testUserEndpoint() {
    this.clearResults();
    this.loginDebug.testUserEndpoint().subscribe(
      response => {
        this.testResults = { type: 'User Endpoint', success: true, data: response };
        console.log('User endpoint test successful:', response);
      },
      error => {
        this.errorMessage = `User endpoint failed: ${error.message}`;
        console.error('User endpoint test failed:', error);
      }
    );
  }

  testWithDummyCredentials() {
    this.clearResults();
    this.loginDebug.testWithDifferentCredentials().subscribe(
      response => {
        this.testResults = { type: 'Dummy Credentials', success: true, data: response };
        console.log('Dummy credentials test successful:', response);
      },
      error => {
        this.errorMessage = `Dummy credentials test failed: ${error.message}`;
        console.error('Dummy credentials test failed:', error);
      }
    );
  }

  logAllInfo() {
    this.loginDebug.logEnvironmentConfig();
    this.loginDebug.logBrowserInfo();
    this.loginDebug.logLocalStorage();
    console.log('=== All Debug Information Logged ===');
  }

  private clearResults() {
    this.testResults = null;
    this.errorMessage = '';
  }
} 