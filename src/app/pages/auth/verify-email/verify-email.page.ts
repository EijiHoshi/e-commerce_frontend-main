import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class VerifyEmailPage implements OnInit, OnDestroy {
  email: string = '';
  inputEmail: string = '';
  otpCode: string[] = ['', '', '', '', '', ''];
  loading: boolean = false;
  resendLoading: boolean = false;
  isVerified: boolean = false;
  isError: boolean = false;
  isPending: boolean = false;
  errorMessage: string = '';
  countdown: number = 0;
  private countdownSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.isPending = params['pending'] === 'true';

      // RESET STATE setiap kali halaman dibuka/parameter berubah
      this.otpCode = ['', '', '', '', '', ''];
      this.loading = false;
      this.resendLoading = false;
      this.countdown = 0;
      this.isVerified = false;
      this.isError = false;
      this.errorMessage = '';
      this.inputEmail = '';

      if (this.isPending && this.email) {
        this.sendOtp();
      }
    });
  }

  ngOnDestroy() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  setEmail() {
    if (this.inputEmail && this.validateEmail(this.inputEmail)) {
      this.email = this.inputEmail;

      // RESET STATE saat user input email baru
      this.otpCode = ['', '', '', '', '', ''];
      this.loading = false;
      this.resendLoading = false;
      this.countdown = 0;
      this.isVerified = false;
      this.isError = false;
      this.errorMessage = '';

      this.sendOtp();
    } else {
      this.showToast('Masukkan email yang valid', 'danger');
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async sendOtp() {
    if (!this.email) {
      this.showToast('Email tidak boleh kosong', 'danger');
      return;
    }

    this.loading = true;
    try {
      await this.authService.sendVerificationEmail(this.email).toPromise();
      this.showToast('Kode verifikasi telah dikirim ke email Anda', 'success');
      this.startCountdown();
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      this.showToast(error.error?.message || 'Gagal mengirim kode verifikasi', 'danger');
    } finally {
      this.loading = false;
    }
  }

  onOtpInput(index: number, event: any) {
    const value = event.target.value;
    if (value && index < 5) {
      // Auto focus ke input berikutnya
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onOtpKeydown(index: number, event: any) {
    if (event.key === 'Backspace' && !this.otpCode[index] && index > 0) {
      // Auto focus ke input sebelumnya saat backspace
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  isOtpComplete(): boolean {
    return this.otpCode.every(digit => digit !== '');
  }

  async verifyEmail() {
    const otp = this.otpCode.join('');
    if (otp.length !== 6) {
      this.showToast('Masukkan kode 6 digit', 'danger');
      return;
    }

    this.loading = true;
    try {
      const response = await this.authService.verifyEmail(this.email, otp).toPromise();
      this.isVerified = true;
      this.showToast('Email berhasil diverifikasi!', 'success');
    } catch (error: any) {
      console.error('Error verifying email:', error);
      this.showToast(error.error?.message || 'Kode verifikasi salah', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async resendEmail() {
    this.resendLoading = true;
    try {
      await this.authService.sendVerificationEmail(this.email).toPromise();
      this.showToast('Kode verifikasi baru telah dikirim', 'success');
      this.startCountdown();
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      this.showToast(error.error?.message || 'Gagal mengirim ulang kode', 'danger');
    } finally {
      this.resendLoading = false;
    }
  }

  startCountdown() {
    this.countdown = 60;
    const timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }
}

