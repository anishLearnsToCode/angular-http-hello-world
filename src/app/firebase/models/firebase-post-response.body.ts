import {PostFirebase} from '../../post/models/post.firebase';
import {PostDto} from '../../post/models/post.dto';
import {Post} from '../../post/models/post.model';

export class FirebasePostResponseBody {
  name: string;

  public mapToFirebasePost(post: PostDto): PostFirebase {
    return {
      [this.name]: post
    };
  }

  public mapToPost(post: PostDto): Post {
    return {
      ...post,
      postId: this.name
    };
  }
}
