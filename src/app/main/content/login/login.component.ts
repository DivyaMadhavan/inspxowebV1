import { Component, OnInit } from '@angular/core';
import { AbstractControl,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon"; 
import {
    AuthService,
    FacebookLoginProvider,
    GoogleLoginProvider
} from 'angular5-social-login';
import { HttpClient} from '@angular/common/http';
import { Configuration } from '../../../app.constants';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations : fuseAnimations
})

export class LoginComponent implements OnInit {
  private Domainurl: string; 
  private Domainwithhttpurl: string;
  loginForm: FormGroup;
  loginFormErrors: any;
  result:string;
  constructor(    
      private fuseConfig: FuseConfigService,
      private formBuilder: FormBuilder,
      private router :Router,private socialAuthService: AuthService,private http: HttpClient,
      private _configuration: Configuration
  )
{
      this.Domainurl = _configuration.ServerWithdomainAPI;
      this.Domainwithhttpurl = _configuration.ServerWithhttpApiUrl;
      this.fuseConfig.setConfig({
          layout: {
              navigation: 'none',
              toolbar   : 'none',
              footer    : 'none'
          }
      });
      this.loginFormErrors = {
         
          password: {},
          username :{},
          accountid:{}
      };
  }
  ngOnInit()
  {
    this.result=null;
    console.log("event listening");
    console.log(this.Domainwithhttpurl);
      this.loginForm = this.formBuilder.group({        
          password: ['', Validators.required],
          username: ['', Validators.required],
          accountid: ['', Validators.required]       
      }); 

      this.loginForm.valueChanges.subscribe(() => {
          this.onLoginFormValuesChanged();
      });
  }
  onLoginFormValuesChanged()
  {
      for ( const field in this.loginFormErrors )
      {
          if ( !this.loginFormErrors.hasOwnProperty(field) )
          {
              continue;
          }
          // Clear previous errors
          this.loginFormErrors[field] = {};
          // Get the control
          const control = this.loginForm.get(field);

          if ( control && !control.valid )
          {
              this.loginFormErrors[field] = control.errors;
          }
      }
  }
  
  loginclick() {
    this.result='';
    //this.errormessage='';
      console.log(this.Domainurl);
      let username = this.loginForm.value.username;
      let password = this.loginForm.value.password;
      let accountid = this.loginForm.value.accountid;
      let url="https://"+accountid+'.'+"ptetc.in:8080/user/logincheck/";
      this.http.get(url, {         
                params: {
                    username: username,
                    password: password,
                    accountid: accountid,
                  } 
             }).subscribe(data => {  
                
                 let logindetails = JSON.stringify(data);
                 let userdetails =JSON.parse(logindetails);
                 if(userdetails.length != 0)
                 {
                    //console.log("value occured");
                    let userdet =JSON.stringify(userdetails[0]);
                    let dataval =JSON.parse(userdet);
                    //console.log(dataval.firstname); 
                    sessionStorage.setItem("accountid",dataval.accountid);
                    sessionStorage.setItem("id",dataval.id);
                    sessionStorage.setItem("firstname",dataval.firstname);
                    sessionStorage.setItem("lastname",dataval.lastname);
                    sessionStorage.setItem("rolename",dataval.rolename);
                    sessionStorage.setItem("permission",dataval.permission);
                    sessionStorage.setItem("securitycode",dataval.securitycode);
                   // console.log(dataval.accountid); 
                    this.router.navigate(['/Dashboard']);  
                 }  
                 else
                 {
                     // console.log("nul value");
                     this.result = "Account was not Activated";
                 } 
          },
          err => {
            let logindetails = JSON.stringify(err);
            let errormessage = JSON.parse(logindetails);
            this.result = errormessage.error.detail;           
            console.log(errormessage);
          })
  
  }
  clickMe(event)
  {
    console.log('clicking');
    if (this.loginForm.valid) {
        console.log(this.loginForm);
        //console.log(event.password);
        console.log('form submitted');
      } else {
        console.log('form was not submitted');      
      }  
}
  public socialSignIn(socialPlatform : string) {
    //console.log("ClickEvent socialmedia");
    let socialPlatformProvider;
    if(socialPlatform == "facebook"){
        //console.log("facebook socialmedia");
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    }else if(socialPlatform == "google"){
        //console.log("google socialmedia");
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }
    
    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
       console.log(socialPlatform+" sign in data : " , userData);
        //Now sign-in with userData
        this.http.get(this.Domainwithhttpurl+'user/sociallogin/', {         
            params: {
                socialtype: "facebook",
                socialtypetoken: "XXXxx"              
              } 
         }).subscribe(data => { 
             let logindetails1 = JSON.stringify(data);
             let userdetails1 =JSON.parse(logindetails1); 
             console.log(userdetails1);
             this.router.navigate(['/SocialRegister']); 
      },
      err => {
        console.log("Error occured");
      })
        //this.router.navigate(['/Dashboard']);
      }
    );
  }
}