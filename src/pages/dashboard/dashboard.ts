import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ActionSheetController, AlertController } from 'ionic-angular';
import { UploadeventPage } from '../uploadevent/uploadevent';
import { AuditionProvider } from '../../providers/audition/audition';
import { AuditiondetailPage } from '../auditiondetail/auditiondetail';
import { GroupchatPage } from '../groupchat/groupchat';
import { GlobalVariablesProvider } from '../../providers/global-variables/global-variables';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { AdMobPro } from '@ionic-native/admob-pro';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatePipe } from '@angular/common';
import { FCM } from '@ionic-native/fcm';
import { SocialSharing } from '@ionic-native/social-sharing';

/**
 * Generated class for the DashboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
interface AdMobType {
  banner: string,
  interstitial: string
};
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})
export class DashboardPage {
  public showSlides: boolean = false;
  public auditions: any[];
  public userType: string;
  public userId: any;
  public user: any;
  public noRecordFound: boolean = false;
  public loading: boolean = true;
  public loadProgress = 0;
  public showCommentBtn: boolean = false;
  public newComment: string = undefined;
  public comments: any[] = [];
  public datePicker: Date = new Date();
  public selectedAudition: any = { isMine: false };
  public commentCount: number = 0;
  public popover: any;

  constructor(public alertController: AlertController, public admob: AdMobPro, private fcm: FCM, public actionSheetController: ActionSheetController, public db: AngularFireDatabase, private socialSharing: SocialSharing
    , public navCtrl: NavController, public navParams: NavParams, public http: HttpClient, public storage: Storage, public auditionProvider: AuditionProvider, public toastCtrl: ToastController, private globalVariables: GlobalVariablesProvider) {
    //get audition events
    this.admob.onAdDismiss().subscribe(() => { });
    this.storage.get('user').then((val) => {
      if (val) {
        this.user = val;
      }
    });
    setInterval(() => {
      if (this.loadProgress < 100)
        this.loadProgress += 1;
      else if (this.loadProgress == 100)
        this.loadProgress = 20;
      else
        clearInterval(this.loadProgress);
    }, 50);

    // preppare and load ad resource in background, e.g. at begining of game level
    if (this.admob) this.admob.prepareInterstitial({ adId: 'ca-app-pub-5466570245729953~4179509318', autoShow: false });

    // show the interstitial later, e.g. at end of game level
    if (this.admob) this.admob.showInterstitial();
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

  setReminder(audition) {
    if (this.datePicker != undefined) {
      this.fcm.getToken().then(token => {

        let reminder = {
          userId: this.userId,
          user: this.user.firstName + ' ' + this.user.lastName,
          auditionDescription: audition.auditionDescription,
          auditionTitle: audition.auditionCountry + ': ' + audition.auditionDate,
          datetime: this.datePicker,
          createdDate: new Date().toString(),
          auditionId: audition.Id,
          deviceToken: token
        }
        this.db.list('reminders').push(reminder);
      });
    }

  }

  getAuditions() {
    this.noRecordFound = false;
    this.loading = true;
    this.db.list('auditions').snapshotChanges().subscribe((snapshot) => {
      var auditions = snapshot;
      this.auditions = [];
      if (auditions != null && auditions.length > 0) {
        for (let i = 0; i < auditions.length; i++) {
          var key = auditions[i].key;
          let element = auditions[i].payload.val();
          element.isMine = false;
          element.id = key;
          let datepipe: DatePipe = new DatePipe('en-ZA')
          element.date = datepipe.transform(new Date(element.auditionDate), 'dd MMM yyyy')
          if (this.userId == element.userId)
            element.isMine = true;

          if (element.comments != undefined) {
            let comments: any[] = element.comments as any[];
            this.comments = [];
            Object.keys(comments).map(personNamedIndex => {
              let _comment = comments[personNamedIndex];
              let _datepipe: DatePipe = new DatePipe('en-ZA')
              _comment.createdDate = _datepipe.transform(new Date(_comment.createdDate), 'dd MMM yyyy h:mm');
              this.comments.push(_comment);
            });
            this.commentCount = this.comments.length;
          }

          if (element.auditionCountry === 'South Africa')
            this.auditions.push(element);
        };
        this.auditions.sort(function (a, b) {
          let f = Date.parse(b.auditionDate);
          let s = Date.parse(a.auditionDate);
          f = f / 1000;
          s = s / 1000;
          return s - f;
        })
        this.loading = false;
        this.selectedAudition = this.auditions[0];
      } else {
        this.noRecordFound = true;
        this.loading = false;
      }
    });

    /*this.auditionProvider.getAuditions().
      subscribe((response: any[]) => {
        this.auditions = [];
        response.forEach(element => {
          element.isMine = false;
          if(this.userId == element.userId)
             element.isMine = true;
          if(element.auditionCountry === 'South Africa')
            this.auditions.push(element);          
        });
        this.auditions.sort(function (a, b) {
          let f = Date.parse(b.auditionDate);
          let s = Date.parse(a.auditionDate);
          f = f / 1000;
          s = s / 1000;
          return s - f;
        })
      });*/
  }

  toTimestamp(strDate) {
    var datum = Date.parse(strDate);
    return datum / 1000;
  }

  openDetails(audition) {
    this.navCtrl.push(AuditiondetailPage, audition);
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
    this.db.list('/auditions').remove(audition.id).then((response: any) => {
      if (response) {
        this.showMessage('Event has been deleted successfull');
        this.getAuditions();
      } else {
        this.showMessage('We are unable to deleted event please try again later.');
      }
    });
  }

  addComment(audition) {
    if (this.newComment != undefined) {
      let comment = {
        userId: this.userId,
        user: this.user.firstName + ' ' + this.user.lastName,
        auditionDescription: audition.auditionDescription,
        auditionTitle: audition.auditionCountry + ': ' + audition.auditionDate,
        comment: this.newComment,
        createdDate: new Date().toString()
      }
      this.newComment = '';
      this.db.list('auditions/' + audition.id + '/comments').push(comment);
    }
  }

  editAudition(audition) {
    this.navCtrl.push(UploadeventPage, audition);
  }

  showMessage(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present(toast);
  }

  goToChat() {
    this.navCtrl.push(GroupchatPage);
  }

  onClick() {
    var admobid: AdMobType;
    admobid = { // for Windows Phone
      banner: 'ca-app-pub-234234234234324/234234234234',
      interstitial: 'ca-app-pub-234234234234324/234234234234'
    };
    this.admob.createBanner({
      adId: admobid.banner,
      position: this.admob.AD_POSITION.BOTTOM_CENTER,
      autoShow: true
    })
  }

  async presentActionSheet(audition) {
    const actionSheet = await this.actionSheetController.create({
      // header: 'Albums',
      title: 'Sharing',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'WhatsApp',
        icon: 'logo-whatsapp',
        handler: () => {
          this.shareViaWhatsApp(audition);
          actionSheet.dismiss();
        }
      }, {
        text: 'Facebook',
        icon: 'logo-facebook',
        handler: () => {
          this.shareViaFacebook(audition);
          actionSheet.dismiss();
        }
      }, {
        text: 'Instagram',
        icon: 'logo-instagram',
        handler: () => {
          this.shareViaInstagram(audition);
          actionSheet.dismiss();
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          actionSheet.dismiss();
        }
      }]
    });
    await actionSheet.present();
  }

  shareViaFacebook(audition) {
    return this.socialSharing.shareViaFacebook('Auditions Alert', audition.auditionImage, audition.auditionUrl).then(isShared => {
      return isShared;
    }).catch(error => {
      //let _error = error;
      return null;
    });
  }

  shareViaInstagram(audition) {
    // Share via email
    this.socialSharing.shareViaInstagram('Auditions Alert', audition.auditionImage).then(isShared => {
      return isShared;
    }).catch(error => {
      //let _error = error;
      return null;
    });
  }

  shareViaWhatsApp(audition) {
    // Share via email
    this.socialSharing.shareViaWhatsApp('Auditions Alert', audition.auditionImage, audition.auditionUrl).then(isShared => {
      return isShared;
    }).catch(error => {
      //let _error = error;
      return null;
    });
  }

  presentPopover() {
    const alert = this.alertController.create({
      title: 'Apply for this auidtion',
      message: 'Are you sure you want to apply for this audition?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'popover',
          handler: (blah) => {
            alert.dismiss();
          }
        }, {
          text: 'Apply',
          handler: () => {
            alert.dismiss();
          }
        }
      ]
    });

    alert.present();
  }

}
