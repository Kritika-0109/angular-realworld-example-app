import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Article, ArticlesService } from '../core';

@Component({
  selector: 'app-editor-page',
  templateUrl: './editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent implements OnInit {
  article: Article = {} as Article;
  articleForm: FormGroup;
  tagField = new FormControl();
  errors: Object = {};
  isSubmitting = false;

  constructor(
    private articlesService: ArticlesService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    // use the FormBuilder to create a form group
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      body: ['', Validators.required],
      coverImageUrl: [''],
    });

    // Initialize tagList as empty array
    this.article.tagList = [];

    // Optional: subscribe to value changes on the form
    // this.articleForm.valueChanges.subscribe(value => this.updateArticle(value));
  }

  ngOnInit() {
    // If there's an article prefetched, load it
    this.route.data.subscribe((data: { article: Article }) => {
      if (data.article) {
        this.article = {
          ...data.article,
          tagList: data.article.tagList ? [...data.article.tagList] : []
        };
        this.articleForm.patchValue({
          title: data.article.title,
          description: data.article.description,
          body: data.article.body,
          coverImageUrl: data.article.coverImageUrl ?? ''
        });
        this.cd.markForCheck();
      }
    });
  }

  trackByFn(index: number, item: string) {
    return index;
  }

  addTag() {
    const tag = this.tagField.value?.trim();
    if (tag) {
      if (!Array.isArray(this.article.tagList)) {
        this.article.tagList = [];
      }
      if (!this.article.tagList.includes(tag)) {
        this.article.tagList.push(tag);
      }
    }
    // clear the input
    this.tagField.reset('');
  }

  removeTag(tagName: string) {
    this.article.tagList = this.article.tagList.filter(tag => tag !== tagName);
  }

  submitForm() {
    this.isSubmitting = true;

    // update the model
    this.updateArticle(this.articleForm.value);

    // post the changes
    this.articlesService.save(this.article).subscribe(
      article => {
        this.router.navigateByUrl('/article/' + article.slug);
        this.cd.markForCheck();
      },
      err => {
        this.errors = err;
        this.isSubmitting = false;
        this.cd.markForCheck();
      }
    );
  }

  updateArticle(values: Partial<Article>) {
    Object.assign(this.article, values);
  }  
}
