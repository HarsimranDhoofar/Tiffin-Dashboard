import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { $ } from 'protractor';
import { ProviderInfo } from './provider-info.model';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  uid : any;
  private eventAuthError = new BehaviorSubject<string>("");
  eventAuthError$ = this.eventAuthError.asObservable();
  newProviderVar: any;
  constructor(
    private afAuth: AngularFireAuth,
    private db:AngularFirestore,
    private router: Router,
    private toastr: ToastrService) { }

    getUserState(){
     return this.afAuth.authState;
    }

    login(email: string, password: string){
      this.afAuth.auth.signInWithEmailAndPassword(email, password)
       .catch(error =>{
        this.eventAuthError.next(error);
       })
       .then(userCredential =>{
         if(userCredential){
           this.uid = userCredential.user.uid
           console.log(this.afAuth.auth.currentUser);
           
           this.router.navigate(['/dashboard'])
           this.toastr.success('Submitted successfull','EMP.Register')
         }
       })
    }
    newProvider(provider){
      this.afAuth.auth.createUserWithEmailAndPassword( provider.email, provider.password)
      .then( userCredential => {
         this.newProviderVar = provider

         userCredential.user.updateProfile({
          displayName: provider.serviceName
         });

         this.insertUserData(userCredential).then(() =>{
           this.router.navigate(['/dashboard'])
         });
      })
      .catch(error => {
        this.eventAuthError.next(error)
      })
    }
    insertUserData( userCredential: firebase.auth.UserCredential){
      return this.db.doc(`Providers/${userCredential.user.uid}`).set({
        uid: userCredential.user.uid,
        serviceName:this.newProviderVar.serviceName,
        address: this.newProviderVar.address,
        phone: this.newProviderVar.phone,
        email: this.newProviderVar.email,
        cuisine:"",
        deliveryRadius:"",
        meals:"",
        avatarImage:""
      })
    }
    logout(){
      return this.afAuth.auth.signOut();
    }
    getEmployees() {
      return this.db.doc(`Providers/${this.uid}`).valueChanges() as Observable<ProviderInfo[]>;
   }
}
