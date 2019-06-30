import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEventType} from '@angular/common/http';
import {PostDto} from '../models/post.dto';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {PostFirebase} from '../models/post.firebase';
import {FirebasePostResponseBody} from '../../firebase/models/firebase-post-response.body';
import {map, tap} from 'rxjs/operators';
import {mapToObject} from '../../firebase/functions/map-to-object.function';
import {Post} from '../models/post.model';
import {environment} from '../../../environments/environment';
// @ts-ignore
const HttpStatusCodes = require('http-status-codes');


@Injectable()
export class PostService implements OnDestroy {
  private readonly posts$: BehaviorSubject<Array<Post>>;
  private readonly postStream$: BehaviorSubject<Post>;
  private readonly postsSubscribers: Array<Array<Post>> = [];
  private readonly canReadPosts$: BehaviorSubject<boolean>;
  private readonly canCreatePosts$: BehaviorSubject<boolean>;
  private readonly isFetchingPosts$: BehaviorSubject<boolean>;
  private postsSubscription: Subscription;
  private firebasePostsSubscription: Subscription;

  public get posts(): Observable<Array<Post>> {
    return this.posts$.asObservable();
  }

  public get canReadPosts(): Observable<boolean> {
    return this.canReadPosts$.asObservable();
  }

  public get canCreatePosts(): Observable<boolean> {
    return this.canCreatePosts$.asObservable();
  }

  public get isFetchingPosts(): Observable<boolean> {
    return this.isFetchingPosts$.asObservable();
  }

  constructor(private readonly https: HttpClient) {
    this.posts$ = new BehaviorSubject<Array<Post>>([]);
    this.canReadPosts$ = new BehaviorSubject(true);
    this.canCreatePosts$ = new BehaviorSubject(true);
    this.isFetchingPosts$ = new BehaviorSubject(true);
    this.getAllPosts();
    this.manageExternalPostSubscribers();

    this.firebasePostsSubscription = https.get(environment.POSTS_DB_URL, {
      observe: 'events'
    })
      .pipe(
        tap(event => {
          console.log('get all event', event);
          switch (event.type) {
            case HttpEventType.DownloadProgress: return console.log('download progress');
            case HttpEventType.UploadProgress: return console.log('upload progress');
            case HttpEventType.Response: return console.log('response');
            case HttpEventType.ResponseHeader: return console.log('response header');
            case HttpEventType.Sent: return console.log('sent');
            case HttpEventType.User: return console.log('user');
          }
        })
      )
      .subscribe(
        (posts) => {
        },
        (error) => {
          console.log('getall error', error);
        }
      );
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
    this.firebasePostsSubscription.unsubscribe();
  }

  private manageExternalPostSubscribers(): void {
    this.postsSubscription = this.posts.subscribe((posts: Post[]) => {
      for (const subscriber of this.postsSubscribers) {
        subscriber.splice(0);
        subscriber.push(...posts);
      }
    });
  }

  private getAllPosts(): void {
    this.https.get<Array<PostFirebase>>(environment.POSTS_DB_URL)
      .pipe(
        map((firebasePosts: Array<PostFirebase>): Array<Post> => {
          return mapToObject<PostDto>(firebasePosts);
        })
      )
      .subscribe((posts: Array<Post>) => {
        this.posts$.next(posts);
        this.canReadPosts$.next(true);
        this.isFetchingPosts$.next(false);
      }, (error: HttpErrorResponse) => {
        console.log(error);
        if (error.status === HttpStatusCodes.UNAUTHORIZED) {
          this.canReadPosts$.next(false);
        }
      })
    ;

    this.isFetchingPosts$.next(true);
  }

  public mapToPosts(referenceArray: Array<Post>): number {
    if (this.canReadPosts$.value) {
      return this.postsSubscribers.push(referenceArray);
    }

    return null;
  }

  public endSubscription(subscriberNumber: number): void {
    this.postsSubscribers.splice(subscriberNumber, 1);
  }

  public createNewPost(post: PostDto): void {
    this.https.post<FirebasePostResponseBody> (environment.POSTS_DB_URL, post)
      .subscribe(() => {
        this.getAllPosts();
      }, (error: HttpErrorResponse) => {
        console.log(error);
        if (error.status === HttpStatusCodes.UNAUTHORIZED) {
          this.canCreatePosts$.next(false);
        }
      });
  }

  public deleteAlPosts() {
    this.https
      .delete(environment.POSTS_DB_URL, {
        observe: 'events'
      })
      .pipe(
        tap(event => {
          console.log(event);
          switch (event.type) {
            case HttpEventType.Sent: return;
            case HttpEventType.Response: return;
          }
        })
      )
      .subscribe(() => {
      this.getAllPosts();
    });
  }
}
