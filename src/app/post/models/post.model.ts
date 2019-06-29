import {PostDto} from './post.dto';
import {FirebasePostResponseBody} from '../../firebase/models/firebase-post-response.body';

export class Post extends PostDto {
  postId: string;

  public static getPostFromPostFirebase(postDto: PostDto, firebaseResponse: FirebasePostResponseBody): Post {
    return {
      postId: firebaseResponse.name,
      ...postDto
    };
  }
}
