import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '../../database/auth/auth.service';
import { ProviderInfo } from '../../database/auth/provider-info.model';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import { UploadServiceService } from '../../database/uploadService/upload-service.service';
import { AngularFireStorageReference, AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { map, finalize } from 'rxjs/operators';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';
import { ViewChild, ElementRef} from '@angular/core';
import * as bootstrap from "bootstrap";
import * as $ from "jquery";
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  public data:any=[]
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadProgress: Observable<number>;
  prov: any = []
  @ViewChild('closeAddExpenseModal',{static: false}) closeAddExpenseModal: ElementRef;

  constructor(private auth: AuthService,
    private uploadService: UploadServiceService,
    private afStorage: AngularFireStorage,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    ) { }

  ngOnInit() {
  
    this.auth.getEmployees().subscribe(prov =>{
      console.log(prov)
      this.prov = prov ;
      console.log(this.prov)
    })
  }
  editProviderFunc(form){
    console.log(form.value)
    this.auth.updateProvider(form.value);
  }
  imageChangedEvent: any = '';
  uploadimage:any ='';
  croppedImage: any = '';
  
  fileChangeEvent(event: any): void {
    this.uploadimage = event.target.files[0];
      this.imageChangedEvent = event;
      
  }
  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
      
  }
  imageLoaded() {
      // show cropper
  }
  cropperReady() {
      // cropper ready
  }
  loadImageFailed() {
      // show message
  }

  UploadProfileImgFunc(){
 
   // $(this.closeAddExpenseModal.nativeElement).modal('hide');
   // const randomId = Math.random().toString(36).substring(2);
    // // create a reference to the storage bucket location
    // this.closeAddExpenseModal.nativeElement.click();
    this.ref = this.afStorage.ref(`Providers/${this.storage.get("userId")}`);
    // the put method creates an AngularFireUploadTask
    // and kicks off the upload
    
    this.task =this.ref.put(this.uploadimage);
    
    // AngularFireUploadTask provides observable
    // to get uploadProgress value
    this.uploadProgress = this.task.snapshotChanges()
    .pipe(map(s => (s.bytesTransferred / s.totalBytes) * 100));

    this.task.snapshotChanges().pipe(
      finalize(() => {
        this.ref.getDownloadURL().subscribe(url => {
          console.log(url);
          this.auth.ProfilePictureDataUpdate(url); // <-- do what ever you want with the url..
        });
      })
    ).subscribe();

    
    
  }
  getFromLocal(key): void {
    console.log('recieved= key:' + key);
    this.data= this.storage.get(key);
    console.log(this.data);
   }
}
