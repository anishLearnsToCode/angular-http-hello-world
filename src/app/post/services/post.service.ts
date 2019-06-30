import {Injectable, OnDestroy} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PostDto } from '../models/post.dto';
import {BehaviorSubject, observable, Observable, ObservedValuesFromArray, Observer, Subscriber, Subscription} from 'rxjs';
import {PostFirebase} from '../models/post.firebase';
import {FirebasePostResponseBody} from '../../firebase/models/firebase-post-response.body';
import {map} from 'rxjs/operators';
import {mapToObject} from '../../firebase/functions/map-to-object.function';
import {Post} from '../models/post.model';


@Injectable()
export class PostService implements OnDestroy {
  private readonly URL_ENDPOINT = 'https://recipe-app-5e74e.firebaseio.com/post.json';
  private readonly posts$: BehaviorSubject<Array<Post>>;
  private readonly postStream$: BehaviorSubject<Post>;
  private readonly postsSubscribers: Array<Array<Post>> = [];
  private readonly postsSubscription: Subscription;
  private readonly postSubscriptions: Array<Subscription> = [];

  public get posts(): Observable<Array<Post>> {
    return this.posts$.asObservable();
  }

  constructor(private readonly https: HttpClient) {
    this.posts$ = new BehaviorSubject<Array<Post>>([]);
    this.postStream$ = new BehaviorSubject<Post>(new Post());
    this.getAllPosts();

    this.postsSubscription = this.posts.subscribe((posts: Post[]) => {
      for (const subscriber of this.postsSubscribers) {
        console.log('subscriber', subscriber);
        subscriber.splice(0);
        subscriber.push(...posts);
      }
    });
  }

  private getAllPosts(): void {
    this.https.get<Array<PostFirebase>>(this.URL_ENDPOINT)
      .pipe(
        map((firebasePosts: Array<PostFirebase>): Array<Post> => {
          return mapToObject<PostDto>(firebasePosts);
        })
      )
      .subscribe((posts: Array<Post>) => {
        this.posts$.next(posts);
      });
  }

  public managePosts(referenceArray: Array<Post>): number {
    // return this.postSubscriptions.push(this.posts.subscribe((posts: Array<Post>) => {
    //   console.log(posts);
    //   referenceArray.splice(0);
    //   referenceArray.push(...posts);
    // }));

    return this.postsSubscribers.push(referenceArray);
  }

  public endSubscription(subscriberNumber: number): void {
    this.postsSubscribers.splice(subscriberNumber, 1);
  }

  public createNewPost(post: PostDto): Subscription {
    return this.https.post<FirebasePostResponseBody> (this.URL_ENDPOINT, post)
      .subscribe((response: FirebasePostResponseBody) => {
        this.posts$.value.push(Post.getPostFromPostFirebaseResponse(post, response));
        this.posts$.next(this.posts$.value);
      }, (error) => {
        console.error(error);
      });
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
  }

  // public deletePost(postId: string): Observable<FirebasePostResponseBody> {
  //   return this.https.delete(this.URL_ENDPOINT, postId);
  // }
}
