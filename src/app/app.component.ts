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
  private readonly postsSubscriptionNumber: number;
  private readonly canReadPostsSubscription: Subscription;
  private readonly canCreatePostsSubscription: Subscription;
  private readonly isFetchingPostsSubscription: Subscription;
  private canReadPosts: boolean;
  private canCreatePosts: boolean;
  private canDeletePosts = true;
  private isFetchingPosts: boolean;

  constructor(private readonly postService: PostService) {
    this.postsSubscriptionNumber = this.postService.mapToPosts(this.loadedPosts);
    this.canReadPostsSubscription = this.postService.canReadPosts.subscribe((canReadPosts: boolean) => {
      this.canReadPosts = canReadPosts;
    });

    this.canCreatePostsSubscription = this.postService.canCreatePosts.subscribe((canCreatePosts: boolean) => {
      this.canCreatePosts = canCreatePosts;
    });

    this.isFetchingPostsSubscription = this.postService.isFetchingPosts.subscribe((isFetchingPosts) => {
      this.isFetchingPosts = isFetchingPosts;
    });
  }

  ngOnDestroy(): void {
    this.postService.endSubscription(this.postsSubscriptionNumber);
    this.canReadPostsSubscription.unsubscribe();
    this.canCreatePostsSubscription.unsubscribe();
  }

  private fetchPosts(): void {
    console.log('fetch', this.loadedPosts);
  }

  private createNewPost(post: PostDto): void {
    this.postService.createNewPost(post);
  }

  private deleteAllPosts(): void {
    this.postService.deleteAlPosts();
  }
}
