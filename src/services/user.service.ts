import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()

export class UserService {

  constructor(
    public db: AngularFireDatabase // Inject Firebase auth service
  ) { 

  }
  

  // Sign up with email/password
  GetUserByEmail(email: string) {
    return this.db.database.ref().child('users').orderByChild('emailAddress').equalTo(email).on('value', (snapshot) => {
        if(snapshot != undefined){
            var user = snapshot.val();
            if(user){
                return user;
            }else{
                return null;
            }
        }        
      });    
  }

  // Sign in with email/password
  EmailAlreadyExist(email: string) {
    return this.db.database.ref().child('users').equalTo(email).orderByChild('date').on('value', (snapshot) => {
        var user = snapshot.val();
        if(user){
            return true;
        }else{
            return false;
        }
      }); 
  }

}