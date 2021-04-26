import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { ForgotpasswordPage } from '../forgotpassword/forgotpassword';
import { DashboardPage } from '../dashboard/dashboard';
import { HttpClient } from '@angular/common/http';
import { GlobalVariablesProvider } from '../../providers/global-variables/global-variables';
import { Storage } from '@ionic/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';
import { AngularFireDatabase } from 'angularfire2/database';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  public user = {
    emailAddress: "",
    password: ""
  };
  public loginForm: FormGroup;
  public showError: boolean = false;
  public submitAttempt: boolean = false;
  constructor(public authenticationService: AuthenticationService,
              public db: AngularFireDatabase,
              public userService: UserService,
              public navCtrl: NavController,
               public toast: ToastController, 
               public navParams: NavParams, 
               public http: HttpClient, 
               public globalVariables: GlobalVariablesProvider, 
               public storage: Storage, 
               public loadingCtrl: LoadingController, 
               public formBuilder: FormBuilder) {

    this.loginForm = formBuilder.group({
      emailAddress: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  register() {
    this.navCtrl.push(SignupPage);
  }

  forgotPassword() {
    this.navCtrl.push(ForgotpasswordPage)
  }
  
  login(user) {
    this.submitAttempt = true;
     this.showError = false;
    if (this.loginForm.valid) {
      var loader = this.loadingCtrl.create({
        content: "Please wait..."
      });

      loader.present();    

      this.authenticationService.SignIn(this.user.emailAddress, this.user.password).then((response: any) => {
        if (response.email.toLowerCase().trim() == this.user.emailAddress.toLowerCase().trim()) {
          this.db.database.ref().child('users').orderByChild('emailAddress').equalTo(this.user.emailAddress).on('value', (snapshot) => {
            if(snapshot != undefined){              
                var user = snapshot.val();
                var svArr = Object.keys(user);
                var key = svArr[0];
               
                if(user){
                  let _user =user[svArr[0]];
                this.storage.set('loggedin', true);
                this.globalVariables.setUserId(key);
                this.storage.set('userType', _user.userType);
                this.storage.set('userId', key);
                this.storage.set('user', _user);
                this.globalVariables.setFirstTimeLogin(_user.firstLogin);               
                this.navCtrl.setRoot(DashboardPage);
                }
                  loader.dismiss();                
            }
          });
        }
        else if (response.result == false) {
          loader.dismiss();
          this.showError = true;
        }
      }), (error)=>{
        loader.dismiss();
        this.showErrors(error);
        this.showError = true;
      };
    }

  }

  
  showErrors(str) {
    let toast = this.toast.create({
        message: str,
        duration: 10000,
        position: 'bottom'
    });
    toast.present();
}
}
