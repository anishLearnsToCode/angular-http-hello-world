import {Component, OnDestroy, OnInit} from '@angular/core';
import {PostService} from './post/services/post.service';
import {PostDto} from './post/models/post.dto';
import {FirebasePostResponseBody} from './firebase/models/firebase-post-response.body';
import {PostFirebase} from './post/models/post.firebase';
import {map} from 'rxjs/operators';
import {mapToObject} from './firebase/functions/map-to-object.function';
import {Post} from './post/models/post.model';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  private loadedPosts: Array<Post> = [];
  private readonly postsSubscription: Subscription;

  constructor(private readonly postService: PostService) {
    this.postsSubscription = this.setUpPosts();
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
  }

  private setUpPosts(): Subscription {
    return this.postService.posts
      .subscribe((posts: Array<Post>) => {
        this.loadedPosts = posts;
        console.log(this.loadedPosts);
      });
  }

  private createNewPost(post: PostDto): void {
    this.postService.createNewPost(post);
  }

  onFetchPosts(): void {
    console.log('loaded posts', this.loadedPosts);
  }

  deleteAllPosts(): void {
    // Send Http request
  }
}
