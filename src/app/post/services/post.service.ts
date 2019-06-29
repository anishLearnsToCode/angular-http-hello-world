import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PostDto } from '../models/post.dto';
import {BehaviorSubject, observable, Observable, ObservedValuesFromArray, Observer, Subscriber, Subscription} from 'rxjs';
import {PostFirebase} from '../models/post.firebase';
import {FirebasePostResponseBody} from '../../firebase/models/firebase-post-response.body';
import {map} from 'rxjs/operators';
import {mapToObject} from '../../firebase/functions/map-to-object.function';
import {Post} from '../models/post.model';


@Injectable()
export class PostService {
  private readonly URL_ENDPOINT = 'https://recipe-app-5e74e.firebaseio.com/post.json';
  private readonly posts$: BehaviorSubject<Array<Post>>;
  private readonly postStream$: BehaviorSubject<Post>;

  public get posts(): Observable<Array<Post>> {
    return this.posts$.asObservable();
  }

  constructor(private readonly https: HttpClient) {
    this.posts$ = new BehaviorSubject<Array<Post>>([]);
    this.postStream$ = new BehaviorSubject<Post>(new Post());
    this.getAllPosts();
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

  public createNewPost(post: PostDto): Subscription {
    return this.https.post<FirebasePostResponseBody> (this.URL_ENDPOINT, post)
      .subscribe((response: FirebasePostResponseBody) => {
        this.posts$.value.push(Post.getPostFromPostFirebase(post, response));
        this.posts$.next(this.posts$.value);
      }, (error) => {
        console.error(error);
      });
  }

  // public deletePost(postId: string): Observable<FirebasePostResponseBody> {
  //   return this.https.delete(this.URL_ENDPOINT, postId);
  // }
}
