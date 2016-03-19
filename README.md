# ELI5ience

- [Website Link][website]
- [Heroku link][heroku]

A science focused app for annotating difficult to understand articles. Based on RapGenius.

ELI5ience was built with a Ruby on Rails backend, and a React.js frontend.

[heroku]: eli5ience.herokuapp.com
[website]: http://www.eli5ience.com/

##Main Features
- Annotate articles by selecting text on the article page
  ![Annotating articles](./ELI5Annotation.png)
  - Protections to prevent users from annotating over existing annotations. Screenshot and code demonstrating overlap protection below.
  ![Overlap Protection](./ELI5Overlap.png)
  ```javascript
    uniqueSelection: function(text, startIdx) {
      var endIdx = startIdx + text.length;
      var annStartIdx;
      var annEndIdx;
      for (var i = 0; i < this.state.article.annotations.length; i++) {
        annStartIdx = this.state.article.annotations[i].selection_start;
        annEndIdx = annStartIdx + this.state.article.annotations[i].selection_length;
        if (
            (startIdx >= annStartIdx && startIdx <= annEndIdx) ||
            (endIdx >= annStartIdx && endIdx <= annEndIdx) ||
            (startIdx <= annStartIdx && endIdx >= annEndIdx)
          ){
              return false;
          }
      }
      return true;
    },
  ```
- Article pages show all existing annotations as links that open in-page
- Post and delete comments on articles
- Post and delete improvements on annotations
- User view changes based on login status, will show delete/create buttons only when logged in. Code below creates button or login heads-up based on current session:
```javascript
  postBtn: function(session) {
    if (session.length === 0) {
      return <div className='errPost'><a href='./session/new'>Login to post a comment!</a></div>;
    } else {
      return (
        <input className="btn btn-xs btn-success comment-post-btn"
          type="submit"
          value="Post"/>
      );
    }
  },
```
  ![Annotating articles](./ELI5Login.png)
  ![Annotating articles](./ELI5Allow.png)
- Create and delete articles
- Sign Up/Login account management with user profiles



##Additional Features
- Custom authentication in rails
- Session management on backend with frontend reference for tailored UX
![Annotating articles](./ELI5Allow.png)
- Twitter bootstrap used for styling.


#[Original Design Docs][ogdocs]

[ogdocs]: ./ogdocs.md
