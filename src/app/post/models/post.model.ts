import {PostDto} from './post.dto';
import {FirebasePostResponseBody} from '../../firebase/models/firebase-post-response.body';
import {PostFirebase} from './post.firebase';

export class Post extends PostDto {
  postId: string;

  public static fromPostFirebaseResponse(postDto: PostDto, firebaseResponse: FirebasePostResponseBody): Post {
    return {
      postId: firebaseResponse.name,
      ...postDto
    };
  }

  public static getPostFromFirebasePost(firebasePost: PostFirebase): Post {
    return {
      postId: Object.keys(PostFirebase)[0],
      ...firebasePost[0]
    };
  }
}
