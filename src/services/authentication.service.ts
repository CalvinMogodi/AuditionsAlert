import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()

export class AuthenticationService {

  constructor(
    public afAuth: AngularFireAuth // Inject Firebase auth service
  ) { 

  }

  // Sign up with email/password
  SignUp(email: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        console.log(result.user)
        return true;
      }).catch((error) => {
        return false;
      })
  }

  // Sign in with email/password
  SignIn(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((result) => {
         return result;
      }).catch((error) => {
        return error;
      })
  }

}