import {NgModule} from '@angular/core';
import {PostService} from './services/post.service';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [
    HttpClientModule
  ],
  providers: [
    PostService
  ],
  exports: []
})
export class PostModule { }
