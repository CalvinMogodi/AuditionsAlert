import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { UploadeventPage } from '../uploadevent/uploadevent';
import { AuditionProvider } from '../../providers/audition/audition';
import { AuditiondetailPage } from '../auditiondetail/auditiondetail';
import { GlobalVariablesProvider } from '../../providers/global-variables/global-variables';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { GroupchatPage } from '../groupchat/groupchat';

/**
 * Generated class for the OtherDashboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-other-dashboard',
  templateUrl: 'other-dashboard.html',
})
export class OtherDashboardPage {

 public showSlides: boolean = false;
  public auditions: any[];
  public userType: string;
  public userId: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: HttpClient, public storage: Storage, public auditionProvider: AuditionProvider, public toastCtrl: ToastController, private globalVariables: GlobalVariablesProvider) {
    //get audition events
    this.userId = this.globalVariables.getUserId();
    this.storage.get('userType').then((val) => {
      if (val) {
        this.userType = val;
      }
    });
    this.storage.get('userId').then((val) => {
      if (val) {
        this.userId = val;
        this.globalVariables.setUserId(val);
      }
    });
    this.getAuditions();
  }

  getAuditions() {
    this.auditionProvider.getAuditions().
      subscribe((response: any[]) => {
        this.auditions = [];
        response.forEach(element => {
          element.isMine = false;
          if(this.userId == element.userId)
             element.isMine = true;
          if(element.auditionCountry !== 'South Africa' && element.auditionCountry !== 'Nigeria')
            this.auditions.push(element);          
        });
        this.auditions.sort(function (a, b) {
          let f = Date.parse(b.auditionDate);
          let s = Date.parse(a.auditionDate);
          f = f / 1000;
          s = s / 1000;
          return s - f;
        })
      });
  }

  toTimestamp(strDate) {
    var datum = Date.parse(strDate);
    return datum / 1000;
  }

  goToChat() {
    this.navCtrl.push(GroupchatPage);
  }

  openDetails(audition){
    this.navCtrl.push(AuditiondetailPage,audition);
  }

  timeConverter(datetime) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = datetime.getFullYear();
    var month = months[datetime.getMonth()];
    var date = datetime.getDate();
    var time = date + ' ' + month + ' ' + year;
    return time;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DashboardPage');
  }

  openUpload() {
    this.navCtrl.push(UploadeventPage);
  } 

  deleteAuditions(audition) {
    this.http.post("http://197.242.149.23/api/deleteAudition", { auditionId: audition.auditionId }).subscribe((response: any) => {
      if (response) {
        this.showMessage('Event has been deleted successfull');
        this.getAuditions();
      } else {
        this.showMessage('We are unable to deleted event please try again later.');
      }
    });
  }

  editAudition(audition) {
    this.navCtrl.push(UploadeventPage,audition);
  }

  showMessage(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present(toast);
  }


}
